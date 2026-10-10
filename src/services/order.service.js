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
    // ==========================================
    // 1. Validate user
    // ==========================================

    const user = await User.findById(userId).lean();

    if (!user || !user.isActive || user.deletedAt) {
        const error = new Error(
            "User account is no longer available."
        );

        error.statusCode = 401;

        throw error;
    }

    // ==========================================
    // 2. Get user's cart
    // ==========================================

    const cart = await Cart.findOne({
        user: userId,
    });

    if (!cart || !cart.items.length) {
        const error = new Error(
            "Your cart is empty."
        );

        error.statusCode = 400;

        throw error;
    }

    // ==========================================
    // 3. Prepare order items
    // ==========================================

    const orderItems = [];

    let subtotal = 0;

    /*
     * Keep track of successfully reserved stock.
     *
     * If order creation fails later,
     * restore the stock.
     */
    const reservedStock = [];

    try {
        // ==========================================
        // 4. Validate products + reserve stock
        // ==========================================

        for (const cartItem of cart.items) {
            /*
             * Atomic stock deduction.
             */
            const product =
                await Product.findOneAndUpdate(
                    {
                        _id: cartItem.product,
                        isActive: true,
                        stock: {
                            $gte: cartItem.quantity,
                        },
                    },
                    {
                        $inc: {
                            stock: -cartItem.quantity,
                        },
                    },
                    {
                        returnDocument: "after",
                    }
                );

            if (!product) {
                const error = new Error(
                    "One or more products in your cart are no longer available or do not have enough stock."
                );

                error.statusCode = 400;

                throw error;
            }

            /*
             * Remember stock reservation.
             */
            reservedStock.push({
                productId: product._id,
                quantity: cartItem.quantity,
            });

            // ==========================================
            // Snapshot product information
            // ==========================================

            const price = Number(product.price);

            const quantity =
                Number(cartItem.quantity);

            const itemSubtotal =
                price * quantity;

            subtotal += itemSubtotal;

            orderItems.push({
                product: product._id,
                name: product.name,
                sku: product.sku,
                img: product.img || "",
                price,
                quantity,
                subtotal: Number(
                    itemSubtotal.toFixed(2)
                ),
            });
        }

        // ==========================================
        // 5. Calculate totals
        // ==========================================

        subtotal = Number(
            subtotal.toFixed(2)
        );

        const shippingAmount = 0;

        const discountAmount = 0;

        const totalAmount = Number(
            (
                subtotal +
                shippingAmount -
                discountAmount
            ).toFixed(2)
        );

        // ==========================================
        // 6. Payment / order status
        // ==========================================

        const paymentStatus = "PENDING";

        const orderStatus =
            paymentMethod === "COD"
                ? "CONFIRMED"
                : "PENDING";

        // ==========================================
        // 7. Generate order number
        // ==========================================

        const orderNumber =
            generateOrderNumber();

        // ==========================================
        // 8. Create local order
        // ==========================================

        const createdOrder =
            await Order.create({
                orderNumber,

                user: userId,

                items: orderItems,

                shippingAddress,

                subtotal,

                shippingAmount,

                discountAmount,

                totalAmount,

                paymentMethod,

                paymentProvider:
                    paymentMethod === "ONLINE"
                        ? "UROPAY"
                        : "COD",

                paymentStatus,

                orderStatus,
            });

        // ==========================================
        // 9. Clear cart
        // ==========================================

        cart.items = [];

        await cart.save();

        // ==========================================
        // 10. COD
        // ==========================================

        if (paymentMethod === "COD") {
            /*
             * Order is confirmed.
             *
             * Send order received email.
             *
             * Email failure will NOT affect
             * the successful order.
             */
            await sendOrderReceivedEmail({
                user,
                order: createdOrder,
            });

            await sendAdminNewOrderEmail({
                order: createdOrder,
                customer: user,
            });

            return createdOrder;
        }

        // ==========================================
        // 11. ONLINE → UroPay
        // ==========================================

        try {
            const providerOrder =
                await createUroPayOrder({
                    tenantOrderRef:
                        createdOrder.orderNumber,

                    amount:
                        createdOrder.totalAmount,

                    customerEmail:
                        user.email,

                    customerPhone:
                        shippingAddress.phone,

                    returnUrl:
                        process.env.UROPAY_RETURN_URL,

                    webhookUrl:
                        process.env.UROPAY_WEBHOOK_URL,
                });

            // ==========================================
            // 12. Save UroPay details
            // ==========================================

            createdOrder.paymentProvider =
                "UROPAY";

            createdOrder.paymentOrderId =
                providerOrder.id;

            createdOrder.paymentOrderRef =
                providerOrder.tenantOrderRef;

            createdOrder.paymentCheckoutUrl =
                providerOrder.openUrl;

            createdOrder.paymentStatus =
                "PENDING";

            createdOrder.orderStatus =
                "PENDING";

            await createdOrder.save();

            // ==========================================
            // 13. Send order received email
            // ==========================================

            /*
             * At this point the UroPay order has
             * successfully been created and saved.
             *
             * Payment is still pending.
             */
            await sendOrderReceivedEmail({
                user,
                order: createdOrder,
            });

            await sendAdminNewOrderEmail({
                order: createdOrder,
                customer: user,
            });

            return createdOrder;
        } catch (paymentError) {
            /*
             * UroPay order creation failed.
             *
             * Restore reserved stock.
             */

            for (const reserved of reservedStock) {
                await Product.updateOne(
                    {
                        _id:
                            reserved.productId,
                    },
                    {
                        $inc: {
                            stock:
                                reserved.quantity,
                        },
                    }
                );
            }

            /*
             * Cancel local order.
             */

            createdOrder.paymentStatus =
                "FAILED";

            createdOrder.orderStatus =
                "CANCELLED";

            createdOrder.cancelledAt =
                new Date();

            await createdOrder.save();

            const error = new Error(
                "Unable to start online payment. Your order was cancelled. Please try again."
            );

            error.statusCode = 502;

            error.cause = paymentError;

            throw error;
        }
    } catch (error) {
        /*
         * Something failed before the order was
         * successfully created.
         *
         * Restore any stock already reserved.
         */

        if (
            reservedStock.length > 0
        ) {
            for (const reserved of reservedStock) {
                await Product.updateOne(
                    {
                        _id:
                            reserved.productId,
                    },
                    {
                        $inc: {
                            stock:
                                reserved.quantity,
                        },
                    }
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