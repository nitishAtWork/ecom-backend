const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema(
    {
        question: {
            type: String,
            required: true,
            trim: true,
        },
        answer: {
            type: String,
            required: true,
            trim: true,
        },
    },
    { _id: false }
);

const keywordSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 200,
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },

        description: {
            type: String,
            default: "",
            trim: true,
        },

        extraDescription: {
            type: String,
            default: "",
            trim: true,
        },

        shortDescription: {
            type: String,
            default: "",
            trim: true,
            maxlength: 500,
        },

        icon: {
            type: String,
            default: "",
            trim: true,
        },

        img: {
            type: String,
            default: "",
            trim: true,
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

        size: {
            type: String,
            default: null,
            trim: true,
            maxlength: 500,
        },

        faqs: {
            type: [faqSchema],
            default: [],
        },
        // specifications: {
        //     type: [faqSchema],
        //     default: [],
        // },

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
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

/**
 * Keyword name must be unique.
 *
 * Case-insensitive:
 * "Dildo", "dildo", and "DILDO"
 * are considered the same name.
 */
keywordSchema.index(
    { name: 1 },
    {
        unique: true,
        collation: {
            locale: "en",
            strength: 2,
        },
    }
);

module.exports = mongoose.model("Keyword", keywordSchema);