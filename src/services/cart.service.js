const Cart = require("../models/Cart");
const Product = require("../models/Product");

const getCartById = async (cartId) => {
    return Cart.findOne({
        cartId,
    }).populate({
        path: "items.product",
        select:
            "name slug img price compareAtPrice stock sku brand isActive",
    });
};

const createGuestCart = async (cartId) => {
    return Cart.create({
        cartId,
        user: null,
        items: [],
    });
};

const getOrCreateGuestCart = async (cartId) => {
    let cart = await getCartById(cartId);

    if (!cart) {
        cart = await createGuestCart(cartId);

        cart = await getCartById(cartId);
    }

    return cart;
};

/*
 * Add product to cart
 */
const addToCart = async ({
    cartId,
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

    let cart = await Cart.findOne({
        cartId,
    });

    if (!cart) {
        cart = await Cart.create({
            cartId,
            user: null,
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
            cart.items[existingItemIndex].quantity;

        const newQuantity =
            existingQuantity + quantity;

        if (newQuantity > product.stock) {
            const error = new Error(
                `Only ${product.stock} item(s) available in stock.`
            );

            error.statusCode = 400;

            throw error;
        }

        cart.items[existingItemIndex].quantity =
            newQuantity;
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

    return getCartWithTotals({
        cartId,
        userId,
    });

    // return getCartById(cartId);
};

/*
 * Update a cart item's quantity
 */
const updateCartItem = async ({
    cartId,
    productId,
    quantity,
}) => {
    const product = await Product.findOne({
        _id: productId,
        isActive: true,
    }).lean();

    if (!product) {
        const error = new Error(
            "Product is no longer available."
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

    if (quantity > product.stock) {
        const error = new Error(
            `Only ${product.stock} item(s) available in stock.`
        );

        error.statusCode = 400;

        throw error;
    }

    const cart = await Cart.findOne({
        cartId,
    });

    if (!cart) {
        const error = new Error(
            "Cart not found."
        );

        error.statusCode = 404;

        throw error;
    }

    const item = cart.items.find(
        (item) =>
            item.product.toString() ===
            productId.toString()
    );

    if (!item) {
        const error = new Error(
            "Product is not in the cart."
        );

        error.statusCode = 404;

        throw error;
    }

    item.quantity = quantity;

    await cart.save();

    return getCartWithTotals({
        cartId,
        userId,
    });

    // return getCartById(cartId);
};

/*
 * Remove one product from cart
 */
const removeFromCart = async ({
    cartId,
    productId,
}) => {
    const cart = await Cart.findOne({
        cartId,
    });

    if (!cart) {
        return null;
    }

    cart.items = cart.items.filter(
        (item) =>
            item.product.toString() !==
            productId.toString()
    );

    await cart.save();

    return getCartById(cartId);
};

/*
 * Clear entire cart
 */
const clearCart = async (cartId) => {
    const cart = await Cart.findOne({
        cartId,
    });

    if (!cart) {
        return null;
    }

    cart.items = [];

    await cart.save();

    return getCartById(cartId);
};

const mergeGuestCartIntoUserCart = async ({
    cartId,
    userId,
}) => {
    /*
     * Find guest cart.
     */
    const guestCart = await Cart.findOne({
        cartId,
        user: null,
    });

    /*
     * Nothing to merge.
     */
    if (!guestCart || guestCart.items.length === 0) {
        return getUserCart(userId);
    }

    /*
     * Find user's existing cart.
     */
    let userCart = await Cart.findOne({
        user: userId,
    });

    /*
     * Create user cart if it doesn't exist.
     */
    if (!userCart) {
        userCart = await Cart.create({
            user: userId,
            cartId: null,
            items: [],
        });
    }

    /*
     * Process every guest cart item.
     */
    for (const guestItem of guestCart.items) {
        const product = await Product.findOne({
            _id: guestItem.product,
            isActive: true,
        }).lean();

        /*
         * Product may have been deleted/deactivated
         * while the guest had it in the cart.
         */
        if (!product || product.stock <= 0) {
            continue;
        }

        const existingItemIndex =
            userCart.items.findIndex(
                (item) =>
                    item.product.toString() ===
                    guestItem.product.toString()
            );

        if (existingItemIndex !== -1) {
            /*
             * Product already exists in user's cart.
             *
             * Combine quantities.
             */
            const existingQuantity =
                userCart.items[
                    existingItemIndex
                ].quantity;

            const combinedQuantity =
                existingQuantity +
                guestItem.quantity;

            /*
             * Never exceed current stock.
             */
            userCart.items[
                existingItemIndex
            ].quantity = Math.min(
                combinedQuantity,
                product.stock
            );
        } else {
            /*
             * Add guest product to user cart.
             *
             * Also make sure quantity doesn't
             * exceed current stock.
             */
            userCart.items.push({
                product: product._id,
                quantity: Math.min(
                    guestItem.quantity,
                    product.stock
                ),
            });
        }
    }

    await userCart.save();

    /*
     * Guest cart has now been merged.
     *
     * Remove it so the same products aren't
     * merged again.
     */
    await Cart.deleteOne({
        _id: guestCart._id,
    });

    return getCartWithTotals({
        userId,
    });

    // return getUserCart(userId);
};

const getUserCart = async (userId) => {
    let cart = await Cart.findOne({
        user: userId,
    });

    if (!cart) {
        cart = await Cart.create({
            user: userId,
            cartId: null,
            items: [],
        });
    }

    return Cart.findById(cart._id).populate({
        path: "items.product",
        select:
            "name slug img price compareAtPrice stock sku brand isActive",
    });
};

/*
 * Populate cart with current product data.
 */
const populateCart = async (cart) => {
    if (!cart) {
        return null;
    }

    return Cart.findById(cart._id)
        .populate({
            path: "items.product",
            select:
                "name slug img price compareAtPrice stock sku brand isActive",
        })
        .lean();
};

/*
 * Get cart for guest/user.
 */
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
 * Calculate cart totals using CURRENT
 * product prices from MongoDB.
 */
const calculateCartTotals = (cart) => {
    let subtotal = 0;
    let itemCount = 0;

    const items = cart?.items || [];

    for (const item of items) {
        if (!item.product) {
            continue;
        }

        const price = Number(item.product.price) || 0;
        const quantity = Number(item.quantity) || 0;

        subtotal += price * quantity;
        itemCount += quantity;
    }

    return {
        subtotal: Number(subtotal.toFixed(2)),
        itemCount,
        total: Number(subtotal.toFixed(2)),
    };
};

/*
 * Validate current cart against products.
 *
 * Removes:
 * - deleted products
 * - inactive products
 * - products with zero stock
 *
 * Adjusts quantity when current quantity
 * exceeds current stock.
 */
const validateCartStock = async (cart) => {
    if (!cart || !cart.items.length) {
        return false;
    }

    let changed = false;
    const validItems = [];

    for (const item of cart.items) {
        const product = await Product.findOne({
            _id: item.product,
            isActive: true,
        }).lean();

        /*
         * Product no longer exists or inactive.
         */
        if (!product) {
            changed = true;
            continue;
        }

        /*
         * Product is out of stock.
         */
        if (product.stock <= 0) {
            changed = true;
            continue;
        }

        /*
         * Quantity exceeds current stock.
         */
        if (item.quantity > product.stock) {
            item.quantity = product.stock;
            changed = true;
        }

        validItems.push(item);
    }

    if (changed) {
        cart.items = validItems;
        await cart.save();
    }

    return changed;
};

/*
 * Get complete cart with:
 *
 * - current product information
 * - current prices
 * - stock validation
 * - subtotal
 * - item count
 */
const getCartWithTotals = async ({
    cartId,
    userId,
}) => {
    let cart = await findCart({
        cartId,
        userId,
    });

    /*
     * Create cart when it doesn't exist.
     */
    if (!cart) {
        cart = await Cart.create({
            cartId: userId ? null : cartId,
            user: userId || null,
            items: [],
        });
    }

    /*
     * Validate stock before returning.
     */
    await validateCartStock(cart);

    /*
     * Reload with current product information.
     */
    const populatedCart =
        await populateCart(cart);

    const totals =
        calculateCartTotals(populatedCart);

    return {
        cart: populatedCart,
        totals,
    };
};


module.exports = {
    getCartById,
    getOrCreateGuestCart,
    getUserCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    mergeGuestCartIntoUserCart,
    findCart,
    calculateCartTotals,
    validateCartStock,
    getCartWithTotals,
};