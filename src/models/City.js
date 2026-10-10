const mongoose = require("mongoose");

const citySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    countryId: {
      type: mongoose.Schema.Types.ObjectId,
      trim: true,
      ref: "Country",
    },
    stateId: {
      type: mongoose.Schema.Types.ObjectId,
      trim: true,
      ref: "State",
    },
    slug: {
      type: String,
      trim: true,
    },
    majorcity: {
      type: Boolean,
      default: false,
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
    "City",
    citySchema
);
