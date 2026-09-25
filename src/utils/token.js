const jwt = require("jsonwebtoken");

const generateAccessToken = (user) => {
    return jwt.sign(
        {
            userId: user._id.toString(),
            role: user.role,
        },
        process.env.JWT_ACCESS_SECRET,
        {
            expiresIn: process.env.JWT_ACCESS_EXPIRES || "15m",
        }
    );
};

const generateRefreshToken = (user, sessionId) => {
    return jwt.sign(
        {
            userId: user._id.toString(),
            sessionId: sessionId.toString(),
        },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: process.env.JWT_REFRESH_EXPIRES || "7d",
        }
    );
};

const verifyAccessToken = (token) => {
    return jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET
    );
};

const verifyRefreshToken = (token) => {
    return jwt.verify(
        token,
        process.env.JWT_REFRESH_SECRET
    );
};

const generatePasswordResetToken = (user) => {
    return jwt.sign(
        {
            userId: user._id.toString(),
            purpose: "PASSWORD_RESET",
            passwordResetVersion:
                user.passwordResetVersion,
        },
        process.env.JWT_RESET_SECRET,
        {
            expiresIn:
                process.env.JWT_RESET_EXPIRES || "10m",
        }
    );
};

const verifyPasswordResetToken = (token) => {
    const decoded = jwt.verify(
        token,
        process.env.JWT_RESET_SECRET
    );

    if (decoded.purpose !== "PASSWORD_RESET") {
        throw new Error(
            "Invalid password reset token."
        );
    }

    return decoded;
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    generatePasswordResetToken,
    verifyPasswordResetToken,
};