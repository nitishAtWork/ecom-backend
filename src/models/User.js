const mongoose = require("mongoose");

const authProviderSchema = new mongoose.Schema(
    {
        provider: {
            type: String,
            enum: ["local", "google"],
            required: true,
        },

        providerId: {
            type: String,
            default: null,
        },
    },
    {
        _id: false,
    }
);

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },

        password: {
            type: String,
            select: false,
        },

        passwordResetVersion: {
            type: Number,
            default: 0,
        },

        role: {
            type: String,
            enum: [
                "SUPERADMIN",
                "ADMIN",
                "USER",
            ],
            default: "USER",
            index: true,
        },

        emailVerified: {
            type: Boolean,
            default: false,
        },

        authProviders: {
            type: [authProviderSchema],
            default: [
                {
                    provider: "local",
                    providerId: null,
                },
            ],
        },

        avatar: {
            type: String,
            default: null,
        },

        phone: {
            type: String,
            default: null,
            trim: true,
        },

        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },

        deletedAt: {
            type: Date,
            default: null,
            index: true,
        },

        lastLoginAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.index({
    createdAt: -1,
});

userSchema.index({
    role: 1,
    isActive: 1,
});

module.exports = mongoose.model(
    "User",
    userSchema
);