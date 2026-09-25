const {
    cartCookieName,
    generateCartId,
    getCartCookieOptions,
} = require("../utils/cart");

const ensureCart = (req, res, next) => {
    /*
     * If user is logged in, use user cart.
     */
    if (req.user) {
        req.cartUserId = req.user._id;

        return next();
    }

    /*
     * Otherwise use guest cart.
     */
    let cartId = req.cookies?.[cartCookieName];

    if (!cartId) {
        cartId = generateCartId();

        res.cookie(
            cartCookieName,
            cartId,
            getCartCookieOptions()
        );
    }

    req.cartId = cartId;

    next();
};

module.exports = {
    ensureCart,
};