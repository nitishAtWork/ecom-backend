const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const addressRoutes = require("./routes/address.routes");
const productRoutes = require("./routes/product.routes");
const keywordRoutes = require("./routes/keyword.routes");
const cartRoutes = require("./routes/cart.routes");
const orderRoutes = require("./routes/order.routes");
const paymentRoutes = require("./routes/payment.routes");
const websiteRoutes = require("./routes/website.routes");
const reviewRoutes = require("./routes/review.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const cityRoutes = require("./routes/city.routes");
const countryRoutes = require("./routes/country.routes");
const stateRoutes = require("./routes/state.routes");
const natureOfBusinessRoutes = require("./routes/natureOfBusiness.routes");
const keywordInCityRoutes = require("./routes/keywordInCity.routes");
const ourPresenceRoutes = require("./routes/ourPresence.routes");
const enquiryRoutes = require("./routes/enquiry.routes");
const slugRoutes = require("./routes/allSlug.routes");
const pageRoutes = require("./routes/page.routes");
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

app.use(
    "/api/addresses",
    addressRoutes
);

app.use(
    "/api/users",
    userRoutes
);

// Product routes
app.use(
    "/api/products",
    productRoutes
);

// keyword routes
app.use(
    "/api/keywords",
    keywordRoutes
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

// review routes
app.use(
    "/api",
    reviewRoutes
);

// Website routes
app.use(
    "/api/website",
    websiteRoutes
);

app.use("/api/dashboard", dashboardRoutes);

// location
app.use("/api/countries", countryRoutes);

app.use("/api/states", stateRoutes);
app.use("/api/cities", cityRoutes);

// nature of business
app.use("/api/nature-of-business", natureOfBusinessRoutes);

// keyword in city
app.use(
    "/api/keyword-in-city",
    keywordInCityRoutes
);
// our presence
app.use(
    "/api/our-presence",
    ourPresenceRoutes
);

app.use("/api/enquiries", enquiryRoutes);

app.use("/api/slugs", slugRoutes);

// pages
app.use("/api/pages", pageRoutes);

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