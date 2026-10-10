const mongoose = require("mongoose");

const natureOfBusinessSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true,
            unique: true,
        },
        slug: {
            type: String,
            trim: true,
            required: true,
            unique: true,
        },
        shortDescription: {
            type: String,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        extraDescription: {
            type: String,
            trim: true,
        },
        metaTitle: {
            type: String,
            trim: true,
        },
        metaDescription: {
            type: String,
            trim: true,
        },
        metaKeywords: {
            type: String,
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "NatureOfBusiness",
    natureOfBusinessSchema
);
