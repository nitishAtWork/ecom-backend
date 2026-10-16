// const mongoose = require("mongoose");

const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");
const {
    sendOrderReceivedEmailServ,
    sendAdminNewOrderEmail,
    sendOrderStatusUpdateEmailServ,
} = require("./orderEmail.service");

const {
    createUroPayOrder,
} = require("./uropay.service");

const {
    generateOrderNumber,
} = require("../utils/order");

const sendOrderReceivedEmail = async ({
    user,
    order,
}) => {
    try {
        if (!user?.email) {
            console.warn(
                "Order email skipped: user has no email."
            );

            return;
        }

        await sendOrderReceivedEmailServ({
            email: user.email,

            name:
                order.shippingAddress?.name ||
                user.name ||
                "Customer",

            order,
        });

        // console.log(
        //     `Order email sent: ${order.orderNumber} → ${user.email}`
        // );
    } catch (error) {
        /*
         * Email failure must NOT affect
         * successful order creation.
         */
        console.error(
            `Failed to send order email for ${order.orderNumber}:`,
            error
        );
    }
};

const createOrder = async ({
    userId,
    shippingAddress,
    paymentMethod,
}) => {
    if (!["COD", "ONLINE"].includes(paymentMethod)) {
        const error = new Error("Invalid payment method.");
        error.statusCode = 400;
        throw error;
    }

    const user = await User.findById(userId).lean();

    if (!user || !user.isActive || user.deletedAt) {
        const error = new Error(
            "User account is no longer available."
        );
        error.statusCode = 401;
        throw error;
    }

    const cart = await Cart.findOne({ user: userId });

    if (!cart || !cart.items.length) {
        const error = new Error("Your cart is empty.");
        error.statusCode = 400;
        throw error;
    }

    const orderItems = [];
    const reservedStock = [];

    let subtotal = 0;
    let createdOrder = null;
    let stockRestored = false;
    let providerOrderCreated = false;
    let providerOutcomeUnknown = false;

    // Restore reserved stock only once in this invocation.
    const restoreReservedStock = async () => {
        if (stockRestored) return;

        for (const reserved of reservedStock) {
            await Product.updateOne(
                { _id: reserved.productId },
                {
                    $inc: {
                        stock: reserved.quantity,
                    },
                }
            );
        }

        stockRestored = true;

        // If your Order schema has stockRestoredAt, persist it here.
        if (createdOrder && createdOrder.stockRestoredAt !== undefined) {
            createdOrder.stockRestoredAt = new Date();
            await createdOrder.save();
        }
    };

    // Clear only after the order/payment-session creation is successful.
    const clearCart = async () => {
        cart.items = [];
        await cart.save();
    };

    // Order-creation notifications (COD or pending online order).
    // For ONLINE orders, do not call this until payment succeeds.
    const sendOrderEmailsSafely = async (order) => {
        try {
            await sendOrderReceivedEmail({ user, order });
        } catch (error) {
            console.error(
                "Customer order notification failed:",
                error
            );
        }

        try {
            await sendAdminNewOrderEmail({
                order,
                customer: user,
            });
        } catch (error) {
            console.error(
                "Admin order notification failed:",
                error
            );
        }
    };

    try {
        // 1. Reserve stock atomically and snapshot product information.
        for (const cartItem of cart.items) {
            const product = await Product.findOneAndUpdate(
                {
                    _id: cartItem.product,
                    isActive: true,
                    stock: { $gte: cartItem.quantity },
                },
                {
                    $inc: {
                        stock: -cartItem.quantity,
                    },
                },
                { returnDocument: "after" }
            );

            if (!product) {
                const error = new Error(
                    "One or more products are unavailable or out of stock."
                );
                error.statusCode = 400;
                throw error;
            }

            reservedStock.push({
                productId: product._id,
                quantity: cartItem.quantity,
            });

            const price = Number(product.price);
            const quantity = Number(cartItem.quantity);
            const itemSubtotal = Number(
                (price * quantity).toFixed(2)
            );

            subtotal += itemSubtotal;

            orderItems.push({
                product: product._id,
                name: product.name,
                sku: product.sku,
                img: product.img || "",
                price,
                quantity,
                subtotal: itemSubtotal,
            });
        }

        subtotal = Number(subtotal.toFixed(2));

        const shippingAmount = 0;
        const discountAmount = 0;

        const totalAmount = Number(
            (
                subtotal +
                shippingAmount -
                discountAmount
            ).toFixed(2)
        );

        // 2. Create the local order.
        createdOrder = await Order.create({
            orderNumber: generateOrderNumber(),
            user: userId,
            items: orderItems,
            shippingAddress,
            subtotal,
            shippingAmount,
            discountAmount,
            totalAmount,
            paymentMethod,
            paymentProvider:
                paymentMethod === "ONLINE" ? "UROPAY" : "COD",
            paymentStatus: "PENDING",
            orderStatus:
                paymentMethod === "COD" ? "CONFIRMED" : "PENDING",
        });

        // 3. COD: clear cart and send order notifications immediately.
        if (paymentMethod === "COD") {
            await clearCart();

            // COD order notification: send customer + admin emails.
            await sendOrderEmailsSafely(createdOrder);

            return createdOrder;
        }

        // 4. ONLINE: create exactly one UroPai payment session.
        let providerOrder;

        try {
            providerOrder = await createUroPayOrder({
                tenantOrderRef: createdOrder.orderNumber,
                amount: createdOrder.totalAmount,
                customerEmail: user.email,
                customerPhone: createdOrder.shippingAddress.phone,
                returnUrl: process.env.UROPAY_RETURN_URL,
                webhookUrl: process.env.UROPAY_WEBHOOK_URL,
            });

            providerOrderCreated = true;
        } catch (paymentError) {
            const status =
                paymentError.response?.status ??
                paymentError.statusCode;

            console.error("UroPai payment initialization error:", {
                message: paymentError.message,
                status,
                response: paymentError.response?.data,
                code: paymentError.code,
                orderReference: createdOrder.orderNumber,
            });

            /*
             * Network failures, timeouts and provider 5xx responses
             * may leave the provider order created but its response lost.
             * Preserve stock and cart until the outcome is reconciled.
             */
            providerOutcomeUnknown =
                !status ||
                status === 408 ||
                status >= 500;

            if (providerOutcomeUnknown) {
                const error = new Error(
                    `Payment initialization could not be confirmed. ` +
                    `Do not place another order yet. Contact support ` +
                    `with order reference ${createdOrder.orderNumber}.`
                );

                error.statusCode = 502;
                error.cause = paymentError;
                throw error;
            }

            // Definitive rejection: mark the local order failed.
            createdOrder.paymentStatus = "FAILED";
            createdOrder.orderStatus = "CANCELLED";
            createdOrder.cancelledAt = new Date();
            await createdOrder.save();

            await restoreReservedStock();

            const error = new Error(
                "Unable to start online payment. Your order was cancelled. Please try again."
            );
            error.statusCode = 502;
            error.cause = paymentError;
            throw error;
        }

        // 5. Validate the minimum required provider response fields.
        if (
            !providerOrder?.id ||
            !providerOrder?.openUrl ||
            !providerOrder?.tenantOrderRef
        ) {
            /*
             * The provider may have created a session despite returning
             * an incomplete response. Preserve stock and cart for review.
             */
            providerOutcomeUnknown = true;

            const error = new Error(
                `UroPai returned incomplete payment-session details. ` +
                `Contact support with order reference ${createdOrder.orderNumber}.`
            );
            error.statusCode = 502;
            throw error;
        }

        // 6. Persist provider details before clearing the cart.
        createdOrder.paymentProvider = "UROPAY";
        createdOrder.paymentOrderId = providerOrder.id;
        createdOrder.paymentOrderRef = providerOrder.tenantOrderRef;
        createdOrder.paymentCheckoutUrl = providerOrder.openUrl;
        createdOrder.paymentStatus = "PENDING";
        createdOrder.orderStatus = "PENDING";

        await createdOrder.save();

        // 7. Clear the cart after the payment session has been saved.
        await clearCart();

        return createdOrder;
    } catch (error) {
        /*
         * Restore stock only when no provider session was created and
         * the provider outcome is known. Never release stock for an
         * ambiguous provider response without reconciliation.
         */
        if (
            !stockRestored &&
            !providerOrderCreated &&
            !providerOutcomeUnknown
        ) {
            try {
                await restoreReservedStock();
            } catch (restoreError) {
                console.error(
                    "CRITICAL: Failed to restore reserved stock:",
                    restoreError
                );
            }
        }

        throw error;
    }
};

const getUserOrders = async ({
    userId,
    page = 1,
    limit = 10,
}) => {
    const skip =
        (page - 1) * limit;

    const [orders, total] =
        await Promise.all([
            Order.find({
                user: userId,
            })
                .sort({
                    createdAt: -1,
                })
                .skip(skip)
                .limit(limit)
                .lean(),

            Order.countDocuments({
                user: userId,
            }),
        ]);

    return {
        orders,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(
                total / limit
            ),
        },
    };
};

const getUserOrderById = async ({
    userId,
    orderId,
}) => {
    const order =
        await Order.findOne({
            _id: orderId,
            user: userId,
        }).lean();

    if (!order) {
        const error =
            new Error(
                "Order not found."
            );

        error.statusCode = 404;

        throw error;
    }

    return order;
};

const cancelUserOrder = async ({
    userId,
    orderId,
}) => {
    const order =
        await Order.findOne({
            _id: orderId,
            user: userId,
        });

    if (!order) {
        const error = new Error(
            "Order not found."
        );

        error.statusCode = 404;

        throw error;
    }

    // ==========================================
    // Check if order can be cancelled
    // ==========================================

    const cancellableStatuses = [
        "PENDING",
        "CONFIRMED",
        "PROCESSING",
    ];

    if (
        !cancellableStatuses.includes(
            order.orderStatus
        )
    ) {
        const error = new Error(
            "This order can no longer be cancelled."
        );

        error.statusCode = 400;

        throw error;
    }

    // ==========================================
    // Restore stock
    // ==========================================

    for (const item of order.items) {
        await Product.updateOne(
            {
                _id: item.product,
            },
            {
                $inc: {
                    stock: item.quantity,
                },
            }
        );
    }

    // ==========================================
    // Cancel order
    // ==========================================

    order.orderStatus = "CANCELLED";

    order.cancelledAt = new Date();

    /*
     * For paid ONLINE orders, refund handling
     * should be implemented separately.
     */

    await order.save();

    return order;
};

const getAdminOrders = async ({
    page = 1,
    limit = 20,
    status,
    paymentStatus,
}) => {
    const skip = (page - 1) * limit;

    const filter = {};

    /*
     * Order status filter
     */
    if (status) {
        filter.orderStatus = status;
    }

    /*
     * Payment status filter
     */
    if (paymentStatus) {
        filter.paymentStatus = paymentStatus;
    }

    const [orders, total] = await Promise.all([
        Order.find(filter)
            .populate({
                path: "user",
                select: "name email phone",
            })
            .sort({
                createdAt: -1,
            })
            .skip(skip)
            .limit(limit)
            .lean(),

        Order.countDocuments(filter),
    ]);

    return {
        orders,

        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(
                total / limit
            ),
        },
    };
};

const getAdminOrderById = async (
    orderId
) => {
    const order =
        await Order.findById(orderId)
            .populate({
                path: "user",
                select:
                    "name email phone",
            })
            .lean();

    if (!order) {
        const error =
            new Error(
                "Order not found."
            );

        error.statusCode = 404;

        throw error;
    }

    return order;
};

const updateOrderStatus = async ({
    orderId,
    status,
}) => {
    const order = await Order.findById(orderId);

    if (!order) {
        const error = new Error("Order not found.");
        error.statusCode = 404;
        throw error;
    }

    /*
     * Don't allow changing a cancelled
     * order back to another status.
     */
    if (order.orderStatus === "CANCELLED") {
        const error = new Error(
            "Cancelled orders cannot be changed."
        );

        error.statusCode = 400;
        throw error;
    }

    /*
     * Don't allow changing delivered
     * orders.
     */
    if (order.orderStatus === "DELIVERED") {
        const error = new Error(
            "Delivered orders cannot be changed."
        );

        error.statusCode = 400;
        throw error;
    }

    /*
     * Don't send an email if the status
     * hasn't actually changed.
     */
    if (order.orderStatus === status) {
        return order;
    }

    /*
     * Store the old status before updating it.
     */
    const previousOrderStatus = order.orderStatus;

    /*
     * Update order status.
     */
    order.orderStatus = status;

    /*
     * Set delivered timestamp.
     */
    if (status === "DELIVERED") {
        order.deliveredAt = new Date();
    }

    /*
     * Save updated order first.
     */
    await order.save();

    /*
     * Send status update email.
     *
     * Assuming `order.user` contains the customer ID.
     */
    const user = await User.findById(order.user);

    if (user?.email) {
        try {
            await sendOrderStatusUpdateEmailServ({
                email: user.email,
                name: order.shippingAddress?.name || user.name || "Customer",
                order,
                previousOrderStatus,
            });
        } catch (emailError) {
            /*
             * Don't fail the order status update
             * just because the email failed.
             */
            console.error(
                `Failed to send status update email for ${order.orderNumber}:`,
                emailError
            );
        }
    }

    return order;
};


module.exports = {
    createOrder,
    getUserOrders,
    getUserOrderById,
    cancelUserOrder,
    getAdminOrders,
    getAdminOrderById,
    updateOrderStatus,
};