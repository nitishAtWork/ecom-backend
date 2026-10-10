const express = require("express");

const {
    createReview,
    getProductReviews,
    getUserReviews,
    updateReview,
    deleteReview,
    getApprovedReviews,
      getAdminReviewsController,
    getAdminReviewController,
    updateAdminReviewStatusController,
    deleteAdminReviewController,
} = require(
    "../controllers/review.controller"
);

const {
    authenticate,
} = require("../middleware/auth.middleware");

const {
    authorize,
} = require("../middleware/role.middleware");

const {
    validate,
} = require(
    "../middleware/validate.middleware"
);

const {
    createUpload,
} = require(
    "../config/multer"
);

const {
    createReviewSchema,
    getProductReviewsSchema,
    updateReviewSchema,
    reviewIdSchema,
        adminListReviewsSchema,
    adminReviewIdSchema,
    updateReviewStatusSchema,
} = require(
    "../utils/review.validation"
);

/*
 * Reuse your existing multer factory.
 */
const reviewUpload =
    createUpload("reviews");

const router = express.Router();


router.get(
    "/reviews/admin",
    authenticate,
    authorize(
        "ADMIN",
        "SUPERADMIN"
    ),
    validate(adminListReviewsSchema),
    getAdminReviewsController
);

router.patch(
    "/reviews/admin/:id/status",
    authenticate,
    authorize(
        "ADMIN",
        "SUPERADMIN"
    ),
    validate(updateReviewStatusSchema),
    updateAdminReviewStatusController
);

router.get(
    "/reviews/admin/:id",
    authenticate,
    authorize(
        "ADMIN",
        "SUPERADMIN"
    ),
    validate(adminReviewIdSchema),
    getAdminReviewController
);

router.delete(
    "/reviews/admin/:id",
    authenticate,
    authorize(
        "ADMIN",
        "SUPERADMIN"
    ),
    validate(adminReviewIdSchema),
    deleteAdminReviewController
);

/*
 * GET REVIEWS
 *
 * Public
 */
router.get(
    "/products/:productId/reviews",
    validate(
        getProductReviewsSchema
    ),
    getProductReviews
);

/*
 * Get my reviews.
 *
 * Login required.
 */
router.get(
    "/reviews/my",
    authenticate,
    getUserReviews
);

// Get all approved reviews
router.get(
    "/reviews/approved",
    getApprovedReviews
);

/*
 * CREATE REVIEW
 *
 * Login required.
 *
 * multipart/form-data
 *
 * rating
 * title
 * comment
 * images[]
 */
router.post(
    "/products/:productId/reviews",

    authenticate,

    reviewUpload.array(
        "images",
        5
    ),

    validate(
        createReviewSchema
    ),

    createReview
);

/*
 * UPDATE REVIEW
 */
router.patch(
    "/reviews/:reviewId",

    authenticate,

    validate(
        updateReviewSchema
    ),

    updateReview
);

/*
 * DELETE REVIEW
 */
router.delete(
    "/reviews/:reviewId",

    authenticate,

    validate(
        reviewIdSchema
    ),

    deleteReview
);

module.exports = router;