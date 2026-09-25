const express = require("express");

const {
    register,
    verifyEmail,
    resendEmailVerificationOTP,
    login,
    sendLoginOTP,
    verifyLoginOTP,
    forgotPassword,
    verifyPasswordResetOTP,
    resetPassword,
    changePassword,
    getMe,
    refresh,
    logout,
    logoutAllDevices,
    getSessions,
} = require("../controllers/auth.controller");

const {
    authenticate,
} = require("../middleware/auth.middleware");

const {
    authLimiter,
    otpLimiter,
    loginLimiter,
    passwordResetLimiter,
} = require("../middleware/rateLimit.middleware");

const {
    validate,
} = require("../middleware/validate.middleware");

const {
    registerSchema,
    verifyEmailSchema,
    resendEmailOTPSchema,
    loginSchema,
    loginOTPSendSchema,
    loginOTPVerifySchema,
    forgotPasswordSchema,
    verifyResetOTPSchema,
    resetPasswordSchema,
    changePasswordSchema,
} = require("../utils/auth.validation");

const router = express.Router();

/*
 * Registration
 */
router.post(
    "/register",
    authLimiter,
    validate(registerSchema),
    register
);

/*
 * Email verification
 */
router.post(
    "/verify-email",
    otpLimiter,
    validate(verifyEmailSchema),
    verifyEmail
);

router.post(
    "/resend-email-otp",
    otpLimiter,
    validate(resendEmailOTPSchema),
    resendEmailVerificationOTP
);

/*
 * Password login
 */
router.post(
    "/login",
    loginLimiter,
    validate(loginSchema),
    login
);

/*
 * OTP login
 */
router.post(
    "/login/send-otp",
    otpLimiter,
    validate(loginOTPSendSchema),
    sendLoginOTP
);

router.post(
    "/login/verify-otp",
    loginLimiter,
    validate(loginOTPVerifySchema),
    verifyLoginOTP
);

/*
 * Password reset
 */
router.post(
    "/forgot-password",
    passwordResetLimiter,
    validate(forgotPasswordSchema),
    forgotPassword
);

router.post(
    "/verify-reset-otp",
    otpLimiter,
    validate(verifyResetOTPSchema),
    verifyPasswordResetOTP
);

router.post(
    "/reset-password",
    passwordResetLimiter,
    validate(resetPasswordSchema),
    resetPassword
);

router.post(
    "/change-password",
    authenticate,
    validate(changePasswordSchema),
    changePassword
);

/*
 * Authenticated routes
 */
router.get(
    "/me",
    authenticate,
    getMe
);

router.get(
    "/sessions",
    authenticate,
    getSessions
);

router.post(
    "/refresh",
    authLimiter,
    refresh
);

router.post(
    "/logout",
    logout
);

router.post(
    "/logout-all",
    authenticate,
    logoutAllDevices
);

module.exports = router;