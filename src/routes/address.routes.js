const express = require("express");

const {
    createAddress,
    getUserAddresses,
    getUserAddressById,
    updateAddress,
    setDefaultAddress,
    deleteAddress,
} = require("../controllers/address.controller");

const {
    authenticate,
} = require("../middleware/auth.middleware");

const {
    validate,
} = require("../middleware/validate.middleware");

const {
    createAddressSchema,
    updateAddressSchema,
    addressIdSchema,
    setDefaultAddressSchema,
} = require("../utils/address.validation");

const router = express.Router();

/*
 * ==========================================
 * CUSTOMER ADDRESSES
 * ==========================================
 */

/*
 * POST /api/addresses
 */
router.post(
    "/",
    authenticate,
    validate(createAddressSchema),
    createAddress
);

/*
 * GET /api/addresses
 */
router.get(
    "/",
    authenticate,
    getUserAddresses
);

/*
 * GET /api/addresses/:addressId
 */
router.get(
    "/:addressId",
    authenticate,
    validate(addressIdSchema),
    getUserAddressById
);

/*
 * PATCH /api/addresses/:addressId
 */
router.patch(
    "/:addressId",
    authenticate,
    validate(updateAddressSchema),
    updateAddress
);

/*
 * PATCH /api/addresses/:addressId/default
 */
router.patch(
    "/:addressId/default",
    authenticate,
    validate(setDefaultAddressSchema),
    setDefaultAddress
);

/*
 * DELETE /api/addresses/:addressId
 */
router.delete(
    "/:addressId",
    authenticate,
    validate(addressIdSchema),
    deleteAddress
);

module.exports = router;