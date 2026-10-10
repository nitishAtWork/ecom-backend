const mongoose = require("mongoose");

const ourPresenceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
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
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("OurPresence", ourPresenceSchema);
