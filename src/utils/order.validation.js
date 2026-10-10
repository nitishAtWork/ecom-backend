const { z } = require("zod");

const objectIdSchema = z
    .string()
    .regex(
        /^[0-9a-fA-F]{24}$/,
        "Invalid MongoDB ObjectId."
    );

const addressSchema = z.strictObject({
    name: z
        .string()
        .trim()
        .min(2)
        .max(100),

    phone: z
        .string()
        .trim()
        .min(7)
        .max(20),

    addressLine1: z
        .string()
        .trim()
        .min(3)
        .max(200),

    addressLine2: z
        .string()
        .trim()
        .max(200)
        .optional()
        .default(""),

    city: z
        .string()
        .trim()
        .min(2)
        .max(100),

    state: z
        .string()
        .trim()
        .min(2)
        .max(100),

    postalCode: z
        .string()
        .trim()
        .min(3)
        .max(20),

    country: z
        .string()
        .trim()
        .min(2)
        .max(100)
        .default("India"),
});

const createOrderSchema = z.strictObject({
    body: z.strictObject({
        shippingAddress: addressSchema,

        paymentMethod: z.enum([
            "COD",
            "ONLINE",
        ]),
    }),

    params: z.strictObject({}),

    query: z.strictObject({}),
});

const listOrdersSchema = z.strictObject({
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
            .default(10),

        status: z
            .enum([
                "PENDING",
                "CONFIRMED",
                "PROCESSING",
                "SHIPPED",
                "DELIVERED",
                "CANCELLED",
            ])
            .optional(),
    }),
});

const orderIdSchema = z.strictObject({
    body: z.strictObject({}).default({}),

    params: z.strictObject({
        id: z
            .string()
            .regex(
                /^[0-9a-fA-F]{24}$/,
                "Invalid order ID."
            ),
    }),

    query: z.strictObject({}).default({}),
});

const cancelOrderSchema =
    orderIdSchema;

const updateOrderStatusSchema =
    z.strictObject({
        body: z.strictObject({
            status: z.enum([
                "PENDING",
                "CONFIRMED",
                "PROCESSING",
                "SHIPPED",
                "DELIVERED",
                "CANCELLED",
            ]),
        }),

        params: z.strictObject({
            id: z
                .string()
                .regex(
                    /^[0-9a-fA-F]{24}$/,
                    "Invalid order ID."
                ),
        }),

        query: z.strictObject({}),
    });

module.exports = {
    createOrderSchema,
    listOrdersSchema,
    orderIdSchema,
    cancelOrderSchema,
    updateOrderStatusSchema,
};