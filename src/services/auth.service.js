const crypto = require("crypto");
const User = require("../models/User");

const Session = require("../models/Session");

const {
    hashPassword,
    comparePassword,
} = require("../utils/password");

const {
    sendEmailVerificationOTP,
    sendPasswordResetOTP,
} = require("./authEmail.service");

const {
    createSession,
    findSession,
    rotateRefreshToken,
    revokeSession,
    revokeAllUserSessions,
    getUserSessions,
    isRefreshTokenValid,
} = require("./session.service");

const {
    generateAccessToken,
    verifyRefreshToken,
    generatePasswordResetToken,
    verifyPasswordResetToken,
} = require("../utils/token");

const {
    verifyOTP,
} = require("./otp.service");


/*
|--------------------------------------------------------------------------
| Register User
|--------------------------------------------------------------------------
*/

const registerUser = async ({
    name,
    email,
    password,
}) => {
    email = email.toLowerCase().trim();

    /*
     * Check existing user
     */
    const existingUser = await User.findOne({
        email,
    });

    if (existingUser) {

        /*
         * If account exists but email isn't verified,
         * don't create another account.
         *
         * The frontend can ask the user to verify
         * their existing account.
         */
        if (!existingUser.emailVerified) {

            const error = new Error(
                "An account with this email already exists but has not been verified."
            );

            error.statusCode = 409;

            throw error;
        }

        const error = new Error(
            "An account with this email already exists."
        );

        error.statusCode = 409;

        throw error;
    }

    /*
     * Hash password
     */
    const hashedPassword =
        await hashPassword(password);

    /*
     * Public registration ALWAYS creates USER.
     *
     * Never accept role from req.body.
     */
    const user = await User.create({
        name,
        email,
        password: hashedPassword,

        role: "USER",

        emailVerified: false,

        authProviders: [
            {
                provider: "local",
                providerId: null,
            },
        ],
    });

    /*
     * Send verification OTP
     */
    try {

        await sendEmailVerificationOTP({
            email: user.email,
            name: user.name,
        });

    } catch (error) {

        /*
         * Roll back user creation if
         * email sending fails.
         */
        await User.deleteOne({
            _id: user._id,
        });

        throw error;
    }

    return {
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            emailVerified: user.emailVerified,
        },
    };
};


/*
|--------------------------------------------------------------------------
| Verify Email
|--------------------------------------------------------------------------
*/

const verifyEmail = async ({
    email,
    otp,
}) => {

    email = email.toLowerCase().trim();

    const user = await User.findOne({
        email,
    });

    if (!user) {

        const error = new Error(
            "User not found."
        );

        error.statusCode = 404;

        throw error;
    }

    if (user.emailVerified) {

        const error = new Error(
            "Email is already verified."
        );

        error.statusCode = 400;

        throw error;
    }

    /*
     * Verify OTP
     */
    await verifyOTP({
        email,
        otp,
        purpose: "EMAIL_VERIFICATION",
    });

    /*
     * Mark email verified
     */
    user.emailVerified = true;

    await user.save();

    return {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
    };
};


/*
|--------------------------------------------------------------------------
| Resend Email Verification OTP
|--------------------------------------------------------------------------
*/

const resendEmailVerificationOTP = async ({
    email,
}) => {

    email = email.toLowerCase().trim();

    /*
     * Find user
     */
    const user = await User.findOne({
        email,
    });

    /*
     * Don't reveal too much information.
     *
     * For now we return a generic message.
     */
    if (!user) {

        return {
            message:
                "If an account exists with this email, a verification OTP will be sent.",
        };
    }

    /*
     * Already verified
     */
    if (user.emailVerified) {

        const error = new Error(
            "This email is already verified."
        );

        error.statusCode = 400;

        throw error;
    }

    /*
     * Generate and send a new OTP
     *
     * otp.service handles:
     *
     * - cooldown
     * - previous OTP invalidation
     * - expiration
     * - hashing
     */
    await sendEmailVerificationOTP({
        email: user.email,
        name: user.name,
    });

    return {
        message:
            "A new verification OTP has been sent to your email.",
    };
};

/*
|--------------------------------------------------------------------------
| Login with Password
|--------------------------------------------------------------------------
*/

const loginUser = async ({
    email,
    password,
    userAgent,
    ipAddress,
}) => {

    email = email.toLowerCase().trim();


    /*
     * Find user.
     *
     * password is select:false,
     * so explicitly request it.
     */
    const user = await User.findOne({
        email,
    }).select("+password");


    /*
     * Don't reveal whether the email exists.
     */
    if (!user) {

        const error = new Error(
            "Invalid email or password."
        );

        error.statusCode = 401;

        throw error;
    }


    /*
     * Check account status
     */
    if (!user.isActive) {

        const error = new Error(
            "Your account has been disabled."
        );

        error.statusCode = 403;

        throw error;
    }


    /*
     * Email must be verified
     */
    if (!user.emailVerified) {

        const error = new Error(
            "Please verify your email before logging in."
        );

        error.statusCode = 403;

        throw error;
    }


    /*
     * Check password
     */
    const passwordMatches =
        await comparePassword(
            password,
            user.password
        );


    if (!passwordMatches) {

        const error = new Error(
            "Invalid email or password."
        );

        error.statusCode = 401;

        throw error;
    }


    /*
     * Update last login
     */
    user.lastLoginAt = new Date();

    await user.save();


    /*
     * Generate access token
     */
    const accessToken =
        generateAccessToken(user);


    /*
     * Create refresh-token session
     */
    const session =
        await createSession({
            user,

            userAgent,

            ipAddress,
        });


    return {

        accessToken,

        refreshToken:
            session.refreshToken,

        refreshTokenExpiresAt:
            session.expiresAt,

        user: {

            id: user._id,

            name: user.name,

            email: user.email,

            role: user.role,

            emailVerified:
                user.emailVerified,

            avatar: user.avatar,

        },

    };
};

/*
|--------------------------------------------------------------------------
| Refresh Access Token
|--------------------------------------------------------------------------
*/

const refreshAccessToken = async (refreshToken) => {
    if (!refreshToken) {
        const error = new Error(
            "Refresh token is required."
        );

        error.statusCode = 401;

        throw error;
    }

    let decoded;

    try {
        decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
        const authError = new Error(
            "Invalid or expired refresh token."
        );

        authError.statusCode = 401;

        throw authError;
    }

    const session = await findSession(
        decoded.sessionId
    );

    if (!session) {
        const error = new Error(
            "Session is no longer valid."
        );

        error.statusCode = 401;

        throw error;
    }

    const tokenMatches =
        isRefreshTokenValid(
            refreshToken,
            session.refreshTokenHash
        );

    if (!tokenMatches) {
        /*
         * The token is structurally valid but does not
         * match the currently stored token.
         *
         * This can indicate refresh-token reuse.
         *
         * Revoke this session immediately.
         */
        await revokeSession(session._id);

        const error = new Error(
            "Invalid refresh token."
        );

        error.statusCode = 401;

        throw error;
    }

    const user = await User.findById(
        decoded.userId
    );

    if (!user || !user.isActive) {
        await revokeSession(session._id);

        const error = new Error(
            "User account is no longer active."
        );

        error.statusCode = 401;

        throw error;
    }

    /*
     * Generate a new access token.
     */
    const accessToken =
        generateAccessToken(user);

    /*
     * Rotate the refresh token.
     */
    const {
        refreshToken: newRefreshToken,
        expiresAt,
    } = await rotateRefreshToken({
        session,
        user,
    });

    return {
        accessToken,
        refreshToken: newRefreshToken,
        refreshTokenExpiresAt: expiresAt,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            emailVerified:
                user.emailVerified,
            avatar: user.avatar,
        },
    };
};

/*
|--------------------------------------------------------------------------
| Send Login OTP
|--------------------------------------------------------------------------
*/

const sendLoginOTP = async ({
    email,
}) => {

    email = email.toLowerCase().trim();


    /*
     * Find user
     */
    const user = await User.findOne({
        email,
    });


    /*
     * Generic response for unknown emails.
     *
     * This prevents account enumeration.
     */
    if (!user) {

        return {
            message:
                "If an account exists with this email, a login OTP will be sent.",
        };
    }


    /*
     * Check account status
     */
    if (!user.isActive) {

        /*
         * Don't reveal account status.
         */
        return {
            message:
                "If an account exists with this email, a login OTP will be sent.",
        };
    }


    /*
     * Email must be verified.
     */
    if (!user.emailVerified) {

        const error = new Error(
            "Please verify your email before using OTP login."
        );

        error.statusCode = 403;

        throw error;
    }


    /*
     * Send OTP
     */
    await require("./authEmail.service")
        .sendLoginOTP({
            email: user.email,
            name: user.name,
        });


    return {
        message:
            "If an account exists with this email, a login OTP will be sent.",
    };
};

/*
|--------------------------------------------------------------------------
| Login with OTP
|--------------------------------------------------------------------------
*/

const loginWithOTP = async ({
    email,
    otp,
    userAgent,
    ipAddress,
}) => {

    email = email.toLowerCase().trim();


    /*
     * Find user
     */
    const user = await User.findOne({
        email,
    });


    if (!user) {

        const error = new Error(
            "Invalid email or OTP."
        );

        error.statusCode = 401;

        throw error;
    }


    /*
     * Check account
     */
    if (!user.isActive) {

        const error = new Error(
            "Invalid email or OTP."
        );

        error.statusCode = 401;

        throw error;
    }


    /*
     * Email must already be verified.
     */
    if (!user.emailVerified) {

        const error = new Error(
            "Please verify your email before logging in."
        );

        error.statusCode = 403;

        throw error;
    }


    /*
     * Verify OTP
     */
    await verifyOTP({
        email,
        otp,
        purpose: "LOGIN",
    });


    /*
     * Update login time
     */
    user.lastLoginAt = new Date();

    await user.save();


    /*
     * Generate access token
     */
    const accessToken =
        generateAccessToken(user);


    /*
     * Create refresh session
     */
    const session =
        await createSession({
            user,

            userAgent,

            ipAddress,
        });


    return {

        accessToken,

        refreshToken:
            session.refreshToken,

        refreshTokenExpiresAt:
            session.expiresAt,

        user: {

            id: user._id,

            name: user.name,

            email: user.email,

            role: user.role,

            emailVerified:
                user.emailVerified,

            avatar:
                user.avatar,

        },

    };
};

/*
|--------------------------------------------------------------------------
| Forgot Password
|--------------------------------------------------------------------------
*/

const forgotPassword = async ({
    email,
}) => {

    email = email.toLowerCase().trim();

    /*
     * Find user
     */
    const user = await User.findOne({
        email,
    });

    /*
     * Always return a generic response.
     *
     * This prevents email/account enumeration.
     */
    if (!user) {

        return {
            message:
                "If an account exists with this email, a password reset OTP will be sent.",
        };
    }

    /*
     * Don't send reset OTP to disabled accounts.
     *
     * Still return the generic response.
     */
    if (!user.isActive) {

        return {
            message:
                "If an account exists with this email, a password reset OTP will be sent.",
        };
    }


    /*
     * Email should be verified.
     */
    if (!user.emailVerified) {

        return {
            message:
                "If an account exists with this email, a password reset OTP will be sent.",
        };
    }


    /*
     * Send password reset OTP
     */
    await sendPasswordResetOTP({
        email: user.email,
        name: user.name,
    });


    return {
        message:
            "If an account exists with this email, a password reset OTP will be sent.",
    };
};

/*
|--------------------------------------------------------------------------
| Verify Password Reset OTP
|--------------------------------------------------------------------------
*/

const verifyPasswordResetOTP = async ({
    email,
    otp,
}) => {

    email = email.toLowerCase().trim();


    /*
     * Find user
     */
    const user = await User.findOne({
        email,
    });


    if (!user) {

        const error = new Error(
            "Invalid email or OTP."
        );

        error.statusCode = 400;

        throw error;
    }


    if (!user.isActive) {

        const error = new Error(
            "Invalid email or OTP."
        );

        error.statusCode = 400;

        throw error;
    }


    /*
     * Verify OTP
     */
    await verifyOTP({
        email,
        otp,
        purpose: "PASSWORD_RESET",
    });


    /*
     * Generate a separate short-lived
     * password reset token.
     */
   const resetToken =
    generatePasswordResetToken(user);

    return {
        resetToken,
        expiresIn: "10m",
    };
};

/*
|--------------------------------------------------------------------------
| Reset Password
|--------------------------------------------------------------------------
*/

// const resetPassword = async ({
//     resetToken,
//     newPassword,
// }) => {

//     /*
//      * Validate reset token
//      */
//     let decoded;

//     try {

//         decoded =
//             verifyPasswordResetToken(
//                 resetToken
//             );

//     } catch (error) {

//         const resetError = new Error(
//             "Invalid or expired password reset token."
//         );

//         resetError.statusCode = 401;

//         throw resetError;
//     }


//     /*
//      * Find user
//      */
//     const user = await User.findById(
//         decoded.userId
//     );


//     if (!user) {

//         const error = new Error(
//             "User not found."
//         );

//         error.statusCode = 404;

//         throw error;
//     }


//     if (!user.isActive) {

//         const error = new Error(
//             "Your account has been disabled."
//         );

//         error.statusCode = 403;

//         throw error;
//     }


//     /*
//      * Hash new password
//      */
//     const hashedPassword =
//         await hashPassword(
//             newPassword
//         );


//     user.password =
//         hashedPassword;


//     /*
//      * Ensure local authentication
//      * provider exists.
//      */
//     const hasLocalProvider =
//         user.authProviders.some(
//             (provider) =>
//                 provider.provider === "local"
//         );


//     if (!hasLocalProvider) {

//         user.authProviders.push({
//             provider: "local",
//             providerId: null,
//         });

//     }


//     await user.save();


//     /*
//      * Revoke ALL existing sessions.
//      *
//      * This logs the user out from
//      * existing browsers/devices.
//      */
//     await Session.updateMany(
//         {
//             user: user._id,
//             revokedAt: null,
//         },
//         {
//             revokedAt: new Date(),
//         }
//     );


//     return {
//         message:
//             "Password reset successfully. Please log in again.",
//     };
// };

const resetPassword = async ({
    resetToken,
    newPassword,
}) => {
    let decoded;

    try {
        decoded =
            verifyPasswordResetToken(
                resetToken
            );
    } catch (error) {
        const authError = new Error(
            "Invalid or expired password reset token."
        );

        authError.statusCode = 400;

        throw authError;
    }

    const user = await User.findById(
        decoded.userId
    ).select("+password");

    if (!user) {
        const error = new Error(
            "Invalid password reset request."
        );

        error.statusCode = 400;

        throw error;
    }

    if (!user.isActive) {
        const error = new Error(
            "Your account is disabled."
        );

        error.statusCode = 403;

        throw error;
    }

    /*
     * Check whether this reset token has already been used.
     */
    if (
        decoded.passwordResetVersion !==
        user.passwordResetVersion
    ) {
        const error = new Error(
            "This password reset token is no longer valid."
        );

        error.statusCode = 400;

        throw error;
    }

    const hashedPassword =
        await hashPassword(newPassword);

    user.password = hashedPassword;

    /*
     * Incrementing this invalidates the current
     * password-reset token immediately.
     */
    user.passwordResetVersion += 1;

    /*
     * Make sure the account has a local
     * authentication provider.
     */
    const hasLocalProvider =
        user.authProviders?.some(
            (provider) =>
                provider.provider === "local"
        );

    if (!hasLocalProvider) {
        user.authProviders.push({
            provider: "local",
            providerId: null,
        });
    }

    await user.save();

    /*
     * Password changes invalidate every existing login.
     */
    await revokeAllUserSessions(user._id);

    return true;
};

const changePassword = async ({
    userId,
    currentPassword,
    newPassword,
}) => {
    const user = await User.findById(userId).select("+password");

    const isMatch = await comparePassword(
        currentPassword,
        user.password
    );

    if (!isMatch) {
        const error = new Error("Current password is incorrect.");
        error.statusCode = 400;
        throw error;
    }

    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;

    await user.save();

    await revokeAllUserSessions(user._id);

    return true;
};

const logoutAllDevices = async (userId) => {
    await revokeAllUserSessions(userId);

    return true;
};

const getActiveSessions = async (userId) => {
    return getUserSessions(userId);
};

module.exports = {
    registerUser,
    verifyEmail,
    resendEmailVerificationOTP,
    loginUser,
    sendLoginOTP,
    loginWithOTP,
    forgotPassword,
    verifyPasswordResetOTP,
    resetPassword,
    changePassword,
    refreshAccessToken,
    logoutAllDevices,
    getActiveSessions,
};