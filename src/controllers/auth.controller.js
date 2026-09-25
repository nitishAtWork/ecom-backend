const {
    registerUser,

    verifyEmail:
        verifyEmailService,

    resendEmailVerificationOTP:
        resendEmailVerificationOTPService,

    loginUser,

    sendLoginOTP:
        sendLoginOTPService,

    loginWithOTP:
        loginWithOTPService,

    forgotPassword:
        forgotPasswordService,

    verifyPasswordResetOTP:
        verifyPasswordResetOTPService,

    resetPassword:
        resetPasswordService,

    refreshAccessToken,

    // refreshAccessToken:
    //     refreshAccessTokenService,

    logoutAllDevices: logoutAllDevicesService,

      getActiveSessions:
        getActiveSessionsService,
        changePassword: changePasswordService,

} = require("../services/auth.service");

const {
    refreshTokenCookieName,
    getRefreshTokenCookieOptions,
} = require("../utils/cookies");

const {
    isValidEmail,
    validatePassword,
} = require("../utils/validation");

const {
    revokeSessionByRefreshToken,
} = require("../services/session.service");

/*
|--------------------------------------------------------------------------
| Register
|--------------------------------------------------------------------------
*/

const register = async (
    req,
    res,
    next
) => {

    try {

        const {
            name,
            email,
            password,
        } = req.body;


        if (!name || !email || !password) {

            return res.status(400).json({
                success: false,
                message:
                    "Name, email and password are required.",
            });
        }


        if (name.trim().length < 2) {

            return res.status(400).json({
                success: false,
                message:
                    "Name must contain at least 2 characters.",
            });
        }


        const passwordValidation =
            validatePassword(password);

        if (!passwordValidation.valid) {
            return res.status(400).json({
                success: false,
                message: passwordValidation.message,
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message:
                    "Please provide a valid email address.",
            });
        }


        const result =
            await registerUser({
                name: name.trim(),
                email,
                password,
            });


        return res.status(201).json({
            success: true,
            message:
                "Registration successful. Please verify your email using the OTP sent to your email address.",
            data: result,
        });

    } catch (error) {

        next(error);

    }
};


/*
|--------------------------------------------------------------------------
| Verify Email
|--------------------------------------------------------------------------
*/

const verifyEmail = async (
    req,
    res,
    next
) => {

    try {

        const {
            email,
            otp,
        } = req.body;


        if (!email || !otp) {

            return res.status(400).json({
                success: false,
                message:
                    "Email and OTP are required.",
            });
        }

        if (!/^\d{6}$/.test(otp)) {
            return res.status(400).json({
                success: false,
                message:
                    "OTP must be a 6-digit number.",
            });
        }

        const user =
            await verifyEmailService({
                email,
                otp,
            });

        return res.status(200).json({
            success: true,
            message:
                "Email verified successfully.",
            data: {
                user,
            },
        });

    } catch (error) {
        next(error);
    }
};


/*
|--------------------------------------------------------------------------
| Resend Verification OTP
|--------------------------------------------------------------------------
*/

const resendEmailVerificationOTP = async (
    req,
    res,
    next
) => {

    try {
        const {
            email,
        } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message:
                    "Email is required.",
            });
        }

        const result =
            await resendEmailVerificationOTPService({
                email,
            });

        return res.status(200).json({
            success: true,
            message: result.message,
        });

    } catch (error) {
        next(error);
    }
};

/*
|--------------------------------------------------------------------------
| Login
|--------------------------------------------------------------------------
*/

const login = async (
    req,
    res,
    next
) => {

    try {
        const {
            email,
            password,
        } = req.body;

        /*
         * Validate input
         */
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message:
                    "Email and password are required.",
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message:
                    "Please provide a valid email address.",
            });
        }


        /*
         * Login
         */
        const result =
            await loginUser({
                email,
                password,
                userAgent:
                    req.get("user-agent"),
                ipAddress:
                    req.ip,
            });

        /*
         * Store refresh token
         * inside HTTP-only cookie.
         */
        res.cookie(
            refreshTokenCookieName,
            result.refreshToken,
            getRefreshTokenCookieOptions()
        );

        /*
         * Don't return refresh token
         * in JSON.
         */
        return res.status(200).json({
            success: true,
            message:
                "Login successful.",
            data: {
                accessToken:
                    result.accessToken,
                refreshTokenExpiresAt:
                    result.refreshTokenExpiresAt,
                user:
                    result.user,
            },

        });

    } catch (error) {
        next(error);
    }
};

/*
|--------------------------------------------------------------------------
| Get Current User
|--------------------------------------------------------------------------
*/

const getMe = async (
    req,
    res,
    next
) => {

    try {
        return res.status(200).json({
            success: true,
            data: {
                user: {
                    id: req.user._id,
                    name: req.user.name,
                    email: req.user.email,
                    role: req.user.role,
                    emailVerified:
                        req.user.emailVerified,
                    avatar:
                        req.user.avatar,
                    phone:
                        req.user.phone,
                    createdAt:
                        req.user.createdAt,
                },
            },
        });

    } catch (error) {
        next(error);
    }
};

/*
|--------------------------------------------------------------------------
| Refresh Access Token
|--------------------------------------------------------------------------
*/

const refresh = async (req, res, next) => {
    try {
        const refreshToken =
            req.cookies[refreshTokenCookieName];

        const result =
            await refreshAccessToken(
                refreshToken
            );

        res.cookie(
            refreshTokenCookieName,
            result.refreshToken,
            getRefreshTokenCookieOptions()
        );

        return res.status(200).json({
            success: true,
            message: "Access token refreshed.",
            data: {
                accessToken:
                    result.accessToken,
                user: result.user,
            },
        });
    } catch (error) {
        next(error);
    }
};

/*
|--------------------------------------------------------------------------
| Logout
|--------------------------------------------------------------------------
*/

const logout = async (req, res, next) => {
    try {
        const refreshToken =
            req.cookies[refreshTokenCookieName];

        if (refreshToken) {
            await revokeSessionByRefreshToken(
                refreshToken
            );
        }

        res.clearCookie(
            refreshTokenCookieName,
            getRefreshTokenCookieOptions()
        );

        return res.status(200).json({
            success: true,
            message: "Logged out successfully.",
        });
    } catch (error) {
        next(error);
    }
};

/*
|--------------------------------------------------------------------------
| Send Login OTP
|--------------------------------------------------------------------------
*/

const sendLoginOTP = async (
    req,
    res,
    next
) => {
    try {
        const {
            email,
        } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message:
                    "Email is required.",
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message:
                    "Please provide a valid email address.",
            });
        }

        const result =
            await sendLoginOTPService({
                email,
            });

        return res.status(200).json({
            success: true,
            message:
                result.message,
        });

    } catch (error) {
        next(error);
    }
};

/*
|--------------------------------------------------------------------------
| Verify Login OTP
|--------------------------------------------------------------------------
*/

const verifyLoginOTP = async (
    req,
    res,
    next
) => {

    try {
        const {
            email,
            otp,
        } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message:
                    "Email and OTP are required.",
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message:
                    "Please provide a valid email address.",
            });
        }


        if (!/^\d{6}$/.test(otp)) {
            return res.status(400).json({
                success: false,
                message:
                    "OTP must be a 6-digit number.",
            });
        }

        const result =
            await loginWithOTPService({
                email,
                otp,
                userAgent:
                    req.get("user-agent"),
                ipAddress:
                    req.ip,
            });

        /*
         * Store refresh token
         * as HTTP-only cookie.
         */
        res.cookie(
            refreshTokenCookieName,
            result.refreshToken,
            getRefreshTokenCookieOptions()
        );


        return res.status(200).json({
            success: true,
            message:
                "Login successful.",
            data: {
                accessToken:
                    result.accessToken,
                refreshTokenExpiresAt:
                    result.refreshTokenExpiresAt,
                user:
                    result.user,
            },
        });

    } catch (error) {
        next(error);
    }
};


/*
|--------------------------------------------------------------------------
| Forgot Password
|--------------------------------------------------------------------------
*/

const forgotPassword = async (
    req,
    res,
    next
) => {

    try {

        const {
            email,
        } = req.body;


        if (!email) {

            return res.status(400).json({
                success: false,
                message:
                    "Email is required.",
            });
        }


        if (!isValidEmail(email)) {

            return res.status(400).json({
                success: false,
                message:
                    "Please provide a valid email address.",
            });
        }


        const result =
            await forgotPasswordService({
                email,
            });


        return res.status(200).json({

            success: true,

            message:
                result.message,

        });

    } catch (error) {

        next(error);

    }
};

/*
|--------------------------------------------------------------------------
| Verify Password Reset OTP
|--------------------------------------------------------------------------
*/

const verifyPasswordResetOTP = async (
    req,
    res,
    next
) => {

    try {

        const {
            email,
            otp,
        } = req.body;


        if (!email || !otp) {

            return res.status(400).json({
                success: false,
                message:
                    "Email and OTP are required.",
            });
        }


        if (!isValidEmail(email)) {

            return res.status(400).json({
                success: false,
                message:
                    "Please provide a valid email address.",
            });
        }


        if (!/^\d{6}$/.test(otp)) {

            return res.status(400).json({
                success: false,
                message:
                    "OTP must be a 6-digit number.",
            });
        }


        const result =
            await verifyPasswordResetOTPService({
                email,
                otp,
            });


        return res.status(200).json({

            success: true,

            message:
                "OTP verified successfully.",

            data: {

                resetToken:
                    result.resetToken,

                expiresIn:
                    result.expiresIn,

            },

        });

    } catch (error) {

        next(error);

    }
};

/*
|--------------------------------------------------------------------------
| Reset Password
|--------------------------------------------------------------------------
*/

const resetPassword = async (
    req,
    res,
    next
) => {

    try {

        const {
            resetToken,
            newPassword,
        } = req.body;


        if (
            !resetToken ||
            !newPassword
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Reset token and new password are required.",
            });
        }


        /*
         * Validate new password
         */
        const passwordValidation =
            validatePassword(
                newPassword
            );


        if (!passwordValidation.valid) {

            return res.status(400).json({
                success: false,
                message:
                    passwordValidation.message,
            });
        }


        const result =
            await resetPasswordService({

                resetToken,

                newPassword,

            });


        /*
         * Clear any refresh cookie
         * from this browser.
         */
        res.clearCookie(
            refreshTokenCookieName,
            getRefreshTokenCookieOptions()
        );


        return res.status(200).json({

            success: true,

            message:
                result.message,

        });

    } catch (error) {

        next(error);

    }
};


const logoutAllDevices = async (req, res, next) => {
    try {
        await logoutAllDevicesService(
            req.user._id
        );

        res.clearCookie(
            refreshTokenCookieName,
            getRefreshTokenCookieOptions()
        );

        return res.status(200).json({
            success: true,
            message:
                "Logged out from all devices.",
        });
    } catch (error) {
        next(error);
    }
};

const getSessions = async (req, res, next) => {
    try {
        const sessions =
            await getActiveSessionsService(
                req.user._id
            );

        return res.status(200).json({
            success: true,
            data: {
                sessions,
            },
        });
    } catch (error) {
        next(error);
    }
};

const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        await changePasswordService({
            userId: req.user._id,
            currentPassword,
            newPassword,
        });

        return res.status(200).json({
            success: true,
            message: "Password changed successfully.",
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
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
};