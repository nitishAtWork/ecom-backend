const express = require("express");

const {
    getDashboardController,
} = require("../controllers/dashboard.controller");

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
    dashboardSchema,
} = require("../utils/dashboard.validation");

const router = express.Router();

router.get(
    "/",
    authenticate,
    authorize("ADMIN", "SUPERADMIN"),
    validate(dashboardSchema),
    getDashboardController
);

module.exports = router;