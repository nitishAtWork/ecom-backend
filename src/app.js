const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");

const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const cartRoutes = require("./routes/cart.routes");
const orderRoutes = require("./routes/order.routes");
const paymentRoutes = require("./routes/payment.routes");
const websiteRoutes = require("./routes/website.routes");
const errorMiddleware = require("./middleware/error.middleware");

const app = express();

/*
 * Trust the reverse proxy in production.
 *
 * This is important when Express is behind
 * Nginx, Apache, cPanel, etc.
 */
app.set("trust proxy", 1);

/*
 * Security headers
 */
app.use(
    helmet({
        crossOriginResourcePolicy: {
            policy: "cross-origin",
        },
    })
);

/*
 * CORS
 */
const allowedOrigins = (
    process.env.CLIENT_URL || ""
)
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            /*
             * Allow requests without an Origin header.
             *
             * Useful for Postman, server-to-server
             * requests and health checks.
             */
            if (!origin) {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(
                new Error("CORS origin not allowed.")
            );
        },

        credentials: true,
    })
);

/*
 * Request body limits
 *
 * Prevent unnecessarily large JSON requests.
 */
app.use(
    express.json({
        limit: "1mb",

        verify: (
            req,
            res,
            buffer
        ) => {
            if (
                req.originalUrl ===
                "/api/payments/uropay/webhook"
            ) {
                req.rawBody = buffer;
            }
        },
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "1mb",
    })
);

/*
 * Cookies
 */
app.use(cookieParser());


const path = require("path");

app.use(
    "/uploads",
    express.static(
        path.join(
            process.cwd(),
            "uploads"
        )
    )
);

/*
 * Health check
 */
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "E-commerce API is running",
    });
});

/*
 * Authentication routes
 */
app.use("/api/auth", authRoutes);


// Product routes
app.use(
    "/api/products",
    productRoutes
);

// Cart routes
app.use("/api/cart", cartRoutes);

// Order routes
app.use(
    "/api/orders",
    orderRoutes
);

// Payment routes
app.use(
    "/api/payments",
    paymentRoutes
);

// Website routes
app.use(
    "/api/website",
    websiteRoutes
);

/*
 * 404 handler
 */
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API route not found.",
    });
});

/*
 * Global error handler
 */
app.use(errorMiddleware);

module.exports = app;