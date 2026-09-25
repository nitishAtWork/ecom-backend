const crypto = require("crypto");

const cartCookieName = "cartId";

const generateCartId = () => {
    return crypto.randomUUID();
};

const getCartCookieOptions = () => ({
    httpOnly: true,

    secure:
        process.env.COOKIE_SECURE === "true",

    sameSite:
        process.env.COOKIE_SAME_SITE || "lax",

    /*
     * Cart cookie should be available to
     * all API routes.
     */
    path: "/",

    /*
     * 30 days
     */
    maxAge: 30 * 24 * 60 * 60 * 1000,
});

module.exports = {
    cartCookieName,
    generateCartId,
    getCartCookieOptions,
};