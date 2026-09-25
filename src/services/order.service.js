const mongoose = require("mongoose");

const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");

const {
    createUroPayOrder,
} = require("./uropay.service");

const {
    generateOrderNumber,
} = require("../utils/order");

const createOrder = async ({
    userId,
    shippingAddress,
    paymentMethod,
}) => {
    /*
     * ==========================================
     * 1. Validate user first
     * ==========================================
     */
    const user = await User.findById(userId).lean();

    if (!user || !user.isActive || user.deletedAt) {
        const error = new Error(
            "User account is no longer available."
        );

        error.statusCode = 401;

        throw error;
    }

    /*
     * ==========================================
     * 2. Start MongoDB transaction
     * ==========================================
     */
    const session = await mongoose.startSession();

    let createdOrder = null;

    try {
        await session.withTransaction(async () => {
            /*
             * ==========================================
             * Get user's cart
             * ==========================================
             */
            const cart = await Cart.findOne({
                user: userId,
            }).session(session);

            if (!cart || !cart.items.length) {
                const error = new Error(
                    "Your cart is empty."
                );

                error.statusCode = 400;

                throw error;
            }

            /*
             * ==========================================
             * Prepare order items
             * ==========================================
             */
            const orderItems = [];

            let subtotal = 0;

            /*
             * ==========================================
             * Validate products + reserve stock
             * ==========================================
             */
            for (const cartItem of cart.items) {
                /*
                 * Atomic stock deduction.
                 *
                 * Product will only be updated if:
                 *
                 * - product exists
                 * - product is active
                 * - enough stock exists
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
                            new: true,
                            session,
                        }
                    );

                /*
                 * Product unavailable OR
                 * insufficient stock.
                 */
                if (!product) {
                    const error = new Error(
                        "One or more products in your cart are no longer available or do not have enough stock."
                    );

                    error.statusCode = 400;

                    throw error;
                }

                const price = Number(
                    product.price
                );

                const quantity = Number(
                    cartItem.quantity
                );

                const itemSubtotal =
                    price * quantity;

                subtotal += itemSubtotal;

                /*
                 * Snapshot product information
                 * into the order.
                 */
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

            /*
             * ==========================================
             * Calculate totals
             * ==========================================
             */
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

            /*
             * ==========================================
             * Payment / order status
             * ==========================================
             */
            const paymentStatus = "PENDING";

            const orderStatus =
                paymentMethod === "COD"
                    ? "CONFIRMED"
                    : "PENDING";

            /*
             * ==========================================
             * Generate local order number
             * ==========================================
             */
            const orderNumber =
                generateOrderNumber();

            /*
             * ==========================================
             * Create local order
             * ==========================================
             */
            const orders = await Order.create(
                [
                    {
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
                    },
                ],
                {
                    session,
                }
            );

            createdOrder = orders[0];

            /*
             * ==========================================
             * Clear cart
             * ==========================================
             *
             * Only happens inside the transaction.
             *
             * If anything fails above, the cart
             * remains unchanged.
             */
            cart.items = [];

            await cart.save({
                session,
            });
        });

        /*
         * ==========================================
         * MongoDB transaction is now COMMITTED
         * ==========================================
         *
         * Do NOT call UroPay before this point.
         */
    } finally {
        await session.endSession();
    }

    /*
     * ==========================================
     * 3. COD
     * ==========================================
     *
     * No external payment gateway required.
     */
    if (paymentMethod === "COD") {
        return createdOrder;
    }

    /*
     * ==========================================
     * 4. ONLINE → UroPay
     * ==========================================
     */
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

        /*
         * ==========================================
         * 5. Save UroPay details
         * ==========================================
         */
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

        return createdOrder;
    } catch (error) {
        /*
         * ==========================================
         * 6. UroPay creation failed
         * ==========================================
         *
         * Local order already exists and stock
         * has already been reserved.
         *
         * We must restore the stock and cancel
         * the order.
         */
        const rollbackSession =
            await mongoose.startSession();

        try {
            await rollbackSession.withTransaction(
                async () => {
                    const order =
                        await Order.findById(
                            createdOrder._id
                        ).session(
                            rollbackSession
                        );

                    if (!order) {
                        return;
                    }

                    /*
                     * Make sure we don't restore
                     * stock twice.
                     */
                    if (
                        order.orderStatus ===
                        "CANCELLED"
                    ) {
                        return;
                    }

                    /*
                     * Restore stock.
                     */
                    for (
                        const item of order.items
                    ) {
                        await Product.updateOne(
                            {
                                _id: item.product,
                            },
                            {
                                $inc: {
                                    stock:
                                        item.quantity,
                                },
                            },
                            {
                                session:
                                    rollbackSession,
                            }
                        );
                    }

                    /*
                     * Cancel local order.
                     */
                    order.paymentStatus =
                        "FAILED";

                    order.orderStatus =
                        "CANCELLED";

                    order.cancelledAt =
                        new Date();

                    await order.save({
                        session:
                            rollbackSession,
                    });
                }
            );
        } finally {
            await rollbackSession.endSession();
        }

        /*
         * Return a clean error to API.
         */
        const paymentError =
            new Error(
                "Unable to start online payment. Your order was cancelled. Please try again."
            );

        paymentError.statusCode = 502;

        /*
         * Keep original provider error
         * available for server-side logging.
         */
        paymentError.cause = error;

        throw paymentError;
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
    const session =
        await mongoose.startSession();

    try {
        let cancelledOrder;

        await session.withTransaction(
            async () => {
                const order =
                    await Order.findOne({
                        _id: orderId,
                        user: userId,
                    }).session(session);

                if (!order) {
                    const error =
                        new Error(
                            "Order not found."
                        );

                    error.statusCode = 404;

                    throw error;
                }

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
                    const error =
                        new Error(
                            "This order can no longer be cancelled."
                        );

                    error.statusCode = 400;

                    throw error;
                }

                /*
                 * Return stock to products.
                 */
                for (const item of order.items) {
                    await Product.updateOne(
                        {
                            _id: item.product,
                        },
                        {
                            $inc: {
                                stock:
                                    item.quantity,
                            },
                        },
                        {
                            session,
                        }
                    );
                }

                order.orderStatus =
                    "CANCELLED";

                order.cancelledAt =
                    new Date();

                /*
                 * For COD there is no payment
                 * to refund.
                 *
                 * For paid orders we'll handle
                 * refund logic when payment
                 * integration is added.
                 */
                if (
                    order.paymentStatus ===
                    "PAID"
                ) {
                    /*
                     * Do not mark this as
                     * refunded automatically.
                     *
                     * Payment gateway refund
                     * will be handled separately.
                     */
                }

                await order.save({
                    session,
                });

                cancelledOrder =
                    order;
            }
        );

        return cancelledOrder;
    } finally {
        await session.endSession();
    }
};

const getAdminOrders = async ({
    page = 1,
    limit = 20,
    status,
}) => {
    const skip =
        (page - 1) * limit;

    const filter = {};

    if (status) {
        filter.orderStatus = status;
    }

    const [orders, total] =
        await Promise.all([
            Order.find(filter)
                .populate({
                    path: "user",
                    select:
                        "name email phone",
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
    const order =
        await Order.findById(orderId);

    if (!order) {
        const error =
            new Error(
                "Order not found."
            );

        error.statusCode = 404;

        throw error;
    }

    /*
     * Don't allow changing a cancelled
     * order back to another status.
     */
    if (
        order.orderStatus ===
        "CANCELLED"
    ) {
        const error =
            new Error(
                "Cancelled orders cannot be changed."
            );

        error.statusCode = 400;

        throw error;
    }

    /*
     * Don't allow changing delivered
     * orders.
     */
    if (
        order.orderStatus ===
        "DELIVERED"
    ) {
        const error =
            new Error(
                "Delivered orders cannot be changed."
            );

        error.statusCode = 400;

        throw error;
    }

    order.orderStatus = status;

    if (status === "DELIVERED") {
        order.deliveredAt =
            new Date();
    }

    await order.save();

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