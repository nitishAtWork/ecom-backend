const mongoose = require("mongoose");

const otpVerificationSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            index: true,
        },

        otpHash: {
            type: String,
            required: true,
        },

        purpose: {
            type: String,
            enum: [
                "EMAIL_VERIFICATION",
                "LOGIN",
                "PASSWORD_RESET",
            ],
            required: true,
            index: true,
        },

        attempts: {
            type: Number,
            default: 0,
        },

        verifiedAt: {
            type: Date,
            default: null,
        },

        expiresAt: {
            type: Date,
            required: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

/*
 * MongoDB automatically removes expired OTP documents.
 */
otpVerificationSchema.index(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
);

module.exports = mongoose.model(
    "OTPVerification",
    otpVerificationSchema
);