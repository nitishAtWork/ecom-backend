const reviewService = require(
    "../services/review.service"
);

const {
    deleteReviewImages,
} = require(
    "../utils/reviewImages"
);

/*
 * CREATE REVIEW
 */
const createReview = async (
    req,
    res,
    next
) => {
    /*
     * Multer files:
     *
     * req.files = [
     *   {
     *      filename: "reviews-....jpg"
     *   }
     * ]
     */
    const uploadedImages =
        (req.files || []).map(
            (file) =>
                `/uploads/reviews/${file.filename}`
        );

    try {
        const {
            rating,
            title,
            comment,
        } = req.body;

        const result =
            await reviewService.createReview(
                {
                    userId:
                        req.user._id,

                    productId:
                        req.params.productId,

                    rating,

                    title,

                    comment,

                    images:
                        uploadedImages,
                }
            );

        return res
            .status(201)
            .json({
                success: true,

                message:
                    "Review submitted successfully.",

                data: result,
            });
    } catch (error) {
        /*
         * If DB operation fails,
         * remove uploaded images.
         */
        await deleteReviewImages(
            uploadedImages
        );

        return next(error);
    }
};

/*
 * GET PRODUCT REVIEWS
 */
const getProductReviews = async (
    req,
    res,
    next
) => {
    try {
        const result =
            await reviewService.getProductReviews(
                {
                    productId:
                        req.params.productId,

                    page:
                        req.query.page,

                    limit:
                        req.query.limit,
                }
            );

        return res.json({
            success: true,

            data: result,
        });
    } catch (error) {
        return next(error);
    }
};

/*
 * UPDATE REVIEW
 */
const updateReview = async (
    req,
    res,
    next
) => {
    try {
        const result =
            await reviewService.updateReview(
                {
                    reviewId:
                        req.params.reviewId,

                    userId:
                        req.user._id,

                    rating:
                        req.body.rating,

                    title:
                        req.body.title,

                    comment:
                        req.body.comment,
                }
            );

        return res.json({
            success: true,

            message:
                "Review updated successfully.",

            data: result,
        });
    } catch (error) {
        return next(error);
    }
};

/*
 * DELETE REVIEW
 */
const deleteReview = async (
    req,
    res,
    next
) => {
    try {
        const result =
            await reviewService.deleteReview(
                {
                    reviewId:
                        req.params.reviewId,

                    userId:
                        req.user._id,
                }
            );

        /*
         * Delete review images
         * after DB deletion.
         */
        await deleteReviewImages(
            result.images
        );

        return res.json({
            success: true,

            message:
                "Review deleted successfully.",

            data: {
                ratingSummary:
                    result.ratingSummary,
            },
        });
    } catch (error) {
        return next(error);
    }
};

// GET ALL APPROVED REVIEWS
const getApprovedReviews = async (
    req,
    res,
    next
) => {
    try {
        const reviews = await reviewService.getApprovedReviews();

        return res.json({
            success: true,
            data: reviews,
        });
    } catch (error) {
        return next(error);
    }
};

/*
 * Get logged-in user's reviews.
 */
const getUserReviews = async (
    req,
    res,
    next
) => {
    try {
        const page = Number(
            req.query.page || 1
        );

        const limit = Number(
            req.query.limit || 10
        );

        const result =
            await reviewService.getUserReviews({
                userId: req.user._id,
                page,
                limit,
            });

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getAdminReviewsController = async (
    req,
    res,
    next
) => {
    try {
        const {
            page,
            limit,
            search,
            status,
            rating,
        } = req.query;

        const data =
            await reviewService.getAdminReviews(
                {
                    page,
                    limit,
                    search,
                    status,
                    rating,
                }
            );

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

const getAdminReviewController = async (
    req,
    res,
    next
) => {
    try {
        const review =
            await reviewService.getAdminReviewById(
                req.params.id
            );

        return res.status(200).json({
            success: true,
            data: {
                review,
            },
        });
    } catch (error) {
        next(error);
    }
};

const updateAdminReviewStatusController =
    async (req, res, next) => {
        try {
            const review =
                await reviewService.updateReviewStatus(
                    req.params.id,
                    req.body.status
                );

            return res.status(200).json({
                success: true,
                message:
                    "Review status updated successfully.",
                data: {
                    review,
                },
            });
        } catch (error) {
            next(error);
        }
    };

const deleteAdminReviewController =
    async (req, res, next) => {
        try {
            await reviewService.deleteAdminReview(
                req.params.id
            );

            return res.status(200).json({
                success: true,
                message:
                    "Review deleted successfully.",
            });
        } catch (error) {
            next(error);
        }
    };

module.exports = {
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
};