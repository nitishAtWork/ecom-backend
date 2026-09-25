const { z } = require("zod");

const emailSchema = z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address.");

const passwordSchema = z
    .string()
    .min(
        8,
        "Password must be at least 8 characters long."
    )
    .regex(
        /[A-Z]/,
        "Password must contain at least one uppercase letter."
    )
    .regex(
        /[a-z]/,
        "Password must contain at least one lowercase letter."
    )
    .regex(
        /[0-9]/,
        "Password must contain at least one number."
    );

const otpSchema = z
    .string()
    .trim()
    .regex(
        /^\d{6}$/,
        "OTP must be a 6-digit number."
    );

const registerSchema = z.strictObject({
    body: z.strictObject({
        name: z
            .string()
            .trim()
            .min(2)
            .max(100),

        email: emailSchema,

        password: passwordSchema,
    }),

    params: z.strictObject({}),
    query: z.strictObject({}),
});

const verifyEmailSchema = z.object({
    body: z.object({
        email: emailSchema,
        otp: otpSchema,
    }),
    params: z.object({}),
    query: z.object({}),
});

const resendEmailOTPSchema = z.object({
    body: z.object({
        email: emailSchema,
    }),
    params: z.object({}),
    query: z.object({}),
});

const loginSchema = z.object({
    body: z.object({
        email: emailSchema,
        password: z.string().min(
            1,
            "Password is required."
        ),
    }),
    params: z.object({}),
    query: z.object({}),
});

const loginOTPSendSchema = z.object({
    body: z.object({
        email: emailSchema,
    }),
    params: z.object({}),
    query: z.object({}),
});

const loginOTPVerifySchema = z.object({
    body: z.object({
        email: emailSchema,
        otp: otpSchema,
    }),
    params: z.object({}),
    query: z.object({}),
});

const forgotPasswordSchema = z.object({
    body: z.object({
        email: emailSchema,
    }),
    params: z.object({}),
    query: z.object({}),
});

const verifyResetOTPSchema = z.object({
    body: z.object({
        email: emailSchema,
        otp: otpSchema,
    }),
    params: z.object({}),
    query: z.object({}),
});

const resetPasswordSchema = z.object({
    body: z.object({
        resetToken: z
            .string()
            .min(
                1,
                "Reset token is required."
            ),

        newPassword: passwordSchema,
    }),
    params: z.object({}),
    query: z.object({}),
});

const changePasswordSchema = z.object({
    body: z.object({
        currentPassword: z.string().min(
            1,
            "Current password is required."
        ),
        newPassword: passwordSchema,
    }),
    params: z.object({}),
    query: z.object({}),
});

module.exports = {
    registerSchema,
    verifyEmailSchema,
    resendEmailOTPSchema,
    loginSchema,
    loginOTPSendSchema,
    loginOTPVerifySchema,
    forgotPasswordSchema,
    verifyResetOTPSchema,
    resetPasswordSchema,
    changePasswordSchema,
};