const express = require("express");

const {
    updateOurPresence,
    getOurPresence,
    ourPresenceFrontend,
} = require("../controllers/ourPresence.controller");

const {
    authenticate,
} = require("../middleware/auth.middleware");

const {
    authorize,
} = require("../middleware/role.middleware");

const {
    createUpload,
} = require("../config/multer");

const router = express.Router();

const upload =
    createUpload("ourpresence");

// Admin
router.get(
    "/",
    authenticate,
    authorize("ADMIN", "SUPERADMIN"),
    getOurPresence
);

router.patch(
    "/",
    authenticate,
    authorize("ADMIN", "SUPERADMIN"),
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
    updateOurPresence
);


// Frontend
router.get(
    "/frontend/:slug",
    ourPresenceFrontend
);


module.exports = router;