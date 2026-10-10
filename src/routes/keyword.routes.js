const express = require("express");

const {
    createKeyword,
    getKeywords,
    getKeywordsFrontend,
    getKeywordBySlug,
    updateKeyword,
    deleteKeyword,
    getKeywordById,
    deactivateKeywordController,
    toggleKeywordActiveStatus,
} = require("../controllers/keyword.controller");

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
    createUpload,
} = require("../config/multer");

const keywordUpload =
    createUpload("keywords");

const {
    createKeywordSchema,
    updateKeywordSchema,
    getKeywordBySlugSchema,
    deleteKeywordSchema,
    listKeywordsSchema,
} = require("../utils/keyword.validation");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Admin keyword listing
|--------------------------------------------------------------------------
*/

router.get(
    "/",
    authenticate,
    authorize(
        "ADMIN",
        "SUPERADMIN"
    ),
    validate(listKeywordsSchema),
    getKeywords
);

/*
|--------------------------------------------------------------------------
| Public keyword listing
|--------------------------------------------------------------------------
*/

router.get(
    "/frontend",
    validate(listKeywordsSchema),
    getKeywordsFrontend
);

/*
|--------------------------------------------------------------------------
| Public keyword detail
|--------------------------------------------------------------------------
*/

router.get(
    "/:slug",
    validate(getKeywordBySlugSchema),
    getKeywordBySlug
);

/*
|--------------------------------------------------------------------------
| Admin keyword detail by ID
|--------------------------------------------------------------------------
*/

router.get(
    "/by-id/:id",
    authenticate,
    authorize(
        "ADMIN",
        "SUPERADMIN"
    ),
    getKeywordById
);

/*
|--------------------------------------------------------------------------
| Admin keyword creation
|--------------------------------------------------------------------------
*/

router.post(
    "/",
    authenticate,
    authorize(
        "ADMIN",
        "SUPERADMIN"
    ),

    keywordUpload.fields([
        {
            name: "img",
            maxCount: 1,
        },
        {
            name: "images",
            maxCount: 10,
        },
    ]),

    validate(createKeywordSchema),

    createKeyword
);

/*
|--------------------------------------------------------------------------
| Admin keyword update
|--------------------------------------------------------------------------
*/

router.patch(
    "/:id",
    authenticate,
    authorize(
        "ADMIN",
        "SUPERADMIN"
    ),

    keywordUpload.fields([
        {
            name: "img",
            maxCount: 1,
        },
        {
            name: "images",
            maxCount: 10,
        },
    ]),

    validate(updateKeywordSchema),

    updateKeyword
);

/*
|--------------------------------------------------------------------------
| Admin keyword deletion
|--------------------------------------------------------------------------
*/

router.delete(
    "/:id",
    authenticate,
    authorize(
        "ADMIN",
        "SUPERADMIN"
    ),

    validate(deleteKeywordSchema),

    deleteKeyword
);

/*
|--------------------------------------------------------------------------
| Admin keyword deactivation
|--------------------------------------------------------------------------
*/

router.patch(
    "/:id/deactivate",
    authenticate,
    authorize(
        "ADMIN",
        "SUPERADMIN"
    ),

    deactivateKeywordController
);

/*
|--------------------------------------------------------------------------
| Admin keyword active status toggle
|--------------------------------------------------------------------------
*/

router.patch(
    "/:id/toggle-status",
    authenticate,
    authorize(
        "ADMIN",
        "SUPERADMIN"
    ),

    toggleKeywordActiveStatus
);

module.exports = router;
