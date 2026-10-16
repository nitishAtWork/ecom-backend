const Order = require("../models/Order");
const Product =
    require("../models/Product");
const {
    getUroPayOrder,
} = require("../services/uropay.service");

const Cart = require("../models/Cart");
const User = require("../models/User");

const {
    sendPaymentSuccessEmailServ,
    sendAdminPaymentSuccessEmailServ,
} = require("../services/orderEmail.service");

const {
    verifyUroPayWebhook,
} = require("../services/uropay.webhook.service");



/*
 * Clear a leftover cart only when its current contents exactly
 * match the purchased order. Do not delete newer cart additions.
 */
const clearCartIfMatchesOrder = async (order) => {
    const cart = await Cart.findOne({
        user: order.user,
    });

    if (!cart || !cart.items?.length) {
        return;
    }

    const normalizeItems = (items) =>
        items
            .map((item) => ({
                product: String(item.product?._id || item.product),
                quantity: Number(item.quantity),
            }))
            .sort((a, b) =>
                a.product.localeCompare(b.product) ||
                a.quantity - b.quantity
            );

    const cartItems = normalizeItems(cart.items);
    const purchasedItems = normalizeItems(order.items);

    const matches =
        cartItems.length === purchasedItems.length &&
        cartItems.every(
            (item, index) =>
                item.product === purchasedItems[index].product &&
                item.quantity === purchasedItems[index].quantity
        );

    if (!matches) {
        console.warn(
            `Cart not cleared for ${order.orderNumber}: ` +
            "cart contents differ from the purchased order."
        );
        return;
    }

    cart.items = [];
    await cart.save();

    console.log(
        `Cart cleared after payment: ${order.orderNumber}`
    );
};


/*
 * Send each payment-success email independently.
 *
 * The atomic claim reduces duplicate emails when UroPai retries
 * a webhook or the status endpoint reconciles the same payment.
 */
const sendPaymentNotificationOnce = async (
    orderId,
    type
) => {
    const isCustomer = type === "customer";

    const sentField = isCustomer
        ? "paymentCustomerEmailSentAt"
        : "paymentAdminEmailSentAt";

    const claimedField = isCustomer
        ? "paymentCustomerEmailClaimedAt"
        : "paymentAdminEmailClaimedAt";

    const staleClaimBefore = new Date(
        Date.now() - 10 * 60 * 1000
    );

    // Atomic claim: only one active request should send this email.
    const claimedOrder = await Order.findOneAndUpdate(
        {
            _id: orderId,
            paymentStatus: "PAID",
            [sentField]: null,
            $or: [
                { [claimedField]: null },
                { [claimedField]: { $lt: staleClaimBefore } },
            ],
        },
        {
            $set: {
                [claimedField]: new Date(),
            },
        },
        {
            new: true,
        }
    );

    if (!claimedOrder) {
        // Already sent, or another request currently owns the claim.
        return;
    }

    try {
        const customer = await User.findById(
            claimedOrder.user
        ).lean();

        if (isCustomer) {
            if (!customer?.email) {
                throw new Error(
                    "Customer email not found for paid order."
                );
            }

            await sendPaymentSuccessEmailServ({
                email: customer.email,
                name:
                    claimedOrder.shippingAddress?.name ||
                    customer.name ||
                    "Customer",
                order: claimedOrder,
            });
        } else {
            await sendAdminPaymentSuccessEmailServ({
                order: claimedOrder,
                customer,
            });
        }

        await Order.updateOne(
            {
                _id: claimedOrder._id,
                paymentStatus: "PAID",
            },
            {
                $set: {
                    [sentField]: new Date(),
                },
                $unset: {
                    [claimedField]: 1,
                },
            }
        );
    } catch (error) {
        // Release the claim so a later reconciliation can retry.
        await Order.updateOne(
            {
                _id: claimedOrder._id,
                [sentField]: null,
            },
            {
                $unset: {
                    [claimedField]: 1,
                },
            }
        );

        console.error(
            `Payment ${type} email failed for ` +
            `${claimedOrder.orderNumber}:`,
            error
        );
    }
};


/*
 * Called only after the provider's payment has been verified.
 */
const finishPaidOrder = async (order) => {
    // Persist payment status before performing notifications.
    if (order.paymentStatus !== "PAID") {
        order.paymentStatus = "PAID";
        order.paymentPaidAt =
            order.paymentPaidAt || new Date();

        // Do not revive a previously cancelled order automatically.
        if (order.orderStatus !== "CANCELLED") {
            order.orderStatus = "CONFIRMED";
        }

        await order.save();
    }

    // Recover a cart that remained uncleared after checkout.
    await clearCartIfMatchesOrder(order);

    // PAYMENT SUCCESS NOTIFICATION — CUSTOMER.
    await sendPaymentNotificationOnce(
        order._id,
        "customer"
    );

    // PAYMENT SUCCESS NOTIFICATION — ADMIN.
    await sendPaymentNotificationOnce(
        order._id,
        "admin"
    );
};


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


            await reconcileUroPayOrder(order.paymentOrderId);

            const refreshedOrder = await Order.findById(order._id);

            return res.status(200).json({
                success: true,
                data: {
                    paymentStatus: refreshedOrder.paymentStatus,
                    orderId: refreshedOrder._id,
                    orderStatus: refreshedOrder.orderStatus,
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




const reconcileUroPayOrder = async (providerOrderId) => {
    if (!providerOrderId) return;

    const order = await Order.findOne({
        paymentOrderId: providerOrderId,
    });

    if (!order) {
        console.warn(
            "UroPai webhook received for an unknown provider order."
        );
        return;
    }

    // Always fetch the provider's current authoritative status.
    const providerOrder = await getUroPayOrder(
        providerOrderId
    );

    // Fail closed if the provider response doesn't match this order.
    if (
        String(providerOrder.id) !== String(order.paymentOrderId) ||
        providerOrder.tenantOrderRef !== order.orderNumber ||
        Number(providerOrder.amount) !== Number(order.totalAmount) ||
        providerOrder.currency !== "INR"
    ) {
        console.error(
            `UroPai order verification mismatch: ${order.orderNumber}`
        );
        throw new Error(
            "UroPai payment details do not match the local order."
        );
    }

    const status = providerOrder.status;

    if (
        !["PAID", "FAILED", "EXPIRED", "CANCELLED"].includes(status)
    ) {
        // Payment is still pending; no confirmation email yet.
        return;
    }

    if (status === "PAID") {
        /*
         * A payment arriving after the order was cancelled or stock
         * was released needs manual reconciliation. Never silently
         * revive a cancelled order or confirm it without checking stock.
         */
        if (
            order.orderStatus === "CANCELLED" &&
            order.paymentStatus !== "PAID"
        ) {
            console.error(
                `CRITICAL: UroPai reports PAID for cancelled order ` +
                `${order.orderNumber}. Manual reconciliation required.`
            );
            return;
        }

        await finishPaidOrder(order);
        return;
    }

    // Don't downgrade an order already verified as paid.
    if (order.paymentStatus === "PAID") {
        return;
    }

    await restoreOrderStockAndFailPayment(
        order._id,
        status
    );
};


const processUroPayWebhook = async (payload) => {
    const providerOrderId = payload?.orderId;

    if (!providerOrderId) {
        console.warn(
            "UroPai webhook payload has no orderId."
        );
        return;
    }

    await reconcileUroPayOrder(providerOrderId);
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