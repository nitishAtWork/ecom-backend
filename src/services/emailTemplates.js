const verificationOTPTemplate = ({
    name,
    otp,
}) => {
    return {
        subject: "Verify your email",

        text: `
Hello ${name},

Your email verification OTP is:

${otp}

This OTP will expire in 10 minutes.

If you did not create an account, you can safely ignore this email.

Regards,
${process.env.MAIL_FROM_NAME || "My Ecommerce"}
        `.trim(),

        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Verify your email</title>
</head>

<body style="
    margin: 0;
    padding: 0;
    background: #f5f7fa;
    font-family: Arial, sans-serif;
">

    <div style="
        max-width: 600px;
        margin: 40px auto;
        background: #ffffff;
        padding: 40px;
        border-radius: 10px;
    ">

        <h2 style="
            margin-top: 0;
            color: #111827;
        ">
            Verify your email
        </h2>

        <p style="
            color: #4b5563;
            font-size: 15px;
        ">
            Hello ${name},
        </p>

        <p style="
            color: #4b5563;
            font-size: 15px;
        ">
            Use the following OTP to verify your email address:
        </p>

        <div style="
            margin: 30px 0;
            text-align: center;
        ">

            <span style="
                display: inline-block;
                padding: 15px 30px;
                background: #f3f4f6;
                border-radius: 8px;
                font-size: 30px;
                font-weight: bold;
                letter-spacing: 8px;
                color: #111827;
            ">
                ${otp}
            </span>

        </div>

        <p style="
            color: #6b7280;
            font-size: 14px;
        ">
            This OTP will expire in 10 minutes.
        </p>

        <p style="
            color: #6b7280;
            font-size: 14px;
        ">
            If you did not create an account, you can safely
            ignore this email.
        </p>

        <hr style="
            border: 0;
            border-top: 1px solid #e5e7eb;
            margin: 30px 0;
        ">

        <p style="
            color: #9ca3af;
            font-size: 12px;
        ">
            ${process.env.MAIL_FROM_NAME || "My Ecommerce"}
        </p>

    </div>

</body>
</html>
        `.trim(),
    };
};

const loginOTPTemplate = ({
    name,
    otp,
}) => {
    return {
        subject: "Your login OTP",

        text: `
Hello ${name},

Your login OTP is:

${otp}

This OTP will expire in 10 minutes.

If you did not attempt to log in, please ignore this email.

Regards,
${process.env.MAIL_FROM_NAME || "My Ecommerce"}
        `.trim(),

        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Login OTP</title>
</head>

<body style="
    margin: 0;
    padding: 0;
    background: #f5f7fa;
    font-family: Arial, sans-serif;
">

    <div style="
        max-width: 600px;
        margin: 40px auto;
        background: #ffffff;
        padding: 40px;
        border-radius: 10px;
    ">

        <h2 style="
            margin-top: 0;
            color: #111827;
        ">
            Login verification
        </h2>

        <p style="
            color: #4b5563;
            font-size: 15px;
        ">
            Hello ${name},
        </p>

        <p style="
            color: #4b5563;
            font-size: 15px;
        ">
            Use the following OTP to log in to your account:
        </p>

        <div style="
            margin: 30px 0;
            text-align: center;
        ">

            <span style="
                display: inline-block;
                padding: 15px 30px;
                background: #f3f4f6;
                border-radius: 8px;
                font-size: 30px;
                font-weight: bold;
                letter-spacing: 8px;
                color: #111827;
            ">
                ${otp}
            </span>

        </div>

        <p style="
            color: #6b7280;
            font-size: 14px;
        ">
            This OTP will expire in 10 minutes.
        </p>

        <p style="
            color: #6b7280;
            font-size: 14px;
        ">
            If you did not attempt to log in,
            you can safely ignore this email.
        </p>

        <hr style="
            border: 0;
            border-top: 1px solid #e5e7eb;
            margin: 30px 0;
        ">

        <p style="
            color: #9ca3af;
            font-size: 12px;
        ">
            ${process.env.MAIL_FROM_NAME || "My Ecommerce"}
        </p>

    </div>

</body>
</html>
        `.trim(),
    };
};


const passwordResetOTPTemplate = ({
    name,
    otp,
}) => {
    return {
        subject: "Password reset OTP",

        text: `
Hello ${name},

Your password reset OTP is:

${otp}

This OTP will expire in 10 minutes.

If you did not request a password reset, please ignore this email.

Regards,
${process.env.MAIL_FROM_NAME || "My Ecommerce"}
        `.trim(),

        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Password Reset</title>
</head>

<body style="
    margin: 0;
    padding: 0;
    background: #f5f7fa;
    font-family: Arial, sans-serif;
">

    <div style="
        max-width: 600px;
        margin: 40px auto;
        background: #ffffff;
        padding: 40px;
        border-radius: 10px;
    ">

        <h2 style="
            margin-top: 0;
            color: #111827;
        ">
            Password reset
        </h2>

        <p style="
            color: #4b5563;
            font-size: 15px;
        ">
            Hello ${name},
        </p>

        <p style="
            color: #4b5563;
            font-size: 15px;
        ">
            Use the following OTP to reset your password:
        </p>

        <div style="
            margin: 30px 0;
            text-align: center;
        ">

            <span style="
                display: inline-block;
                padding: 15px 30px;
                background: #f3f4f6;
                border-radius: 8px;
                font-size: 30px;
                font-weight: bold;
                letter-spacing: 8px;
                color: #111827;
            ">
                ${otp}
            </span>

        </div>

        <p style="
            color: #6b7280;
            font-size: 14px;
        ">
            This OTP will expire in 10 minutes.
        </p>

        <p style="
            color: #6b7280;
            font-size: 14px;
        ">
            If you did not request a password reset,
            you can safely ignore this email.
        </p>

        <hr style="
            border: 0;
            border-top: 1px solid #e5e7eb;
            margin: 30px 0;
        ">

        <p style="
            color: #9ca3af;
            font-size: 12px;
        ">
            ${process.env.MAIL_FROM_NAME || "My Ecommerce"}
        </p>

    </div>

</body>
</html>
        `.trim(),
    };
};

module.exports = {
    verificationOTPTemplate,
    loginOTPTemplate,
    passwordResetOTPTemplate,
};