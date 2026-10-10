const Enquiry = require("../models/Enquiry");

const createEnquiry = async (req, res) => {
    try {
        const {
            name,
            phone,
            email,
            subject,
            queryFor,
            message,
            company,
            address,
            currentUrl,
        } = req.body;

        // Create inquiry if reCAPTCHA passes
        const inquiry = new Enquiry({
            name,
            phone,
            email,
            subject,
            queryFor,
            message,
            company,
            address,
            currentUrl,
            ip: req.ip,
            userAgent: req.headers["user-agent"],
        });

        await inquiry.save();

        // Send email notification
        // await sendEnquiryEmail(req.body);

        res.status(201).json({
            success: true,
            message: "Enquiry submitted successfully",
            data: inquiry,
        });
    } catch (error) {
        console.error("Error creating inquiry:", error);
        res
            .status(500)
            .json({ success: false, message: "Server error", error: error.message });
    }
};

// Get all inquiries
const getInquiries = async (req, res) => {
    try {
        const inquiries = await Enquiry.find().sort({ createdAt: -1 });
        res.json({ success: true, data: inquiries });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error });
    }
};

// Get single inquiry by ID
const getEnquiryById = async (req, res) => {
    try {
        const inquiry = await Enquiry.findById(req.params.id);
        if (!inquiry) return res.status(404).json({ success: false, message: "Enquiry not found" });
        res.json({ success: true, data: inquiry });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error });
    }
};

// Update inquiry (mark as read, add comment, change status)
const updateEnquiry = async (req, res) => {
    try {
        const { read, comment, status } = req.body;
        const inquiry = await Enquiry.findByIdAndUpdate(
            req.params.id,
            { $set: { read, comment, status } },
            { new: true }
        );
        if (!inquiry) return res.status(404).json({ success: false, message: "Enquiry not found" });
        res.json({ success: true, message: "Enquiry updated", data: inquiry });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error });
    }
};

// Delete inquiry
const deleteEnquiry = async (req, res) => {
    try {
        const inquiry = await Enquiry.findByIdAndDelete(req.params.id);
        if (!inquiry) return res.status(404).json({ success: false, message: "Enquiry not found" });
        res.json({ success: true, message: "Enquiry deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error });
    }
};

// Mark inquiry as read (toggle)
const markEnquiryAsRead = async (req, res) => {
    try {
        const inquiry = await Enquiry.findByIdAndUpdate(
            req.params.id,
            { $set: { read: true } },
            { new: true }
        );

        if (!inquiry) {
            return res.status(404).json({ success: false, message: "Enquiry not found" });
        }

        res.json({ success: true, message: "Enquiry marked as read", data: inquiry });
    } catch (error) {
        console.error("Error marking inquiry as read:", error);
        res.status(500).json({ success: false, message: "Server error", error });
    }
};

// Toggle inquiry read status (true <-> false)
const toggleEnquiryReadStatus = async (req, res) => {
    try {
        // Find the current inquiry
        const inquiry = await Enquiry.findById(req.params.id);

        if (!inquiry) {
            return res.status(404).json({ success: false, message: "Enquiry not found" });
        }

        // Toggle the read status
        const updatedEnquiry = await Enquiry.findByIdAndUpdate(
            req.params.id,
            { $set: { read: !inquiry.read } },
            { new: true }
        );

        res.json({
            success: true,
            message: `Enquiry marked as ${updatedEnquiry.read ? "read" : "unread"}`,
            data: updatedEnquiry,
        });
    } catch (error) {
        console.error("Error toggling inquiry read status:", error);
        res.status(500).json({ success: false, message: "Server error", error });
    }
};

module.exports = {
    createEnquiry,
    getInquiries,
    getEnquiryById,
    updateEnquiry,
    deleteEnquiry,
    markEnquiryAsRead,
    toggleEnquiryReadStatus,
}



