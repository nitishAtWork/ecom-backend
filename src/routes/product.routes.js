const express = require("express");

const {
    createProduct,
    getProducts,
    getProductBySlug,
    updateProduct,
    deleteProduct,
    getProductById,
    deactivateProductController,
    toggleProductActiveStatus,
} = require("../controllers/product.controller");

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
    createProductSchema,
    updateProductSchema,
    getProductBySlugSchema,
    deleteProductSchema,
    listProductsSchema,
} = require("../utils/product.validation");

const upload = require("../config/multer");

const router = express.Router();

/*
 * Public product listing
 */
router.get(
    "/",
    // validate(listProductsSchema),
    getProducts
);

/*
 * Public product detail
 */
router.get(
    "/:slug",
    // validate(getProductBySlugSchema),
    getProductBySlug
);

/*
 * Public product detail
 */
router.get(
    "/by-id/:id",
    // validate(getProductByIdSchema),
    getProductById
);

/*
 * Admin product creation
 */
router.post(
    "/",
    authenticate,
    authorize(
        "ADMIN",
        "SUPERADMIN"
    ),
    upload.fields([
        {
            name: "img",
            maxCount: 1,
        },
        {
            name: "images",
            maxCount: 10,
        },
    ]),
    validate(createProductSchema),
    createProduct
);

/*
 * Admin product update
 */
router.patch(
    "/:id",
    authenticate,
    authorize(
        "ADMIN",
        "SUPERADMIN"
    ),
    upload.fields([
        {
            name: "img",
            maxCount: 1,
        },
        {
            name: "images",
            maxCount: 10,
        },
    ]),
    validate(updateProductSchema),
    updateProduct
);

/*
 * Admin product deletion
 */
router.delete(
    "/:id",
    authenticate,
    authorize(
        "ADMIN",
        "SUPERADMIN"
    ),
    // validate(deleteProductSchema),
    deleteProduct
);

/*
 * Admin product deactivation
 */
router.patch(
    "/:id/deactivate",
    authenticate,
    authorize(
        "ADMIN",
        "SUPERADMIN"
    ),
    // validate(deleteProductSchema),
    deactivateProductController
);

/*
 * Admin product active status toggle
 */
router.patch(
    "/:id/toggle-status",
    authenticate,
    authorize(
        "ADMIN",
        "SUPERADMIN"
    ),
    // validate(deleteProductSchema),
    toggleProductActiveStatus
);

module.exports = router;