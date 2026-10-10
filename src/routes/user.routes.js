const express = require("express");

const {
    getMe,
    updateMyProfile,
    getCustomersController,
    getCustomerController,
    updateCustomerController,
    toggleCustomerStatusController,
} = require(
    "../controllers/user.controller"
);

const {
    authenticate,
} = require(
    "../middleware/auth.middleware"
);

const {
    authorize,
} = require(
    "../middleware/role.middleware"
);

const {
    validate,
} = require(
    "../middleware/validate.middleware"
);

const {
    updateMyProfileSchema,
    adminListCustomersSchema,
    customerIdSchema,
    updateCustomerSchema,
} = require(
    "../utils/user.validation"
);

const router = express.Router();


/*
 * =========================================
 * ADMIN CUSTOMERS
 * =========================================
 *
 * IMPORTANT:
 * These routes must come before /:id
 * if you add generic ID routes later.
 */


/*
 * Get customers.
 *
 * GET /users/admin
 */
router.get(
    "/admin",
    authenticate,
    authorize(
        "ADMIN",
        "SUPERADMIN"
    ),
    validate(
        adminListCustomersSchema
    ),
    getCustomersController
);


/*
 * Get customer by ID.
 *
 * GET /users/admin/:id
 */
router.get(
    "/admin/:id",
    authenticate,
    authorize(
        "ADMIN",
        "SUPERADMIN"
    ),
    validate(
        customerIdSchema
    ),
    getCustomerController
);

router.patch(
    "/admin/:id",
    authenticate,
    authorize(
        "ADMIN",
        "SUPERADMIN"
    ),
    validate(
        updateCustomerSchema
    ),
    updateCustomerController
);

router.patch(
    "/admin/:id/toggle-status",
    authenticate,
    authorize(
        "ADMIN",
        "SUPERADMIN"
    ),
    validate(
        customerIdSchema
    ),
    toggleCustomerStatusController
);

/*
 * =========================================
 * CURRENT USER
 * =========================================
 */


/*
 * Current user.
 *
 * GET /users/me
 */
router.get(
    "/me",
    authenticate,
    getMe
);


/*
 * Update profile.
 *
 * PATCH /users/me
 */
router.patch(
    "/me",
    authenticate,
    validate(
        updateMyProfileSchema
    ),
    updateMyProfile
);


module.exports = router;