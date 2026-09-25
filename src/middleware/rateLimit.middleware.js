const rateLimit = require("express-rate-limit");

/*
 * General authentication limiter.
 *
 * Protects endpoints from excessive requests.
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,

    standardHeaders: "draft-8",
    legacyHeaders: false,

    message: {
        success: false,
        message:
            "Too many requests. Please try again later.",
    },
});

/*
 * Strict limiter for OTP-related endpoints.
 *
 * OTP endpoints are more sensitive because they can
 * trigger emails and attempt authentication.
 */
const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,

    standardHeaders: "draft-8",
    legacyHeaders: false,

    message: {
        success: false,
        message:
            "Too many OTP requests. Please try again later.",
    },
});

/*
 * Login limiter.
 *
 * Protects password and OTP login attempts.
 */
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,

    standardHeaders: "draft-8",
    legacyHeaders: false,

    message: {
        success: false,
        message:
            "Too many login attempts. Please try again later.",
    },
});

/*
 * Password reset limiter.
 */
const passwordResetLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,

    standardHeaders: "draft-8",
    legacyHeaders: false,

    message: {
        success: false,
        message:
            "Too many password reset requests. Please try again later.",
    },
});

module.exports = {
    authLimiter,
    otpLimiter,
    loginLimiter,
    passwordResetLimiter,
};