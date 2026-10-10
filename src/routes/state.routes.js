const express = require("express");

const {
    createState,
    updateState,
    deleteState,
    toggleStateStatus,
    getSingleState,
    getAllStates,
    getAllActiveStates,
} = require("../controllers/state.controller");

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
 * Get all active states
 *
 * GET /api/states/frontend
 */
router.get(
    "/frontend",
    getAllActiveStates
);


/**
 * --------------------------------------------------------------------------
 * Admin Routes
 * --------------------------------------------------------------------------
 */

/**
 * Get all states
 *
 * GET /api/states
 */
router.get(
    "/",
    authenticate,
    authorize("ADMIN", "SUPERADMIN"),
    getAllStates
);


/**
 * Get single state by ID
 *
 * GET /api/states/by-id/:id
 */
router.get(
    "/by-id/:id",
    authenticate,
    authorize("ADMIN", "SUPERADMIN"),
    getSingleState
);


/**
 * Create state
 *
 * POST /api/states
 */
router.post(
    "/",
    authenticate,
    authorize("ADMIN", "SUPERADMIN"),
    createState
);


/**
 * Update state
 *
 * PATCH /api/states/:id
 */
router.patch(
    "/:id",
    authenticate,
    authorize("ADMIN", "SUPERADMIN"),
    updateState
);


/**
 * Delete state
 *
 * DELETE /api/states/:id
 */
router.delete(
    "/:id",
    authenticate,
    authorize("ADMIN", "SUPERADMIN"),
    deleteState
);


/**
 * Toggle state active status
 *
 * PATCH /api/states/:id/toggle-status
 */
router.patch(
    "/:id/toggle-status",
    authenticate,
    authorize("ADMIN", "SUPERADMIN"),
    toggleStateStatus
);


module.exports = router;