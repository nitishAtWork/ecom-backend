const express = require("express");

const {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    mergeCart,
} = require("../controllers/cart.controller");

const {
    ensureCart,
} = require("../middleware/cart.middleware");

const {
    optionalAuthenticate,
    authenticate,
} = require("../middleware/auth.middleware");

const {
    validate,
} = require("../middleware/validate.middleware");

const {
    addToCartSchema,
    updateCartItemSchema,
    removeCartItemSchema,
    emptyCartSchema,
} = require("../utils/cart.validation");

const router = express.Router();

/*
 * Authentication is optional for cart.
 *
 * Guest:
 *     cartId cookie
 *
 * Logged-in:
 *     req.user
 */
router.use(optionalAuthenticate);

router.use(ensureCart);

router.post(
    "/merge",
    authenticate,
    mergeCart
);

/*
 * GET /api/cart
 */
router.get(
    "/",
    getCart
);

/*
 * POST /api/cart/items
 */
router.post(
    "/items",
    validate(addToCartSchema),
    addToCart
);

/*
 * PATCH /api/cart/items/:productId
 */
router.patch(
    "/items/:productId",
    validate(updateCartItemSchema),
    updateCartItem
);

/*
 * DELETE /api/cart/items/:productId
 */
router.delete(
    "/items/:productId",
    validate(removeCartItemSchema),
    removeCartItem
);

/*
 * DELETE /api/cart
 */
router.delete(
    "/",
    validate(emptyCartSchema),
    clearCart
);

module.exports = router;