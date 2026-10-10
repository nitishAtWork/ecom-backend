const express = require("express");

const {
    createOrder,
    getOrders,
    getOrder,
    cancelOrder,
    getAdminOrdersController,
    getAdminOrder,
    updateAdminOrderStatus,
} = require("../controllers/order.controller");

const {
    authenticate,
} = require("../middleware/auth.middleware");

const {
    authorize,
} = require("../middleware/role.middleware");

const {
    validate,
} = require("../middleware/validate.middleware");

const {
    createOrderSchema,
    listOrdersSchema,
    orderIdSchema,
    cancelOrderSchema,
    updateOrderStatusSchema,
} = require("../utils/order.validation");

const router = express.Router();

/*
 * ==========================================
 * CUSTOMER
 * ==========================================
 */

/*
 * POST /api/orders
 *
 * Create order
 */
router.post(
    "/",
    authenticate,
    validate(createOrderSchema),
    createOrder
);

/*
 * GET /api/orders
 *
 * Get logged-in user's orders
 */
router.get(
    "/",
    authenticate,
    validate(listOrdersSchema),
    getOrders
);

/*
 * ==========================================
 * ADMIN
 * ==========================================
 *
 * IMPORTANT:
 * Admin routes MUST come before /:id
 * so "/admin" is not treated as an order ID.
 */

/*
 * GET /api/orders/admin
 *
 * Get all orders for admin
 */
router.get(
    "/admin",
    authenticate,
    authorize(
        "ADMIN",
        "SUPERADMIN"
    ),
    getAdminOrdersController
);

/*
 * GET /api/orders/admin/:id
 *
 * Get single order for admin
 */
router.get(
    "/admin/:id",
    authenticate,
    authorize(
        "ADMIN",
        "SUPERADMIN"
    ),
    validate(orderIdSchema),
    getAdminOrder
);

/*
 * PATCH /api/orders/admin/:id/status
 *
 * Update order status
 */
router.patch(
    "/admin/:id/status",
    authenticate,
    authorize(
        "ADMIN",
        "SUPERADMIN"
    ),
    validate(updateOrderStatusSchema),
    updateAdminOrderStatus
);

/*
 * ==========================================
 * CUSTOMER - SINGLE ORDER
 * ==========================================
 */

/*
 * GET /api/orders/:id
 *
 * Get logged-in user's single order
 *
 * KEEP THIS AFTER /admin ROUTES
 */
router.get(
    "/:id",
    authenticate,
    validate(orderIdSchema),
    getOrder
);

/*
 * PATCH /api/orders/:id/cancel
 *
 * Cancel logged-in user's order
 */
router.patch(
    "/:id/cancel",
    authenticate,
    validate(cancelOrderSchema),
    cancelOrder
);

module.exports = router;