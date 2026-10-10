const { z } = require("zod");

const objectIdSchema =
    z.string().regex(
        /^[0-9a-fA-F]{24}$/,
        "Invalid user ID."
    );

/*
 * Update own profile.
 *
 * Email and role are intentionally
 * not included here.
 */
const updateMyProfileSchema = z.object({
    body: z.object({
        name: z
            .string()
            .trim()
            .min(2)
            .max(100)
            .optional(),

        phone: z
            .string()
            .trim()
            .max(20)
            .nullable()
            .optional(),
    }),
});

/*
 * Admin updating a user.
 */
const adminUpdateUserSchema = z.object({
    params: z.object({
        userId: objectIdSchema,
    }),

    body: z.object({
        name: z
            .string()
            .trim()
            .min(2)
            .max(100)
            .optional(),

        phone: z
            .string()
            .trim()
            .max(20)
            .nullable()
            .optional(),

        emailVerified: z
            .boolean()
            .optional(),
    }),
});

/*
 * Admin status update.
 */
const updateUserStatusSchema =
    z.object({
        params: z.object({
            userId: objectIdSchema,
        }),

        body: z.object({
            isActive: z.boolean(),
        }),
    });

/*
 * Admin role update.
 */
const updateUserRoleSchema =
    z.object({
        params: z.object({
            userId: objectIdSchema,
        }),

        body: z.object({
            role: z.enum([
                "USER",
                "ADMIN",
                "SUPERADMIN",
            ]),
        }),
    });

/*
 * User ID.
 */
const userIdSchema = z.object({
    params: z.object({
        userId: objectIdSchema,
    }),
});

/*
 * Admin customer list.
 *
 * GET /users/admin?page=1&limit=10&search=john
 */
const adminListCustomersSchema = z.object({
    query: z
        .object({
            page: z.coerce
                .number()
                .int()
                .min(1)
                .optional(),

            limit: z.coerce
                .number()
                .int()
                .min(1)
                .max(100)
                .optional(),

            search: z
                .string()
                .trim()
                .optional(),

            isActive: z
                .enum([
                    "true",
                    "false",
                ])
                .optional(),
        })
        .strict(),

    params: z
        .object({})
        .optional(),

    body: z
        .object({})
        .optional(),
});


/*
 * Customer ID.
 */
const customerIdSchema =
    z.object({
        params: z
            .object({
                id: z
                    .string()
                    .regex(
                        /^[0-9a-fA-F]{24}$/,
                        "Invalid customer ID."
                    ),
            })
            .strict(),
    });

/*
|--------------------------------------------------------------------------
| Update Customer
|--------------------------------------------------------------------------
*/

const updateCustomerSchema = z.object({
    params: z
        .object({
            id: z
                .string()
                .regex(
                    /^[0-9a-fA-F]{24}$/,
                    "Invalid customer ID."
                ),
        })
        .strict(),

    body: z
        .object({
            name: z
                .string()
                .trim()
                .min(
                    2,
                    "Name must be at least 2 characters."
                )
                .max(
                    100,
                    "Name cannot exceed 100 characters."
                ),

            email: z
                .string()
                .trim()
                .email(
                    "Please enter a valid email address."
                )
                .max(
                    150,
                    "Email cannot exceed 150 characters."
                ),

            phone: z
                .string()
                .trim()
                .max(
                    20,
                    "Phone number cannot exceed 20 characters."
                )
                .optional()
                .or(z.literal("")),

            password: z
                .string()
                .min(
                    6,
                    "Password must be at least 6 characters."
                )
                .max(
                    100,
                    "Password cannot exceed 100 characters."
                )
                .optional()
                .or(z.literal("")),

            isActive: z
                .boolean(),
        })
        .strict(),
});



module.exports = {
    updateMyProfileSchema,
    adminUpdateUserSchema,
    updateUserStatusSchema,
    updateUserRoleSchema,
    userIdSchema,
    adminListCustomersSchema,
    customerIdSchema,
    updateCustomerSchema,
};