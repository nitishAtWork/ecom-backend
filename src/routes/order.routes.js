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
 */
router.post(
    "/",
    authenticate,
    validate(createOrderSchema),
    createOrder
);

/*
 * GET /api/orders
 */
router.get(
    "/",
    authenticate,
    validate(listOrdersSchema),
    getOrders
);

/*
 * GET /api/orders/:id
 */
router.get(
    "/:id",
    authenticate,
    validate(orderIdSchema),
    getOrder
);

/*
 * PATCH /api/orders/:id/cancel
 */
router.patch(
    "/:id/cancel",
    authenticate,
    validate(cancelOrderSchema),
    cancelOrder
);


/*
 * ==========================================
 * ADMIN
 * ==========================================
 */

/*
 * GET /api/orders/admin
 */
router.get(
    "/admin",
    authenticate,
    authorize(
        "ADMIN",
        "SUPERADMIN"
    ),
    validate(listOrdersSchema),
    getAdminOrdersController
);

/*
 * GET /api/orders/admin/:id
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
 */
router.patch(
    "/admin/:id/status",
    authenticate,
    authorize(
        "ADMIN",
        "SUPERADMIN"
    ),
    validate(
        updateOrderStatusSchema
    ),
    updateAdminOrderStatus
);

module.exports = router;