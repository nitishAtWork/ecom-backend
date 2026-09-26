const express = require("express");

const {
    createWebsiteInfo,
    updateWebsiteInfo,
    getWebsiteInfo,
} = require("../controllers/website.controller.js");

const {
    createUpload,
} = require("../config/multer");

const websiteUpload =
    createUpload("website");

const router = express.Router();

router.get("/", getWebsiteInfo);

router.post(
    "/",
    websiteUpload.fields([
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
    websiteUpload.fields([
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