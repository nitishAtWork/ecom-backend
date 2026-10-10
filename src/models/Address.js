const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        label: {
            type: String,
            enum: ["HOME", "WORK", "OTHER"],
            default: "HOME",
            trim: true,
        },

        fullName: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100,
        },

        phone: {
            type: String,
            required: true,
            trim: true,
            maxlength: 20,
        },

        addressLine1: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },

        addressLine2: {
            type: String,
            default: "",
            trim: true,
            maxlength: 200,
        },

        city: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },

        state: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },

        postalCode: {
            type: String,
            required: true,
            trim: true,
            maxlength: 20,
        },

        country: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
            default: "India",
        },

        isDefault: {
            type: Boolean,
            default: false,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

addressSchema.index({
    user: 1,
    createdAt: -1,
});

addressSchema.index({
    user: 1,
    isDefault: 1,
});

module.exports = mongoose.model(
    "Address",
    addressSchema
);