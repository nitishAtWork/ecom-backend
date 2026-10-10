const express = require("express");

const {
  createEnquiry,
  getInquiries,
  getEnquiryById,
  updateEnquiry,
  deleteEnquiry,
  markEnquiryAsRead,
  toggleEnquiryReadStatus,
} = require("../controllers/enquiry.controller");

const {
    authenticate,
} = require("../middleware/auth.middleware");

const {
    authorize,
} = require("../middleware/role.middleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

// Create enquiry from frontend/contact form
router.post("/", createEnquiry);


/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/

// Get all enquiries
router.get(
  "/",
  authenticate,
  authorize("ADMIN", "SUPERADMIN"),
  getInquiries
);

// Get single enquiry
router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "SUPERADMIN"),
  getEnquiryById
);

// Update enquiry
router.patch(
  "/:id",
  authenticate,
  authorize("ADMIN", "SUPERADMIN"),
  updateEnquiry
);

// Delete enquiry
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN", "SUPERADMIN"),
  deleteEnquiry
);

// Mark enquiry as read
router.patch(
  "/:id/read",
  authenticate,
  authorize("ADMIN", "SUPERADMIN"),
  markEnquiryAsRead
);

// Toggle read/unread status
router.patch(
  "/:id/toggle-read",
  authenticate,
  authorize("ADMIN", "SUPERADMIN"),
  toggleEnquiryReadStatus
);

module.exports = router;