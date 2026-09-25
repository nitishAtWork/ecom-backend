const errorMiddleware = (
    err,
    req,
    res,
    next
) => {
    console.error(
        err.stack || err.message
    );

    let statusCode =
        err.statusCode || 500;

    /*
     * CORS errors
     */
    if (
        err.message ===
        "CORS origin not allowed."
    ) {
        statusCode = 403;
    }

    /*
     * Mongoose validation errors
     */
    if (
        err.name ===
        "ValidationError"
    ) {
        statusCode = 400;
    }

    /*
     * Duplicate MongoDB key
     */
    if (err.code === 11000) {
        statusCode = 409;
    }

    return res.status(statusCode).json({
        success: false,
        message:
            statusCode === 500
                ? "Internal server error."
                : err.message,
    });
};

module.exports = errorMiddleware;