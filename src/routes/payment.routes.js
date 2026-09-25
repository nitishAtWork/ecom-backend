const express = require("express");

const {
    authenticate,
} = require("../middleware/auth.middleware");

const {
    getUroPayPaymentStatus,
    uropayWebhook,
} = require("../controllers/payment.controller");

const router =
    express.Router();

/*
 * Customer payment status.
 */
router.get(
    "/uropay/:orderId/status",
    authenticate,
    getUroPayPaymentStatus
);

/*
 * UroPay server-to-server webhook.
 *
 * Authentication is done through
 * UroPay HMAC signature instead.
 */
router.post(
    "/uropay/webhook",
    uropayWebhook
);

module.exports = router;