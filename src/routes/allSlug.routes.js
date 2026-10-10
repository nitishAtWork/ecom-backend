
const express = require("express");
const router = express.Router();

const {
    getAllSlug,
    getAllSlugSitemap,
} = require("../controllers/allSlug.controller");

// Get all slugs with their types
router.get("/", getAllSlug);

// Get all slugs for sitemap generation
router.get("/sitemap", getAllSlugSitemap);

module.exports = router;
