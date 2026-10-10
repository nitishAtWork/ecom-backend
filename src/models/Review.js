const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            index: true,
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            default: null,
            index: true,
        },

        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },

        title: {
            type: String,
            default: "",
            trim: true,
            maxlength: 150,
        },

        comment: {
            type: String,
            required: true,
            trim: true,
            minlength: 5,
            maxlength: 3000,
        },

        /*
         * Review images
         *
         * Example:
         * [
         *   "/uploads/reviews/reviews-12345.webp",
         *   "/uploads/reviews/reviews-67890.jpg"
         * ]
         */
        images: {
            type: [String],
            default: [],
        },

        /*
         * Automatically true because the backend
         * only allows reviews for delivered orders.
         */
        isVerifiedPurchase: {
            type: Boolean,
            default: false,
        },

        /*
         * Keep this for future admin moderation.
         */
        isApproved: {
            type: Boolean,
            default: true,
            index: true,
        },

        moderationStatus: {
            type: String,
            enum: ["PENDING", "APPROVED", "REJECTED"],
            default: "PENDING",
        },

        isEdited: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

/*
 * One review per user per product.
 */
reviewSchema.index(
    {
        user: 1,
        product: 1,
    },
    {
        unique: true,
    }
);

/*
 * Product review listing.
 */
reviewSchema.index({
    product: 1,
    isApproved: 1,
    createdAt: -1,
});

module.exports = mongoose.model(
    "Review",
    reviewSchema
);