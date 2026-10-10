const {
    getCartWithTotals,
    addToCart: addToCartService,
    updateCartItem: updateCartItemService,
    removeFromCart,
    clearCart: clearCartService,
    mergeGuestCartIntoUserCart,
} = require("../services/cart.service");

/*
 * GET /api/cart
 */
const getCart = async (
    req,
    res,
    next
) => {
    try {
        const result =
            await getCartWithTotals({
                cartId: req.cartId,
                userId:
                    req.user?._id || null,
            });

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

/*
 * POST /api/cart/items
 */
const addToCart = async (
    req,
    res,
    next
) => {
    try {
        const {
            productId,
            quantity,
        } = req.body;

        const result =
            await addToCartService({
                cartId: req.cartId,

                userId:
                    req.user?._id || null,

                productId,

                quantity,
            });

        return res.status(200).json({
            success: true,
            message:
                "Product added to cart successfully.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

/*
 * PATCH /api/cart/items/:productId
 */
const updateCartItem = async (
    req,
    res,
    next
) => {
    try {
        const {
            productId,
        } = req.params;

        const {
            quantity,
        } = req.body;

        const cart =
            await updateCartItemService({
                cartId: req.cartId,
                productId,
                quantity,
                userId:
                    req.user?._id || null,
            });

        return res.status(200).json({
            success: true,
            message:
                "Cart item updated successfully.",
            data: cart,
        });
    } catch (error) {
        next(error);
    }
};

const findCart = async ({
    cartId,
    userId,
}) => {
    if (userId) {
        return Cart.findOne({
            user: userId,
        });
    }

    if (cartId) {
        return Cart.findOne({
            cartId,
            user: null,
        });
    }

    return null;
};

/*
 * DELETE /api/cart/items/:productId
 */
const removeCartItem = async (
    req,
    res,
    next
) => {
    try {
        const cart =
            await removeFromCart({
                cartId: req.cartId,
                productId:
                    req.params.productId,
                userId:
                    req.user?._id || null,
            });

        return res.status(200).json({
            success: true,
            message:
                "Product removed from cart.",
            data: cart,
        });
    } catch (error) {
        next(error);
    }
};

/*
 * DELETE /api/cart
 */
const clearCart = async (
    req,
    res,
    next 
) => {
    try {
        const cart =
            await clearCartService(
                {
                    cartId: req.cartId,
                    userId: req.user?._id || null,
                }
            );

        return res.status(200).json({
            success: true,
            message:
                "Cart cleared successfully.",
           data: cart,
        });
    } catch (error) {
        next(error);
    }
};

/*
 * POST /api/cart/merge
 *
 * Requires login.
 */
const mergeCart = async (
    req,
    res,
    next
) => {
    try {
        const {
            cartId,
        } = req.body;

        // console.log(
        //     "========== MERGE CART =========="
        // );

        // console.log(
        //     "BODY.CART_ID:",
        //     cartId
        // );

        // console.log(
        //     "REQ.CART_ID:",
        //     req.cartId
        // );

        // console.log(
        //     "REQ.USER_ID:",
        //     req.user?._id
        // );

        // console.log(
        //     "REQ.COOKIES:",
        //     req.cookies
        // );

        // console.log(
        //     "================================="
        // );

        const cart =
            await mergeGuestCartIntoUserCart({
                cartId,

                userId:
                    req.user._id,
            });

        return res.status(200).json({
            success: true,
            message:
                "Cart merged successfully.",
            data: cart,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    mergeCart,
};