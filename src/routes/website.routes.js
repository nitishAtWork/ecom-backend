const express = require("express");

const {
    createWebsiteInfo,
    updateWebsiteInfo,
    getWebsiteInfo,
} = require("../controllers/website.controller.js");

const upload = require("../config/multer.js");

const router = express.Router();

router.get("/", getWebsiteInfo);

router.post(
    "/",
    upload.fields([
        {
            name: "logo",
            maxCount: 1,
        },
        {
            name: "favicon",
            maxCount: 1,
        },
    ]),
    createWebsiteInfo
);

router.put(
    "/",
    upload.fields([
        {
            name: "logo",
            maxCount: 1,
        },
        {
            name: "favicon",
            maxCount: 1,
        },
    ]),
    updateWebsiteInfo
);

module.exports = router;