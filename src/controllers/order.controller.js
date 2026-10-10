const {
    createOrder: createOrderService,
    getUserOrders,
    getUserOrderById,
    cancelUserOrder,
} = require("../services/order.service");

const {
    getAdminOrders,
    getAdminOrderById,
    updateOrderStatus,
} = require("../services/order.service");

/*
 * POST /api/orders
 */
const createOrder = async (
    req,
    res,
    next
) => {
    try {
        const {
            shippingAddress,
            paymentMethod,
        } = req.body;

        const order =
            await createOrderService({
                userId: req.user._id,
                shippingAddress,
                paymentMethod,
            });

        return res.status(201).json({
            success: true,
            message:
                "Order created successfully.",
            data: {
                order,
            },
        });
    } catch (error) {
        next(error);
    }
};

/*
 * GET /api/orders
 */
const getOrders = async (
    req,
    res,
    next
) => {
    try {
        const {
            page,
            limit,
        } = req.query;

        const result =
            await getUserOrders({
                userId:
                    req.user._id,
                page,
                limit,
            });

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

/*
 * GET /api/orders/:id
 */
const getOrder = async (
    req,
    res,
    next
) => {
    try {
        const order =
            await getUserOrderById({
                userId:
                    req.user._id,

                orderId:
                    req.params.id,
            });

        return res.status(200).json({
            success: true,
            data: {
                order,
            },
        });
    } catch (error) {
        next(error);
    }
};

/*
 * PATCH /api/orders/:id/cancel
 */
const cancelOrder = async (
    req,
    res,
    next
) => {
    try {
        const order =
            await cancelUserOrder({
                userId:
                    req.user._id,

                orderId:
                    req.params.id,
            });

        return res.status(200).json({
            success: true,
            message:
                "Order cancelled successfully.",
            data: {
                order,
            },
        });
    } catch (error) {
        next(error);
    }
};

/*
 * GET /api/orders/admin
 */
const getAdminOrdersController = async (
    req,
    res,
    next
) => {
    try {
        const {
            page = 1,
            limit = 20,
            status,
            paymentStatus,
        } = req.query;

        // console.log(
        //     "ADMIN ORDERS QUERY:",
        //     req.query
        // );

        const result =
            await getAdminOrders({
                page: Number(page),
                limit: Number(limit),
                status,
                paymentStatus,
            });

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

/*
 * GET /api/orders/admin/:id
 */
const getAdminOrder = async (
    req,
    res,
    next
) => {
    try {
        const order =
            await getAdminOrderById(
                req.params.id
            );

        return res.status(200).json({
            success: true,
            data: {
                order,
            },
        });
    } catch (error) {
        next(error);
    }
};

/*
 * PATCH /api/orders/admin/:id/status
 */
const updateAdminOrderStatus =
    async (
        req,
        res,
        next
    ) => {
        try {
            const order =
                await updateOrderStatus({
                    orderId:
                        req.params.id,

                    status:
                        req.body.status,
                });

            return res.status(200).json({
                success: true,
                message:
                    "Order status updated successfully.",
                data: {
                    order,
                },
            });
        } catch (error) {
            next(error);
        }
    };

module.exports = {
    createOrder,
    getOrders,
    getOrder,
    cancelOrder,

    getAdminOrdersController,
    getAdminOrder,
    updateAdminOrderStatus,
};