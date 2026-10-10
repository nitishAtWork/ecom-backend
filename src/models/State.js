const mongoose = require("mongoose");

const stateSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true,
            unique: true,
        },
        countryId: {
            type: mongoose.Schema.Types.ObjectId,
            trim: true,
            ref: "Country",
        },
        slug: {
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
    "State",
    stateSchema
);