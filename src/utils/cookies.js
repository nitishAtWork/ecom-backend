const refreshTokenCookieName =
    "refreshToken";


const getRefreshTokenCookieOptions = () => {

    const isProduction =
        process.env.NODE_ENV ===
        "production";


    return {

        httpOnly: true,

        secure:
            process.env.COOKIE_SECURE ===
            "true",

        sameSite:
            isProduction
                ? "none"
                : "lax",

        path: "/api/auth",

        maxAge:
            7 *
            24 *
            60 *
            60 *
            1000,
    };
};


module.exports = {
    refreshTokenCookieName,
    getRefreshTokenCookieOptions,
};


// const getRefreshTokenCookieOptions = () => {
//     return {
//         httpOnly: true,

//         secure:
//             process.env.COOKIE_SECURE === "true",

//         sameSite:
//             process.env.COOKIE_SAME_SITE || "lax",

//         path: "/api/auth",

//         maxAge:
//             7 * 24 * 60 * 60 * 1000,
//     };
// };