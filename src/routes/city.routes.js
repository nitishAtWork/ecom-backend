const express = require("express");

const {
    createCity,
    updateCity,
    deleteCity,
    toggleCityStatus,
    getSingleCity,
    getAllCities,
    getAllActiveCities,
} = require("../controllers/city.controller");

const {
    authenticate,
} = require("../middleware/auth.middleware");

const {
    authorize,
} = require("../middleware/role.middleware");

const router = express.Router();

/**
 * Frontend
 * GET /api/cities/frontend
 */
router.get(
    "/frontend",
    getAllActiveCities
);

/**
 * Admin - Get all cities
 * GET /api/cities
 */
router.get(
    "/",
    authenticate,
    authorize("ADMIN", "SUPERADMIN"),
    getAllCities
);

/**
 * Admin - Get single city
 * GET /api/cities/by-id/:id
 */
router.get(
    "/by-id/:id",
    authenticate,
    authorize("ADMIN", "SUPERADMIN"),
    getSingleCity
);

/**
 * Admin - Create city
 * POST /api/cities
 */
router.post(
    "/",
    authenticate,
    authorize("ADMIN", "SUPERADMIN"),
    createCity
);

/**
 * Admin - Update city
 * PATCH /api/cities/:id
 */
router.patch(
    "/:id",
    authenticate,
    authorize("ADMIN", "SUPERADMIN"),
    updateCity
);

/**
 * Admin - Delete city
 * DELETE /api/cities/:id
 */
router.delete(
    "/:id",
    authenticate,
    authorize("ADMIN", "SUPERADMIN"),
    deleteCity
);

/**
 * Admin - Toggle city status
 * PATCH /api/cities/:id/toggle-status
 */
router.patch(
    "/:id/toggle-status",
    authenticate,
    authorize("ADMIN", "SUPERADMIN"),
    toggleCityStatus
);

module.exports = router;