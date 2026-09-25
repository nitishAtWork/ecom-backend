const {
    getOrCreateGuestCart,
    getUserCart,
    addToCart: addToCartService,
    updateCartItem: updateCartItemService,
    removeFromCart,
    clearCart: clearCartService,
    mergeGuestCartIntoUserCart,
    getCartWithTotals,
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
                userId: req.user?._id,
            });

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const addToCart = async ({
    cartId,
    userId,
    productId,
    quantity,
}) => {
    const product = await Product.findOne({
        _id: productId,
        isActive: true,
    }).lean();

    if (!product) {
        const error = new Error(
            "Product is not available."
        );

        error.statusCode = 404;

        throw error;
    }

    if (product.stock <= 0) {
        const error = new Error(
            "Product is out of stock."
        );

        error.statusCode = 400;

        throw error;
    }

    let cart = await findCart({
        cartId,
        userId,
    });

    if (!cart) {
        cart = await Cart.create({
            cartId: userId
                ? null
                : cartId,

            user: userId || null,

            items: [],
        });
    }

    const existingItemIndex =
        cart.items.findIndex(
            (item) =>
                item.product.toString() ===
                productId.toString()
        );

    if (existingItemIndex !== -1) {
        const existingQuantity =
            cart.items[
                existingItemIndex
            ].quantity;

        const newQuantity =
            existingQuantity + quantity;

        if (newQuantity > product.stock) {
            const error = new Error(
                `Only ${product.stock} item(s) available in stock.`
            );

            error.statusCode = 400;

            throw error;
        }

        cart.items[
            existingItemIndex
        ].quantity = newQuantity;
    } else {
        if (quantity > product.stock) {
            const error = new Error(
                `Only ${product.stock} item(s) available in stock.`
            );

            error.statusCode = 400;

            throw error;
        }

        cart.items.push({
            product: product._id,
            quantity,
        });
    }

    await cart.save();

    if (userId) {
        return getUserCart(userId);
    }

    return getCartById(cartId);
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
            });

        return res.status(200).json({
            success: true,
            message:
                "Cart item updated successfully.",
            data: {
                cart,
            },
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
            });

        return res.status(200).json({
            success: true,
            message:
                "Product removed from cart.",
            data: {
                cart,
            },
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
                req.cartId
            );

        return res.status(200).json({
            success: true,
            message:
                "Cart cleared successfully.",
            data: {
                cart,
            },
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
        const cart =
            await mergeGuestCartIntoUserCart({
                cartId: req.cartId,
                userId: req.user._id,
            });

        return res.status(200).json({
            success: true,
            message:
                "Cart merged successfully.",
            data: {
                cart,
            },
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