const { z } = require("zod");

const objectIdSchema = z
    .string()
    .regex(
        /^[a-f\d]{24}$/i,
        "Invalid product ID."
    );

const slugSchema = z
    .string()
    .trim()
    .toLowerCase()
    .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Invalid product slug."
    );

const specificationSchema = z.strictObject({
    key: z
        .string()
        .trim()
        .min(1)
        .max(100),

    value: z
        .string()
        .trim()
        .min(1)
        .max(500),
});

const booleanFromFormData = z.preprocess(
    (value) => {
        if (value === "true") return true;
        if (value === "false") return false;

        return value;
    },
    z.boolean()
);


/*
|--------------------------------------------------------------------------
| File fields
|--------------------------------------------------------------------------
|
| These fields are handled by multer.
|
| We only allow their presence in req.body
| because the actual uploaded files are available
| through req.files.
|
*/

const fileField = z
    .any()
    .optional();


/*
|--------------------------------------------------------------------------
| Create Product
|--------------------------------------------------------------------------
*/

const createProductSchema = z.strictObject({
    body: z.strictObject({

        name: z
            .string()
            .trim()
            .min(
                2,
                "Product name must be at least 2 characters."
            )
            .max(200),

        description: z
            .string()
            .trim()
            .max(10000)
            .optional()
            .default(""),

        shortDescription: z
            .string()
            .trim()
            .max(500)
            .optional()
            .default(""),

        price: z.coerce
            .number()
            .nonnegative(
                "Price cannot be negative."
            ),

        compareAtPrice: z.preprocess(
            (value) => {
                if (
                    value === "" ||
                    value === undefined
                ) {
                    return null;
                }

                return value;
            },
            z.coerce
                .number()
                .nonnegative()
                .nullable()
        ),

        stock: z.coerce
            .number()
            .int()
            .nonnegative(
                "Stock cannot be negative."
            )
            .default(0),

        sku: z
            .string()
            .trim()
            .toUpperCase()
            .min(1)
            .max(100),

        brand: z.preprocess(
            (value) =>
                value === ""
                    ? null
                    : value,
            z
                .string()
                .trim()
                .max(100)
                .nullable()
                .optional()
        ),

        isFeatured:
            booleanFromFormData
                .optional()
                .default(false),

        isActive:
            booleanFromFormData
                .optional()
                .default(true),

        /*
         * File fields
         */
        img: fileField,

        images: fileField,
    }),

    params: z.strictObject({}),

    query: z.strictObject({}),
});


/*
|--------------------------------------------------------------------------
| Update Product
|--------------------------------------------------------------------------
*/

const existingImagesSchema = z.preprocess(
    (value) => {
        if (value === undefined) {
            return undefined;
        }

        /*
         * Frontend can send JSON:
         *
         * ["image1.jpg", "image2.jpg"]
         *
         * or a single value.
         */
        if (typeof value === "string") {
            try {
                const parsed = JSON.parse(value);

                if (Array.isArray(parsed)) {
                    return parsed;
                }
            } catch {
                /*
                 * If it is not JSON, treat it as
                 * a single image path.
                 */
                return [value];
            }
        }

        if (Array.isArray(value)) {
            return value;
        }

        return value;
    },
    z
        .array(
            z.string().trim().min(1)
        )
        .optional()
);

const imagePathsSchema = z.preprocess(
    (value) => {
        if (value === undefined) {
            return undefined;
        }

        if (typeof value === "string") {
            try {
                const parsed = JSON.parse(value);

                if (Array.isArray(parsed)) {
                    return parsed;
                }
            } catch {
                return [value];
            }
        }

        return value;
    },
    z
        .array(
            z.string().trim().min(1)
        )
        .optional()
);

const updateProductSchema = z.strictObject({
    body: z
        .strictObject({
            name: z
                .string()
                .trim()
                .min(
                    2,
                    "Product name must be at least 2 characters."
                )
                .max(200)
                .optional(),

            description: z
                .string()
                .trim()
                .max(10000)
                .optional(),

            shortDescription: z
                .string()
                .trim()
                .max(500)
                .optional(),

            price: z.coerce
                .number()
                .nonnegative(
                    "Price cannot be negative."
                )
                .optional(),

            compareAtPrice: z.preprocess(
                (value) => {
                    if (
                        value === "" ||
                        value === undefined
                    ) {
                        return null;
                    }

                    return value;
                },
                z.coerce
                    .number()
                    .nonnegative()
                    .nullable()
            ).optional(),

            stock: z.coerce
                .number()
                .int()
                .nonnegative(
                    "Stock cannot be negative."
                )
                .optional(),

            sku: z
                .string()
                .trim()
                .toUpperCase()
                .min(1)
                .max(100)
                .optional(),

            brand: z.preprocess(
                (value) =>
                    value === ""
                        ? null
                        : value,
                z
                    .string()
                    .trim()
                    .max(100)
                    .nullable()
            ).optional(),

            isFeatured:
                booleanFromFormData
                    .optional(),

            isActive:
                booleanFromFormData
                    .optional(),

            /*
             * Existing additional images that
             * should remain.
             */
            existingImages:
                existingImagesSchema,

            /*
         * Existing additional images
         * that should be removed.
         */
            removeImages:
                imagePathsSchema,
        }),

    params: z.strictObject({
        id: objectIdSchema,
    }),

    query: z.strictObject({}),
});


/*
|--------------------------------------------------------------------------
| Get Product By Slug
|--------------------------------------------------------------------------
*/

const getProductBySlugSchema =
    z.strictObject({
        body: z.strictObject({}),

        params: z.strictObject({
            slug: slugSchema,
        }),

        query: z.strictObject({}),
    });


/*
|--------------------------------------------------------------------------
| Delete Product
|--------------------------------------------------------------------------
*/

const deleteProductSchema =
    z.strictObject({
        body: z.strictObject({}),

        params: z.strictObject({
            id: objectIdSchema,
        }),

        query: z.strictObject({}),
    });


/*
|--------------------------------------------------------------------------
| List Products
|--------------------------------------------------------------------------
*/

const listProductsSchema =
    z.strictObject({
        body: z.strictObject({}),

        params: z.strictObject({}),

        query: z.strictObject({

            page: z.coerce
                .number()
                .int()
                .min(1)
                .default(1),

            limit: z.coerce
                .number()
                .int()
                .min(1)
                .max(100)
                .default(20),

            search: z
                .string()
                .trim()
                .max(200)
                .optional(),

            sort: z
                .enum([
                    "newest",
                    "oldest",
                    "price_asc",
                    "price_desc",
                    "name_asc",
                    "name_desc",
                ])
                .default("newest"),

            featured: z
                .enum([
                    "true",
                    "false",
                ])
                .optional(),

            minPrice: z.coerce
                .number()
                .nonnegative()
                .optional(),

            maxPrice: z.coerce
                .number()
                .nonnegative()
                .optional(),
        }),
    });


module.exports = {
    createProductSchema,
    updateProductSchema,
    getProductBySlugSchema,
    deleteProductSchema,
    listProductsSchema,
};