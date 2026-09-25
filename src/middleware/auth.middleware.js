const {
    verifyAccessToken,
} = require("../utils/token");

const User = require("../models/User");

const authenticate = async (
    req,
    res,
    next
) => {

    try {

        const authHeader =
            req.headers.authorization;


        /*
         * Expected:
         *
         * Authorization:
         * Bearer <token>
         */
        if (
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ) {

            return res.status(401).json({
                success: false,
                message:
                    "Authentication required.",
            });
        }


        const token =
            authHeader.split(" ")[1];


        /*
         * Verify JWT
         */
        const decoded =
            verifyAccessToken(token);


        /*
         * Find current user
         *
         * This means if an admin is disabled
         * after receiving a token, the API can
         * still reject the user.
         */
        const user =
            await User.findById(
                decoded.userId
            );


        if (!user || user.deletedAt) {
            return res.status(401).json({
                success: false,
                message: "User account is no longer available.",
            });
        }

        if (!user.isActive) {

            return res.status(403).json({
                success: false,
                message:
                    "Your account has been disabled.",
            });
        }


        /*
         * Attach user to request
         */
        req.user = user;


        next();

    } catch (error) {

        return res.status(401).json({
            success: false,
            message:
                "Invalid or expired access token.",
        });

    }
};

const optionalAuthenticate = async (
    req,
    res,
    next
) => {
    try {
        const authHeader =
            req.headers.authorization;

        if (
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ) {
            return next();
        }

        const token =
            authHeader.split(" ")[1];

        if (!token) {
            return next();
        }

        const decoded =
            verifyAccessToken(token);

        const user =
            await User.findById(
                decoded.userId
            );

        if (
            !user ||
            user.deletedAt ||
            !user.isActive
        ) {
            return next();
        }

        req.user = user;

        next();
    } catch (error) {
        /*
         * For optional authentication, an invalid
         * access token should simply mean:
         *
         * "Treat this as a guest."
         *
         * It should not block public cart access.
         */
        next();
    }
};

module.exports = {
    authenticate,
    optionalAuthenticate,
};