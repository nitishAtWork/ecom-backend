const { z } = require("zod");

const objectIdSchema = z
    .string()
    .regex(
        /^[0-9a-fA-F]{24}$/,
        "Invalid MongoDB ObjectId."
    );

const quantitySchema = z.coerce
    .number()
    .int()
    .min(1)
    .max(100);

const addToCartSchema = z.strictObject({
    body: z.strictObject({
        productId: objectIdSchema,
        quantity: quantitySchema,
    }),

    params: z.strictObject({}),

    query: z.strictObject({}),
});

const updateCartItemSchema = z.strictObject({
    body: z.strictObject({
        quantity: quantitySchema,
    }),

    params: z.strictObject({
        productId: objectIdSchema,
    }),

    query: z.strictObject({}),
});

// const removeCartItemSchema = z.strictObject({
//     body: z.strictObject({}),

//     params: z.strictObject({
//         productId: objectIdSchema,
//     }),

//     query: z.strictObject({}),
// });

const removeCartItemSchema = z.strictObject({
    body: z.strictObject({}).optional(),

    params: z.strictObject({
        productId: z.string().regex(
            /^[0-9a-fA-F]{24}$/,
            "Invalid product ID."
        ),
    }),

    query: z.strictObject({}),
});

const emptyCartSchema = z.strictObject({
    body: z.strictObject({}).optional(),

    params: z.strictObject({}),

    query: z.strictObject({}),
});

module.exports = {
    addToCartSchema,
    updateCartItemSchema,
    removeCartItemSchema,
    emptyCartSchema,
};