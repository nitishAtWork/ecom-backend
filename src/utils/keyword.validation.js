const { z } = require("zod");

/*
|--------------------------------------------------------------------------
| Common Schemas
|--------------------------------------------------------------------------
*/

const objectIdSchema = z
    .string()
    .regex(
        /^[a-f\d]{24}$/i,
        "Invalid keyword ID."
    );

const slugSchema = z
    .string()
    .trim()
    .toLowerCase()
    .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Invalid keyword slug."
    );

/*
|--------------------------------------------------------------------------
| FAQ / Specification Schema
|--------------------------------------------------------------------------
|
| Keyword faqs are FAQ-style:
|
| {
|   question: "...",
|   answer: "..."
| }
|
*/

const faqschema = z.strictObject({
    question: z
        .string()
        .trim()
        .min(1, "Question is required.")
        .max(500, "Question cannot exceed 500 characters."),

    answer: z
        .string()
        .trim()
        .min(1, "Answer is required.")
        .max(5000, "Answer cannot exceed 5000 characters."),
});

/*
|--------------------------------------------------------------------------
| Form Data Boolean
|--------------------------------------------------------------------------
*/

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
| File Fields
|--------------------------------------------------------------------------
|
| These fields are handled by multer.
|
*/

const fileField = z
    .any()
    .optional();

/*
|--------------------------------------------------------------------------
| faqs Parser
|--------------------------------------------------------------------------
|
| Frontend may send faqs as:
|
| JSON string:
| [
|   {
|     "question": "Question?",
|     "answer": "Answer"
|   }
| ]
|
| or directly as an array.
|
*/

const faqsSchema = z.preprocess(
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
                return value;
            }
        }

        return value;
    },
    z
        .array(faqschema)
        .optional()
);

/*
|--------------------------------------------------------------------------
| Existing Images
|--------------------------------------------------------------------------
|
| Used while updating a keyword.
|
*/

const existingImagesSchema = z.preprocess(
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

        if (Array.isArray(value)) {
            return value;
        }

        return value;
    },
    z
        .array(
            z
                .string()
                .trim()
                .min(1)
        )
        .optional()
);

/*
|--------------------------------------------------------------------------
| Image Paths
|--------------------------------------------------------------------------
|
| Used for removeImages.
|
*/

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

        if (Array.isArray(value)) {
            return value;
        }

        return value;
    },
    z
        .array(
            z
                .string()
                .trim()
                .min(1)
        )
        .optional()
);

/*
|--------------------------------------------------------------------------
| Create Keyword
|--------------------------------------------------------------------------
*/

const createKeywordSchema = z.strictObject({
    body: z.strictObject({
        name: z
            .string()
            .trim()
            .min(
                2,
                "Keyword name must be at least 2 characters."
            )
            .max(200),

        description: z
            .string()
            .trim()
            .max(10000)
            .optional()
            .default(""),

        extraDescription: z
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

        icon: z
            .string()
            .trim()
            .max(500)
            .optional()
            .default(""),

        size: z
            .string()
            .trim()
            .max(500)
            .nullable()
            .optional(),

        faqs: faqsSchema,

        metaTitle: z
            .string()
            .trim()
            .max(200)
            .optional()
            .default(""),

        metaDescription: z
            .string()
            .trim()
            .max(500)
            .optional()
            .default(""),

        metaKeywords: z
            .string()
            .trim()
            .max(1000)
            .optional()
            .default(""),

        isActive: booleanFromFormData
            .optional()
            .default(true),

        /*
         * File fields handled by multer.
         */
        img: fileField,

        images: fileField,
    }),

    params: z.strictObject({}),

    query: z.strictObject({}),
});

/*
|--------------------------------------------------------------------------
| Update Keyword
|--------------------------------------------------------------------------
*/

const updateKeywordSchema = z.strictObject({
    body: z.strictObject({
        name: z
            .string()
            .trim()
            .min(
                2,
                "Keyword name must be at least 2 characters."
            )
            .max(200)
            .optional(),

        description: z
            .string()
            .trim()
            .max(10000)
            .optional(),

        extraDescription: z
            .string()
            .trim()
            .max(10000)
            .optional(),

        shortDescription: z
            .string()
            .trim()
            .max(500)
            .optional(),

        icon: z
            .string()
            .trim()
            .max(500)
            .optional(),

        size: z
            .string()
            .trim()
            .max(500)
            .nullable()
            .optional(),

        faqs: faqsSchema,

        metaTitle: z
            .string()
            .trim()
            .max(200)
            .optional(),

        metaDescription: z
            .string()
            .trim()
            .max(500)
            .optional(),

        metaKeywords: z
            .string()
            .trim()
            .max(1000)
            .optional(),

        isActive: booleanFromFormData.optional(),

        /*
         * Existing additional images that should remain.
         */
        existingImages: existingImagesSchema,

        /*
         * Existing additional images that should be removed.
         */
        removeImages: imagePathsSchema,

        /*
         * New uploaded files.
         */
        img: fileField,

        images: fileField,
    }),

    params: z.strictObject({
        id: objectIdSchema,
    }),

    query: z.strictObject({}),
});

/*
|--------------------------------------------------------------------------
| Get Keyword By Slug
|--------------------------------------------------------------------------
*/

const getKeywordBySlugSchema = z.strictObject({
    body: z.strictObject({}),

    params: z.strictObject({
        slug: slugSchema,
    }),

    query: z.strictObject({}),
});

/*
|--------------------------------------------------------------------------
| Delete Keyword
|--------------------------------------------------------------------------
*/

const deleteKeywordSchema = z.strictObject({
    body: z.strictObject({}),

    params: z.strictObject({
        id: objectIdSchema,
    }),

    query: z.strictObject({}),
});

/*
|--------------------------------------------------------------------------
| List Keywords
|--------------------------------------------------------------------------
*/

const listKeywordsSchema = z.strictObject({
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
                "name_asc",
                "name_desc",
            ])
            .default("newest"),

        isActive: z
            .enum([
                "true",
                "false",
            ])
            .optional(),
    }),
});

/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

module.exports = {
    createKeywordSchema,
    updateKeywordSchema,
    getKeywordBySlugSchema,
    deleteKeywordSchema,
    listKeywordsSchema,
};
