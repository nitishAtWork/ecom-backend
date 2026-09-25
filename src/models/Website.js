const mongoose = require("mongoose");

const websiteSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Website name is required."],
      trim: true,
    },

    tagLine: {
      type: String,
      trim: true,
      default: "",
    },

    logo: {
      type: String,
      required: [true, "Logo is required."],
      trim: true,
    },

    favicon: {
      type: String,
      required: [true, "Favicon is required."],
      trim: true,
    },

    footerText: {
      type: String,
      trim: true,
      default: "",
    },

    copyrightText: {
      type: String,
      trim: true,
      default: "",
    },

    googleMap: {
      type: String,
      trim: true,
      default: "",
    },

    // Emails
    primaryEmail: {
      type: String,
      required: [true, "Primary email is required."],
      trim: true,
      lowercase: true,
    },

    secondaryEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    thirdEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    fourthEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    // Phones
    primaryPhone: {
      type: String,
      required: [true, "Primary phone is required."],
      trim: true,
    },

    secondaryPhone: {
      type: String,
      trim: true,
      default: "",
    },

    thirdPhone: {
      type: String,
      trim: true,
      default: "",
    },

    fourthPhone: {
      type: String,
      trim: true,
      default: "",
    },

    // Addresses
    primaryAddress: {
      type: String,
      required: [true, "Primary address is required."],
      trim: true,
    },

    secondaryAddress: {
      type: String,
      trim: true,
      default: "",
    },

    thirdAddress: {
      type: String,
      trim: true,
      default: "",
    },

    fourthAddress: {
      type: String,
      trim: true,
      default: "",
    },

    // Social media
    facebook: {
      type: String,
      trim: true,
      default: "",
    },

    linkedin: {
      type: String,
      trim: true,
      default: "",
    },

    twitter: {
      type: String,
      trim: true,
      default: "",
    },

    instagram: {
      type: String,
      trim: true,
      default: "",
    },

    pinterest: {
      type: String,
      trim: true,
      default: "",
    },

    youtube: {
      type: String,
      trim: true,
      default: "",
    },

    tumblr: {
      type: String,
      trim: true,
      default: "",
    },

    whatsapp: {
      type: String,
      trim: true,
      default: "",
    },

    // Website / SEO
    domain: {
      type: String,
      trim: true,
      default: "",
    },

    googleAnalytics: {
      type: String,
      trim: true,
      default: "",
    },

    googleSearchConsole: {
      type: String,
      trim: true,
      default: "",
    },

    robots: {
      type: Boolean,
      default: true,
    },

    panIndia: {
      type: Boolean,
      default: false,
    },

    // Internal API identifier
    apiId: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Website = mongoose.model("Website", websiteSchema);

module.exports = Website;