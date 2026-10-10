const mongoose = require("mongoose");

const pageSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        slug: {
            type: String,
            trim: true,
            unique: true,
        },
        shortDescription: {
            type: String,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        extraDescription: {
            type: String,
            trim: true
        },
        img: {
            type: String,
            trim: true
        },
        images: {
            type: [
                {
                    type: String,
                    trim: true,
                },
            ],
            default: [],
        },
        videoLink: {
            type: String,
            trim: true
        },
        isCustomSlug: {
            type: Boolean,
            default: false
        },
        metaTitle: {
            type: String,
            trim: true
        },
        metaDescription: {
            type: String,
            trim: true
        },
        metaKeywords: {
            type: String,
            trim: true
        },
        isActive: {
            type: Boolean,
            default: true
        },
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model(
    "Page",
    pageSchema
);
