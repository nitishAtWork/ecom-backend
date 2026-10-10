const mongoose = require("mongoose");

const enquirySchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    subject: { type: String, trim: true },
    queryFor: { type: String , required: true},
    message: { type: String },
    company: { type: String, trim: true },
    address: { type: String, trim: true },
    currentUrl: { type: String, trim: true },

    read: { type: Boolean, default: false },
    comment: { type: String, trim: true },

    status: { type: String, enum: ["new", "in-progress", "resolved", "closed"], default: "new" },
    ip: { type: String }, // Track IP of sender
    userAgent: { type: String }, // Browser/device info
  },
  { timestamps: true }
);

module.exports = mongoose.model("Enquiry", enquirySchema);
