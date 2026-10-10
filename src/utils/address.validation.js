const { z } = require("zod");

const objectIdSchema = z
    .string()
    .regex(
        /^[0-9a-fA-F]{24}$/,
        "Invalid address ID."
    );

const phoneSchema = z
    .string()
    .trim()
    .min(10, "Phone number must be at least 10 characters.")
    .max(20, "Phone number is too long.");

const addressFieldsSchema = z.object({
    label: z
        .enum(["HOME", "WORK", "OTHER"])
        .default("HOME"),

    fullName: z
        .string()
        .trim()
        .min(2, "Full name is required.")
        .max(100, "Full name is too long."),

    phone: phoneSchema,

    addressLine1: z
        .string()
        .trim()
        .min(3, "Address is required.")
        .max(200, "Address is too long."),

    addressLine2: z
        .string()
        .trim()
        .max(200, "Address is too long.")
        .optional()
        .default(""),

    city: z
        .string()
        .trim()
        .min(2, "City is required.")
        .max(100, "City is too long."),

    state: z
        .string()
        .trim()
        .min(2, "State is required.")
        .max(100, "State is too long."),

    postalCode: z
        .string()
        .trim()
        .min(3, "Postal code is required.")
        .max(20, "Postal code is too long."),

    country: z
        .string()
        .trim()
        .min(2, "Country is required.")
        .max(100, "Country is too long.")
        .default("India"),

    isDefault: z
        .boolean()
        .default(false),
});

const createAddressSchema = z.strictObject({
    body: z.strictObject(addressFieldsSchema.shape),

    params: z.strictObject({}),

    query: z.strictObject({}),
});

const updateAddressSchema = z.strictObject({
    body: z
        .strictObject({
            ...addressFieldsSchema.shape,
        })
        .partial(),

    params: z.strictObject({
        addressId: objectIdSchema,
    }),

    query: z.strictObject({}),
});

const addressIdSchema = z.strictObject({
    body: z.strictObject({}).optional(),

    params: z.strictObject({
        addressId: objectIdSchema,
    }),

    query: z.strictObject({}),
});

const setDefaultAddressSchema =
    z.strictObject({
        body: z.strictObject({}).optional(),

        params: z.strictObject({
            addressId: objectIdSchema,
        }),

        query: z.strictObject({}),
    });

module.exports = {
    createAddressSchema,
    updateAddressSchema,
    addressIdSchema,
    setDefaultAddressSchema,
};