const Order = require("../models/Order");
const Product =
    require("../models/Product");
const {
    getUroPayOrder,
} = require("../services/uropay.service");

const mongoose = require("mongoose");

const {
    verifyUroPayWebhook,
} = require("../services/uropay.webhook.service");

/*
 * GET /api/payments/uropay/:orderId/status
 *
 * Customer can check their own payment status.
 */
const getUroPayPaymentStatus =
    async (
        req,
        res,
        next
    ) => {
        try {
            const order =
                await Order.findOne({
                    _id:
                        req.params.orderId,

                    user:
                        req.user._id,
                });

            if (!order) {
                const error =
                    new Error(
                        "Order not found."
                    );

                error.statusCode = 404;

                throw error;
            }

            if (
                order.paymentProvider !==
                "UROPAY"
            ) {
                const error =
                    new Error(
                        "This order does not use UroPay."
                    );

                error.statusCode = 400;

                throw error;
            }

            const providerOrder =
                await getUroPayOrder(
                    order.paymentOrderId
                );

            return res.status(200).json({
                success: true,

                data: {
                    paymentStatus:
                        providerOrder.status,

                    orderId:
                        order._id,

                    orderStatus:
                        order.orderStatus,
                },
            });
        } catch (error) {
            next(error);
        }
    };

/*
 * POST /api/payments/uropay/webhook
 */
const uropayWebhook =
    async (
        req,
        res,
        next
    ) => {
        try {
            const rawBody =
                req.rawBody;

            if (!rawBody) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Raw webhook body is required.",
                    });
            }

            const isValid =
                verifyUroPayWebhook({
                    headers:
                        req.headers,

                    rawBody,
                });

            if (!isValid) {
                return res
                    .status(401)
                    .json({
                        success: false,
                        message:
                            "Invalid webhook signature.",
                    });
            }

            const payload =
                req.body;

            /*
             * We return quickly after accepting
             * the signed event.
             *
             * The actual payment status is checked
             * from UroPay GET API.
             */
            await processUroPayWebhook(
                payload
            );

            return res.status(200).json({
                success: true,
                message:
                    "Webhook received.",
            });
        } catch (error) {
            next(error);
        }
    };



const processUroPayWebhook =
    async (payload) => {
        const {
            orderId: providerOrderId,
            status: webhookStatus,
        } = payload;

        if (!providerOrderId) {
            return;
        }

        /*
         * Find our local order using
         * UroPay's order ID.
         */
        const order =
            await Order.findOne({
                paymentOrderId:
                    providerOrderId,
            });

        if (!order) {
            /*
             * Don't expose whether an order exists.
             */
            return;
        }

        /*
         * Already completed.
         *
         * This also makes repeated webhook
         * deliveries harmless.
         */
        if (
            [
                "PAID",
                "FAILED",
                "EXPIRED",
                "CANCELLED",
            ].includes(
                order.paymentStatus
            )
        ) {
            return;
        }

        /*
         * Ask UroPay for the REAL status.
         */
        const providerOrder =
            await getUroPayOrder(
                providerOrderId
            );

        const status =
            providerOrder.status;

        /*
         * Ignore unexpected status.
         */
        if (
            ![
                "PAID",
                "FAILED",
                "EXPIRED",
                "CANCELLED",
            ].includes(status)
        ) {
            return;
        }

        /*
         * PAID
         */
        if (status === "PAID") {
            order.paymentStatus =
                "PAID";

            order.paymentPaidAt =
                new Date();

            order.orderStatus =
                "CONFIRMED";

            await order.save();

            return;
        }

        /*
         * Failed / expired / cancelled.
         *
         * We need to restore stock.
         */
        await restoreOrderStockAndFailPayment(
            order._id,
            status
        );
    };


const restoreOrderStockAndFailPayment = async (
    orderId,
    paymentStatus
) => {
    const order = await Order.findById(orderId);

    if (!order) {
        return;
    }

    // Already processed
    if (
        [
            "PAID",
            "FAILED",
            "EXPIRED",
            "CANCELLED",
        ].includes(order.paymentStatus)
    ) {
        return;
    }

    // Restore stock
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

    // Update payment/order
    order.paymentStatus = paymentStatus;
    order.orderStatus = "CANCELLED";
    order.cancelledAt = new Date();

    await order.save();
};

module.exports = {
    getUroPayPaymentStatus,
    uropayWebhook,
};