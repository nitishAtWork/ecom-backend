const mongoose = require("mongoose");

const specificationSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },

        value: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500,
        },
    },
    {
        _id: false,
    }
);

const productSchema = new mongoose.Schema(
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

        shortDescription: {
            type: String,
            default: "",
            trim: true,
            maxlength: 500,
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

        price: {
            type: Number,
            required: true,
            min: 0,
        },

        compareAtPrice: {
            type: Number,
            default: null,
            min: 0,
        },

        stock: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },

        sku: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
            index: true,
        },

        brand: {
            type: String,
            default: null,
            trim: true,
            maxlength: 100,
        },

        specifications: {
            type: [specificationSchema],
            default: [],
        },

        isFeatured: {
            type: Boolean,
            default: false,
            index: true,
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

/*
 * Useful indexes for product listing.
 */
productSchema.index({
    name: "text",
    description: "text",
    shortDescription: "text",
    brand: "text",
});

productSchema.index({
    isActive: 1,
    isFeatured: 1,
    createdAt: -1,
});

productSchema.index({
    isActive: 1,
    price: 1,
});

module.exports = mongoose.model(
    "Product",
    productSchema
);