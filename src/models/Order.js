const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        sku: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
        },

        img: {
            type: String,
            default: "",
            trim: true,
        },

        price: {
            type: Number,
            required: true,
            min: 0,
        },

        quantity: {
            type: Number,
            required: true,
            min: 1,
        },

        subtotal: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    {
        _id: false,
    }
);

const addressSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
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
    },
    {
        _id: false,
    }
);

const orderSchema = new mongoose.Schema(
    {
        /*
         * Human-readable order number.
         *
         * Example:
         * ORD-20260924-AB12CD
         */
        orderNumber: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        /*
         * User is required for an order.
         *
         * Guest checkout can be added later,
         * but for now checkout requires login.
         */
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        items: {
            type: [orderItemSchema],
            required: true,
            validate: {
                validator: (items) =>
                    Array.isArray(items) &&
                    items.length > 0,
                message:
                    "Order must contain at least one item.",
            },
        },

        shippingAddress: {
            type: addressSchema,
            required: true,
        },

        subtotal: {
            type: Number,
            required: true,
            min: 0,
        },

        shippingAmount: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },

        discountAmount: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },

        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },

        paymentMethod: {
            type: String,
            enum: [
                "COD",
                "ONLINE",
            ],
            required: true,
        },

        paymentProvider: {
            type: String,
            enum: [
                "COD",
                "UROPAY",
            ],
            default: "COD",
        },

        paymentOrderId: {
            type: String,
            default: null,
            index: true,
        },

        paymentOrderRef: {
            type: String,
            default: null,
            index: true,
        },

        paymentCheckoutUrl: {
            type: String,
            default: null,
        },

        paymentStatus: {
            type: String,
            enum: [
                "PENDING",
                "PAID",
                "FAILED",
                "EXPIRED",
                "CANCELLED",
            ],
            default: "PENDING",
            index: true,
        },

        paymentPaidAt: {
            type: Date,
            default: null,
        },

        orderStatus: {
            type: String,
            enum: [
                "PENDING",
                "CONFIRMED",
                "PROCESSING",
                "SHIPPED",
                "DELIVERED",
                "CANCELLED",
            ],
            default: "PENDING",
            index: true,
        },

        cancelledAt: {
            type: Date,
            default: null,
        },

        deliveredAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

orderSchema.index({
    user: 1,
    createdAt: -1,
});

orderSchema.index({
    orderStatus: 1,
    createdAt: -1,
});

module.exports = mongoose.model(
    "Order",
    orderSchema
);