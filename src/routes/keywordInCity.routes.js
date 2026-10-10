const express = require("express");

const {
    updateKeywordInCity,
    getKeywordInCity,
    keywordInCityFrontend,
} = require("../controllers/keywordInCity.controller");

const {
    authenticate,
} = require("../middleware/auth.middleware");

const {
    authorize,
} = require("../middleware/role.middleware");

const router = express.Router();


/* =========================================================
   ADMIN
========================================================= */

// Get the single content record
router.get(
    "/",
    authenticate,
    authorize("ADMIN", "SUPERADMIN"),
    getKeywordInCity
);


// Update the single content record
router.patch(
    "/",
    authenticate,
    authorize("ADMIN", "SUPERADMIN"),
    updateKeywordInCity
);


/* =========================================================
   FRONTEND
========================================================= */

router.get(
    "/frontend/:locationSlug/:productSlug",
    keywordInCityFrontend
);


module.exports = router;