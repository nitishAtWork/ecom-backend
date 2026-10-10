const express = require("express");

const {
    createPage,
    getAllPages: getPages,
    getAllPagesFront: getPagesFrontend,
    getSinglePageBySlug: getPageBySlug,
    updatePage,
    deletePage,
    getSinglePage: getPageById,
    togglePageStatus: togglePageActiveStatus,
} = require("../controllers/page.controller");

const {
    authenticate,
} = require("../middleware/auth.middleware");

const {
    authorize,
} = require("../middleware/role.middleware");

const {
    createUpload,
} = require("../config/multer");

const pageUpload = createUpload("pages");

const router = express.Router();

/*
 * Admin page listing
 */
router.get(
    "/",
    authenticate,
    authorize("ADMIN", "SUPERADMIN"),
    getPages
);

/*
 * Public frontend page listing
 * Keep before /:slug
 */
router.get(
    "/frontend",
    getPagesFrontend
);

/*
 * Admin page detail by ID
 * Keep before /:slug
 */
router.get(
    "/by-id/:id",
    authenticate,
    authorize("ADMIN", "SUPERADMIN"),
    getPageById
);

/*
 * Public page detail by slug
 */
router.get(
    "/:slug",
    getPageBySlug
);

/*
 * Admin page creation
 */
router.post(
    "/",
    authenticate,
    authorize("ADMIN", "SUPERADMIN"),
    pageUpload.fields([
        {
            name: "img",
            maxCount: 1,
        },
        {
            name: "images",
            maxCount: 10,
        },
    ]),
    createPage
);

/*
 * Admin page update
 */
router.patch(
    "/:id",
    authenticate,
    authorize("ADMIN", "SUPERADMIN"),
    pageUpload.fields([
        {
            name: "img",
            maxCount: 1,
        },
        {
            name: "images",
            maxCount: 10,
        },
    ]),
    updatePage
);

/*
 * Admin page deletion
 */
router.delete(
    "/:id",
    authenticate,
    authorize("ADMIN", "SUPERADMIN"),
    deletePage
);

/*
 * Admin page active status toggle
 */
router.patch(
    "/:id/toggle-status",
    authenticate,
    authorize("ADMIN", "SUPERADMIN"),
    togglePageActiveStatus
);

module.exports = router;
