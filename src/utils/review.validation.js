const { z } = require("zod");

const objectIdSchema = z
    .string()
    .regex(
        /^[0-9a-fA-F]{24}$/,
        "Invalid ID."
    );

/*
 * Create review
 *
 * Multipart/form-data fields:
 *
 * rating
 * title
 * comment
 * images
 */
const createReviewSchema = z.object({
    params: z.object({
        productId: objectIdSchema,
    }),

    body: z.object({
        rating: z.coerce
            .number()
            .int()
            .min(1)
            .max(5),

        title: z
            .string()
            .trim()
            .max(150)
            .optional()
            .default(""),

        comment: z
            .string()
            .trim()
            .min(
                5,
                "Review must contain at least 5 characters."
            )
            .max(3000),
    }),
});

/*
 * Get product reviews
 */
const getProductReviewsSchema = z.object({
    params: z.object({
        productId: objectIdSchema,
    }),

    query: z.object({
        page: z.coerce
            .number()
            .int()
            .min(1)
            .default(1),

        limit: z.coerce
            .number()
            .int()
            .min(1)
            .max(50)
            .default(10),
    }),
});

/*
 * Update review
 */
const updateReviewSchema = z.object({
    params: z.object({
        reviewId: objectIdSchema,
    }),

    body: z.object({
        rating: z.coerce
            .number()
            .int()
            .min(1)
            .max(5)
            .optional(),

        title: z
            .string()
            .trim()
            .max(150)
            .optional(),

        comment: z
            .string()
            .trim()
            .min(5)
            .max(3000)
            .optional(),
    }),
});

/*
 * Review ID
 */
const reviewIdSchema = z.object({
    params: z.object({
        reviewId: objectIdSchema,
    }),
});


const adminListReviewsSchema =
    z.object({
        query: z.object({
            page: z
                .coerce
                .number()
                .int()
                .min(1)
                .optional()
                .default(1),

            limit: z
                .coerce
                .number()
                .int()
                .min(1)
                .max(100)
                .optional()
                .default(20),

            search: z
                .string()
                .optional(),

            status: z
                .enum([
                    "PENDING",
                    "APPROVED",
                    "REJECTED",
                ])
                .optional(),

            rating: z
                .enum([
                    "1",
                    "2",
                    "3",
                    "4",
                    "5",
                ])
                .optional(),
        }),
    });

const adminReviewIdSchema =
    z.object({
        params: z.object({
            id: z
                .string()
                .regex(
                    /^[0-9a-fA-F]{24}$/,
                    "Invalid review ID."
                ),
        }),
    });

const updateReviewStatusSchema =
    z.object({
        params: z.object({
            id: z
                .string()
                .regex(
                    /^[0-9a-fA-F]{24}$/,
                    "Invalid review ID."
                ),
        }),

        body: z.object({
            status: z.enum([
                "PENDING",
                "APPROVED",
                "REJECTED",
            ]),
        }),
    });

module.exports = {
    createReviewSchema,
    getProductReviewsSchema,
    updateReviewSchema,
    reviewIdSchema,
    adminListReviewsSchema,
    adminReviewIdSchema,
    updateReviewStatusSchema,
};