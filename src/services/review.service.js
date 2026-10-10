const mongoose = require("mongoose");

const Review = require("../models/Review");
const Product = require("../models/Product");
const Order = require("../models/Order");
const AppError = require("../utils/AppError");

/*
 * Recalculate product rating.
 */
const refreshProductRating = async (
    productId
) => {
    const result =
        await Review.aggregate([
            {
                $match: {
                    product:
                        new mongoose.Types.ObjectId(
                            productId
                        ),

                    isApproved: true,
                },
            },

            {
                $group: {
                    _id: null,

                    average: {
                        $avg: "$rating",
                    },

                    count: {
                        $sum: 1,
                    },
                },
            },
        ]);

    const average =
        result[0]?.average || 0;

    const count =
        result[0]?.count || 0;

    const ratingAverage =
        Number(
            average.toFixed(1)
        );

    await Product.findByIdAndUpdate(
        productId,
        {
            $set: {
                ratingAverage,
                reviewCount: count,
            },
        }
    );

    return {
        ratingAverage,
        reviewCount: count,
    };
};

/*
 * Find an eligible delivered order
 * containing this product.
 */
const findEligibleOrder = async ({
    userId,
    productId,
}) => {
    return Order.findOne({
        user: userId,

        orderStatus: "DELIVERED",

        "items.product": productId,
    })
        .sort({
            createdAt: -1,
        })
        .select(
            "_id orderNumber"
        )
        .lean();
};

/*
 * Create review.
 */
/*
 * Create review.
 */
const createReview = async ({
    userId,
    productId,
    rating,
    title,
    comment,
    images = [],
}) => {
    /*
     * Check product.
     */
    const product =
        await Product.findById(
            productId
        ).select("_id name");

    if (!product) {
        throw new Error(
            "Product not found."
        );
    }

    /*
     * Prevent duplicate review.
     */
    const existingReview =
        await Review.findOne({
            user: userId,
            product: productId,
        });

    if (existingReview) {
        throw new AppError(
            "You have already reviewed this product.",
            409
        );
    }

    /*
     * Check whether the user has
     * purchased and received the product.
     */
    const order =
        await findEligibleOrder({
            userId,
            productId,
        });

    /*
     * Automatically approve reviews
     * with rating >= 4.
     */
    const shouldApprove =
        Number(rating) >= 4;

    /*
     * Create review.
     */
    const review =
        await Review.create({
            product: productId,

            user: userId,

            order: order?._id || null,

            rating,

            title: title || "",

            comment,

            images,

            /*
             * Only users who purchased and
             * received the product are verified.
             */
            isVerifiedPurchase: Boolean(order),

            /*
             * Rating >= 4 = automatically approved.
             */
            isApproved: shouldApprove,

            moderationStatus: shouldApprove
                ? "APPROVED"
                : "PENDING",
        });

    /*
     * Update product rating.
     */
    const ratingSummary =
        await refreshProductRating(
            productId
        );

    return {
        review,
        ratingSummary,
    };
};

/*
 * Get product reviews.
 */
const getProductReviews = async ({
    productId,
    page = 1,
    limit = 10,
}) => {
    const skip =
        (page - 1) * limit;

    const [
        reviews,
        total,
        summary,
    ] = await Promise.all([
        Review.find({
            product: productId,

            isApproved: true,
        })
            .populate(
                "user",
                "name avatar"
            )
            .sort({
                createdAt: -1,
            })
            .skip(skip)
            .limit(limit)
            .lean(),

        Review.countDocuments({
            product: productId,

            isApproved: true,
        }),

        Review.aggregate([
            {
                $match: {
                    product:
                        new mongoose.Types.ObjectId(
                            productId
                        ),

                    isApproved: true,
                },
            },

            {
                $group: {
                    _id: null,

                    average: {
                        $avg: "$rating",
                    },

                    count: {
                        $sum: 1,
                    },

                    fiveStar: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$rating",
                                        5,
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },

                    fourStar: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$rating",
                                        4,
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },

                    threeStar: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$rating",
                                        3,
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },

                    twoStar: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$rating",
                                        2,
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },

                    oneStar: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$rating",
                                        1,
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },
                },
            },
        ]),
    ]);

    const stats =
        summary[0] || {
            average: 0,
            count: 0,
            fiveStar: 0,
            fourStar: 0,
            threeStar: 0,
            twoStar: 0,
            oneStar: 0,
        };

    return {
        reviews,

        pagination: {
            page,
            limit,
            total,
            totalPages:
                Math.ceil(
                    total / limit
                ),
        },

        summary: {
            average: Number(
                Number(
                    stats.average || 0
                ).toFixed(1)
            ),

            count:
                stats.count || 0,

            distribution: {
                5:
                    stats.fiveStar ||
                    0,

                4:
                    stats.fourStar ||
                    0,

                3:
                    stats.threeStar ||
                    0,

                2:
                    stats.twoStar ||
                    0,

                1:
                    stats.oneStar ||
                    0,
            },
        },
    };
};

/*
 * Update review.
 *
 * Image update will be handled separately so
 * we don't accidentally delete images here.
 */
const updateReview = async ({
    reviewId,
    userId,
    rating,
    title,
    comment,
}) => {
    const review =
        await Review.findOne({
            _id: reviewId,
            user: userId,
        });

    if (!review) {
        throw new Error(
            "Review not found."
        );
    }

    if (rating !== undefined) {
        review.rating = rating;
    }

    if (title !== undefined) {
        review.title = title;
    }

    if (comment !== undefined) {
        review.comment = comment;
    }

    review.isEdited = true;

    await review.save();

    const ratingSummary =
        await refreshProductRating(
            review.product
        );

    return {
        review,
        ratingSummary,
    };
};

/*
 * Delete review.
 */
const deleteReview = async ({
    reviewId,
    userId,
}) => {
    const review =
        await Review.findOne({
            _id: reviewId,
            user: userId,
        });

    if (!review) {
        throw new Error(
            "Review not found."
        );
    }

    const productId =
        review.product;

    const images =
        review.images || [];

    await Review.deleteOne({
        _id: reviewId,
    });

    const ratingSummary =
        await refreshProductRating(
            productId
        );

    return {
        images,
        ratingSummary,
    };
};

// Get all approved reviews
const getApprovedReviews = async () => {
    const reviews = await Review.find({ isApproved: true })
        .populate("user", "name email")
        .populate("product", "name")
        .sort({ createdAt: -1 });

    return reviews;
};

/*
 * Get reviews created by the logged-in user.
 */
const getUserReviews = async ({
    userId,
    page = 1,
    limit = 10,
}) => {
    const skip = (page - 1) * limit;

    const [
        reviews,
        total,
    ] = await Promise.all([
        Review.find({
            user: userId,
        })
            .populate(
                "product",
                "name slug img price"
            )
            .sort({
                createdAt: -1,
            })
            .skip(skip)
            .limit(limit)
            .lean(),

        Review.countDocuments({
            user: userId,
        }),
    ]);

    return {
        reviews,

        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(
                total / limit
            ),
        },
    };
};

const getAdminReviews = async ({
    page = 1,
    limit = 20,
    search,
    status,
    rating,
}) => {
    const skip =
        (Number(page) - 1) *
        Number(limit);

    const filter = {};

    /*
     * Status
     */
    if (status === "PENDING") {
        filter.moderationStatus = "PENDING";
    }

    if (status === "APPROVED") {
        filter.moderationStatus = "APPROVED";
    }

    if (status === "REJECTED") {
        filter.moderationStatus = "REJECTED";
    }

    /*
     * Rating
     */
    if (rating) {
        filter.rating = Number(rating);
    }

    /*
     * Search
     */
    if (search?.trim()) {
        const regex = new RegExp(
            search.trim(),
            "i"
        );

        const matchingProducts =
            await Product.find({
                name: regex,
            }).select("_id");

        filter.$or = [
            {
                title: regex,
            },
            {
                comment: regex,
            },
            {
                product: {
                    $in: matchingProducts.map(
                        (product) =>
                            product._id
                    ),
                },
            },
        ];
    }

    const [reviews, total] =
        await Promise.all([
            Review.find(filter)
                .populate({
                    path: "user",
                    select:
                        "name email phone",
                })
                .populate({
                    path: "product",
                    select:
                        "name img images slug",
                })
                .populate({
                    path: "order",
                    select:
                        "orderNumber totalAmount",
                })
                .sort({
                    createdAt: -1,
                })
                .skip(skip)
                .limit(Number(limit))
                .lean(),

            Review.countDocuments(filter),
        ]);

    return {
        reviews,

        pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(
                total / Number(limit)
            ),
        },
    };
};

const getAdminReviewById = async (
    reviewId
) => {
    if (
        !mongoose.Types.ObjectId.isValid(
            reviewId
        )
    ) {
        throw new Error(
            "Invalid review ID."
        );
    }

    const review =
        await Review.findById(reviewId)
            .populate({
                path: "user",
                select:
                    "name email phone",
            })
            .populate({
                path: "product",
                select:
                    "name img images slug",
            })
            .populate({
                path: "order",
                select:
                    "orderNumber totalAmount",
            })
            .lean();

    if (!review) {
        throw new Error(
            "Review not found."
        );
    }

    return review;
};

const updateReviewStatus = async (
    reviewId,
    status
) => {
    if (
        !mongoose.Types.ObjectId.isValid(
            reviewId
        )
    ) {
        throw new Error(
            "Invalid review ID."
        );
    }

    const review =
        await Review.findById(reviewId);

    if (!review) {
        throw new Error(
            "Review not found."
        );
    }

    review.moderationStatus = status;

    /*
     * Storefront compatibility.
     *
     * Only APPROVED reviews contribute
     * to product rating/review count.
     */
    review.isApproved =
        status === "APPROVED";

    await review.save();

    await recalculateProductRating(
        review.product
    );

    return Review.findById(reviewId)
        .populate({
            path: "user",
            select:
                "name email phone",
        })
        .populate({
            path: "product",
            select:
                "name img images slug",
        })
        .lean();
};

const deleteAdminReview = async (
    reviewId
) => {
    if (
        !mongoose.Types.ObjectId.isValid(
            reviewId
        )
    ) {
        throw new Error(
            "Invalid review ID."
        );
    }

    const review =
        await Review.findById(reviewId);

    if (!review) {
        throw new Error(
            "Review not found."
        );
    }

    const productId =
        review.product;

    await Review.findByIdAndDelete(
        reviewId
    );

    await recalculateProductRating(
        productId
    );

    return true;
};

const recalculateProductRating = async (
    productId
) => {
    const stats =
        await Review.aggregate([
            {
                $match: {
                    product:
                        new mongoose.Types.ObjectId(
                            productId
                        ),

                    moderationStatus:
                        "APPROVED",
                },
            },

            {
                $group: {
                    _id: null,

                    average: {
                        $avg: "$rating",
                    },

                    count: {
                        $sum: 1,
                    },
                },
            },
        ]);

    const ratingAverage =
        Number(
            stats[0]?.average || 0
        ).toFixed(1);

    const reviewCount =
        stats[0]?.count || 0;

    await Product.findByIdAndUpdate(
        productId,
        {
            ratingAverage:
                Number(ratingAverage),

            reviewCount,
        }
    );
};

module.exports = {
    createReview,
    getProductReviews,
    getUserReviews,
    updateReview,
    deleteReview,
    refreshProductRating,
    getApprovedReviews,
    getAdminReviews,
    getAdminReviewById,
    updateReviewStatus,
    deleteAdminReview,
    recalculateProductRating,
};