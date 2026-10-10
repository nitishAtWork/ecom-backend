const express = require("express");

const {
    createCountry,
    updateCountry,
    deleteCountry,
    toggleCountryStatus,
    getSingleCountry,
    getAllCountries,
    getAllActiveCountriesFront,
} = require("../controllers/country.controller");

const {
    authenticate,
} = require("../middleware/auth.middleware");

const {
    authorize,
} = require("../middleware/role.middleware");

const router = express.Router();

/**
 * --------------------------------------------------------------------------
 * Public / Frontend Routes
 * --------------------------------------------------------------------------
 */

/**
 * Get all active countries
 *
 * GET /api/countries/frontend
 */
router.get(
    "/frontend",
    getAllActiveCountriesFront
);


/**
 * --------------------------------------------------------------------------
 * Admin Routes
 * --------------------------------------------------------------------------
 */

/**
 * Get all countries
 *
 * GET /api/countries
 */
router.get(
    "/",
    authenticate,
    authorize("ADMIN", "SUPERADMIN"),
    getAllCountries
);


/**
 * Get single country by ID
 *
 * GET /api/countries/by-id/:id
 */
router.get(
    "/by-id/:id",
    authenticate,
    authorize("ADMIN", "SUPERADMIN"),
    getSingleCountry
);


/**
 * Create country
 *
 * POST /api/countries
 */
router.post(
    "/",
    authenticate,
    authorize("ADMIN", "SUPERADMIN"),
    createCountry
);


/**
 * Update country
 *
 * PATCH /api/countries/:id
 */
router.patch(
    "/:id",
    authenticate,
    authorize("ADMIN", "SUPERADMIN"),
    updateCountry
);


/**
 * Delete country
 *
 * DELETE /api/countries/:id
 */
router.delete(
    "/:id",
    authenticate,
    authorize("ADMIN", "SUPERADMIN"),
    deleteCountry
);


/**
 * Toggle country active status
 *
 * PATCH /api/countries/:id/toggle-status
 */
router.patch(
    "/:id/toggle-status",
    authenticate,
    authorize("ADMIN", "SUPERADMIN"),
    toggleCountryStatus
);


module.exports = router;