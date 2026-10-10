const express = require("express");

const {
    createNatureOfBusiness,
    updateNatureOfBusiness,
    deleteNatureOfBusiness,
    toggleNatureOfBusinessStatus,
    getSingleNatureOfBusiness,
    getAllNatureOfBusiness,
    getAllActiveNatureOfBusiness,
    natureOfBusinessFrontend,
} = require("../controllers/natureOfBusiness.controller");

const {
    authenticate,
} = require("../middleware/auth.middleware");

const {
    authorize,
} = require("../middleware/role.middleware");

const router = express.Router();


/* =========================================================
   FRONTEND
========================================================= */

// All active nature of business
router.get(
    "/frontend",
    getAllActiveNatureOfBusiness
);


// Nature of business + keyword dynamic page
router.get(
    "/frontend/:natureSlug/:keywordSlug",
    natureOfBusinessFrontend
);


/* =========================================================
   ADMIN
========================================================= */

// Get all
router.get(
    "/",
    authenticate,
    authorize("ADMIN", "SUPERADMIN"),
    getAllNatureOfBusiness
);


// Get single
router.get(
    "/by-id/:id",
    authenticate,
    authorize("ADMIN", "SUPERADMIN"),
    getSingleNatureOfBusiness
);


// Create
router.post(
    "/",
    authenticate,
    authorize("ADMIN", "SUPERADMIN"),
    createNatureOfBusiness
);


// Update
router.patch(
    "/:id",
    authenticate,
    authorize("ADMIN", "SUPERADMIN"),
    updateNatureOfBusiness
);


// Delete
router.delete(
    "/:id",
    authenticate,
    authorize("ADMIN", "SUPERADMIN"),
    deleteNatureOfBusiness
);


// Toggle status
router.patch(
    "/:id/toggle-status",
    authenticate,
    authorize("ADMIN", "SUPERADMIN"),
    toggleNatureOfBusinessStatus
);


module.exports = router;