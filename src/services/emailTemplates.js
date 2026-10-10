const BRAND_NAME = "Kamvasna";
const BRAND_URL = "https://kamvasna.shop";
const BRAND_EMAIL =
    process.env.MAIL_FROM_NAME || "Kamvasna";


const verificationOTPTemplate = ({
    name,
    otp,
}) => {
    return {
        subject: "Verify your email — Kamvasna",

        text: `
Hello ${name},

Welcome to Kamvasna.

Your email verification OTP is:

${otp}

This OTP will expire in 10 minutes.

If you did not create a Kamvasna account, you can safely ignore this email.

Regards,
Kamvasna
${BRAND_URL}
        `.trim(),

        html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >
    <title>Verify your email — Kamvasna</title>
</head>

<body style="
    margin: 0;
    padding: 0;
    background-color: #f4f4f4;
    font-family: Arial, Helvetica, sans-serif;
    color: #111111;
">

    <table
        width="100%"
        cellpadding="0"
        cellspacing="0"
        border="0"
        style="background-color: #f4f4f4;"
    >
        <tr>
            <td align="center" style="padding: 40px 15px;">

                <table
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                    style="
                        max-width: 600px;
                        background-color: #ffffff;
                        border-radius: 16px;
                        overflow: hidden;
                        box-shadow: 0 8px 30px rgba(0,0,0,0.08);
                    "
                >

                    <!-- Header -->
                    <tr>
                        <td
                            align="center"
                            style="
                                background-color: #000000;
                                padding: 28px 30px;
                            "
                        >
                            <div style="
                                font-size: 30px;
                                font-weight: 800;
                                letter-spacing: -1px;
                                color: #ffffff;
                            ">
                                Kam<span style="color:#e50914;">vasna</span>
                            </div>

                            <div style="
                                margin-top: 6px;
                                color: #bdbdbd;
                                font-size: 12px;
                                letter-spacing: 1px;
                                text-transform: uppercase;
                            ">
                                Private. Personal. Yours.
                            </div>
                        </td>
                    </tr>

                    <!-- Red accent -->
                    <tr>
                        <td style="
                            height: 4px;
                            background-color: #e50914;
                            font-size: 0;
                            line-height: 0;
                        ">
                            &nbsp;
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 42px 40px;">

                            <div style="
                                display: inline-block;
                                padding: 7px 12px;
                                background-color: #fff1f2;
                                color: #e50914;
                                border-radius: 20px;
                                font-size: 12px;
                                font-weight: 700;
                            ">
                                EMAIL VERIFICATION
                            </div>

                            <h1 style="
                                margin: 18px 0 10px;
                                font-size: 26px;
                                line-height: 1.3;
                                color: #111111;
                            ">
                                Verify your email
                            </h1>

                            <p style="
                                margin: 0 0 18px;
                                font-size: 15px;
                                line-height: 1.7;
                                color: #555555;
                            ">
                                Hello ${name},
                            </p>

                            <p style="
                                margin: 0;
                                font-size: 15px;
                                line-height: 1.7;
                                color: #555555;
                            ">
                                Thanks for creating your
                                Kamvasna account. Use the
                                verification code below to
                                confirm your email address.
                            </p>

                            <!-- OTP -->
                            <div style="
                                margin: 32px 0;
                                padding: 26px 20px;
                                text-align: center;
                                background-color: #fafafa;
                                border: 1px solid #eeeeee;
                                border-radius: 12px;
                            ">

                                <div style="
                                    margin-bottom: 10px;
                                    font-size: 11px;
                                    font-weight: 700;
                                    letter-spacing: 1.5px;
                                    color: #888888;
                                ">
                                    YOUR VERIFICATION CODE
                                </div>

                                <div style="
                                    font-size: 34px;
                                    font-weight: 800;
                                    letter-spacing: 9px;
                                    color: #e50914;
                                ">
                                    ${otp}
                                </div>

                            </div>

                            <p style="
                                margin: 0 0 8px;
                                font-size: 14px;
                                color: #555555;
                            ">
                                This code expires in
                                <strong>10 minutes</strong>.
                            </p>

                            <p style="
                                margin: 0;
                                font-size: 13px;
                                line-height: 1.6;
                                color: #888888;
                            ">
                                If you did not create a
                                Kamvasna account, you can
                                safely ignore this email.
                            </p>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="
                            background-color: #111111;
                            padding: 28px 40px;
                            text-align: center;
                        ">

                            <div style="
                                font-size: 18px;
                                font-weight: 700;
                                color: #ffffff;
                            ">
                                Kam<span style="color:#e50914;">vasna</span>
                            </div>

                            <p style="
                                margin: 10px 0;
                                font-size: 12px;
                                color: #999999;
                            ">
                                Your privacy matters to us.
                            </p>

                            <a
                                href="${BRAND_URL}"
                                style="
                                    color: #e50914;
                                    font-size: 12px;
                                    text-decoration: none;
                                    font-weight: 600;
                                "
                            >
                                kamvasna.shop
                            </a>

                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

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
        subject: "Your Kamvasna login OTP",

        text: `
Hello ${name},

Your Kamvasna login OTP is:

${otp}

This OTP will expire in 10 minutes.

If you did not attempt to log in, please ignore this email.

Regards,
Kamvasna
${BRAND_URL}
        `.trim(),

        html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >
    <title>Login OTP — Kamvasna</title>
</head>

<body style="
    margin: 0;
    padding: 0;
    background-color: #f4f4f4;
    font-family: Arial, Helvetica, sans-serif;
    color: #111111;
">

    <table
        width="100%"
        cellpadding="0"
        cellspacing="0"
        border="0"
        style="background-color: #f4f4f4;"
    >
        <tr>
            <td align="center" style="padding: 40px 15px;">

                <table
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                    style="
                        max-width: 600px;
                        background-color: #ffffff;
                        border-radius: 16px;
                        overflow: hidden;
                        box-shadow: 0 8px 30px rgba(0,0,0,0.08);
                    "
                >

                    <!-- Header -->
                    <tr>
                        <td
                            align="center"
                            style="
                                background-color: #000000;
                                padding: 28px 30px;
                            "
                        >
                            <div style="
                                font-size: 30px;
                                font-weight: 800;
                                letter-spacing: -1px;
                                color: #ffffff;
                            ">
                                Kam<span style="color:#e50914;">vasna</span>
                            </div>

                            <div style="
                                margin-top: 6px;
                                color: #bdbdbd;
                                font-size: 12px;
                                letter-spacing: 1px;
                                text-transform: uppercase;
                            ">
                                Secure account access
                            </div>
                        </td>
                    </tr>

                    <tr>
                        <td style="
                            height: 4px;
                            background-color: #e50914;
                            font-size: 0;
                            line-height: 0;
                        ">
                            &nbsp;
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 42px 40px;">

                            <div style="
                                display: inline-block;
                                padding: 7px 12px;
                                background-color: #fff1f2;
                                color: #e50914;
                                border-radius: 20px;
                                font-size: 12px;
                                font-weight: 700;
                            ">
                                LOGIN VERIFICATION
                            </div>

                            <h1 style="
                                margin: 18px 0 10px;
                                font-size: 26px;
                                line-height: 1.3;
                                color: #111111;
                            ">
                                Your login code
                            </h1>

                            <p style="
                                margin: 0 0 18px;
                                font-size: 15px;
                                line-height: 1.7;
                                color: #555555;
                            ">
                                Hello ${name},
                            </p>

                            <p style="
                                margin: 0;
                                font-size: 15px;
                                line-height: 1.7;
                                color: #555555;
                            ">
                                Use the one-time password below
                                to securely access your Kamvasna
                                account.
                            </p>

                            <!-- OTP -->
                            <div style="
                                margin: 32px 0;
                                padding: 26px 20px;
                                text-align: center;
                                background-color: #fafafa;
                                border: 1px solid #eeeeee;
                                border-radius: 12px;
                            ">

                                <div style="
                                    margin-bottom: 10px;
                                    font-size: 11px;
                                    font-weight: 700;
                                    letter-spacing: 1.5px;
                                    color: #888888;
                                ">
                                    LOGIN CODE
                                </div>

                                <div style="
                                    font-size: 34px;
                                    font-weight: 800;
                                    letter-spacing: 9px;
                                    color: #e50914;
                                ">
                                    ${otp}
                                </div>

                            </div>

                            <p style="
                                margin: 0 0 8px;
                                font-size: 14px;
                                color: #555555;
                            ">
                                This code expires in
                                <strong>10 minutes</strong>.
                            </p>

                            <div style="
                                margin-top: 24px;
                                padding: 14px 16px;
                                background-color: #fff7f7;
                                border-left: 3px solid #e50914;
                                border-radius: 6px;
                            ">
                                <p style="
                                    margin: 0;
                                    font-size: 13px;
                                    line-height: 1.6;
                                    color: #666666;
                                ">
                                    If you did not attempt to log
                                    in to your account, please
                                    ignore this email and consider
                                    changing your password.
                                </p>
                            </div>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="
                            background-color: #111111;
                            padding: 28px 40px;
                            text-align: center;
                        ">

                            <div style="
                                font-size: 18px;
                                font-weight: 700;
                                color: #ffffff;
                            ">
                                Kam<span style="color:#e50914;">vasna</span>
                            </div>

                            <p style="
                                margin: 10px 0;
                                font-size: 12px;
                                color: #999999;
                            ">
                                Secure access to your account.
                            </p>

                            <a
                                href="${BRAND_URL}"
                                style="
                                    color: #e50914;
                                    font-size: 12px;
                                    text-decoration: none;
                                    font-weight: 600;
                                "
                            >
                                kamvasna.shop
                            </a>

                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

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
        subject: "Reset your Kamvasna password",

        text: `
Hello ${name},

Your Kamvasna password reset OTP is:

${otp}

This OTP will expire in 10 minutes.

If you did not request a password reset, please ignore this email.

Regards,
Kamvasna
${BRAND_URL}
        `.trim(),

        html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >
    <title>Password Reset — Kamvasna</title>
</head>

<body style="
    margin: 0;
    padding: 0;
    background-color: #f4f4f4;
    font-family: Arial, Helvetica, sans-serif;
    color: #111111;
">

    <table
        width="100%"
        cellpadding="0"
        cellspacing="0"
        border="0"
        style="background-color: #f4f4f4;"
    >
        <tr>
            <td align="center" style="padding: 40px 15px;">

                <table
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                    style="
                        max-width: 600px;
                        background-color: #ffffff;
                        border-radius: 16px;
                        overflow: hidden;
                        box-shadow: 0 8px 30px rgba(0,0,0,0.08);
                    "
                >

                    <!-- Header -->
                    <tr>
                        <td
                            align="center"
                            style="
                                background-color: #000000;
                                padding: 28px 30px;
                            "
                        >
                            <div style="
                                font-size: 30px;
                                font-weight: 800;
                                letter-spacing: -1px;
                                color: #ffffff;
                            ">
                                Kam<span style="color:#e50914;">vasna</span>
                            </div>

                            <div style="
                                margin-top: 6px;
                                color: #bdbdbd;
                                font-size: 12px;
                                letter-spacing: 1px;
                                text-transform: uppercase;
                            ">
                                Account security
                            </div>
                        </td>
                    </tr>

                    <tr>
                        <td style="
                            height: 4px;
                            background-color: #e50914;
                            font-size: 0;
                            line-height: 0;
                        ">
                            &nbsp;
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 42px 40px;">

                            <div style="
                                display: inline-block;
                                padding: 7px 12px;
                                background-color: #fff1f2;
                                color: #e50914;
                                border-radius: 20px;
                                font-size: 12px;
                                font-weight: 700;
                            ">
                                PASSWORD RESET
                            </div>

                            <h1 style="
                                margin: 18px 0 10px;
                                font-size: 26px;
                                line-height: 1.3;
                                color: #111111;
                            ">
                                Reset your password
                            </h1>

                            <p style="
                                margin: 0 0 18px;
                                font-size: 15px;
                                line-height: 1.7;
                                color: #555555;
                            ">
                                Hello ${name},
                            </p>

                            <p style="
                                margin: 0;
                                font-size: 15px;
                                line-height: 1.7;
                                color: #555555;
                            ">
                                We received a request to reset
                                your Kamvasna account password.
                                Use the OTP below to continue.
                            </p>

                            <!-- OTP -->
                            <div style="
                                margin: 32px 0;
                                padding: 26px 20px;
                                text-align: center;
                                background-color: #fafafa;
                                border: 1px solid #eeeeee;
                                border-radius: 12px;
                            ">

                                <div style="
                                    margin-bottom: 10px;
                                    font-size: 11px;
                                    font-weight: 700;
                                    letter-spacing: 1.5px;
                                    color: #888888;
                                ">
                                    PASSWORD RESET CODE
                                </div>

                                <div style="
                                    font-size: 34px;
                                    font-weight: 800;
                                    letter-spacing: 9px;
                                    color: #e50914;
                                ">
                                    ${otp}
                                </div>

                            </div>

                            <p style="
                                margin: 0 0 8px;
                                font-size: 14px;
                                color: #555555;
                            ">
                                This code expires in
                                <strong>10 minutes</strong>.
                            </p>

                            <div style="
                                margin-top: 24px;
                                padding: 14px 16px;
                                background-color: #fff7f7;
                                border-left: 3px solid #e50914;
                                border-radius: 6px;
                            ">
                                <p style="
                                    margin: 0;
                                    font-size: 13px;
                                    line-height: 1.6;
                                    color: #666666;
                                ">
                                    If you did not request a
                                    password reset, you can
                                    safely ignore this email.
                                    Your password will not be
                                    changed.
                                </p>
                            </div>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="
                            background-color: #111111;
                            padding: 28px 40px;
                            text-align: center;
                        ">

                            <div style="
                                font-size: 18px;
                                font-weight: 700;
                                color: #ffffff;
                            ">
                                Kam<span style="color:#e50914;">vasna</span>
                            </div>

                            <p style="
                                margin: 10px 0;
                                font-size: 12px;
                                color: #999999;
                            ">
                                Need help? Visit our website.
                            </p>

                            <a
                                href="${BRAND_URL}"
                                style="
                                    color: #e50914;
                                    font-size: 12px;
                                    text-decoration: none;
                                    font-weight: 600;
                                "
                            >
                                kamvasna.shop
                            </a>

                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>
</html>
        `.trim(),
    };
};

const orderReceivedTemplate = ({
    name,
    orderNumber,
    items = [],
    subtotal = 0,
    shippingAmount = 0,
    discountAmount = 0,
    totalAmount = 0,
    paymentMethod,
    paymentStatus = "PENDING",
    orderStatus = "PENDING",
    shippingAddress = {},
    createdAt,
}) => {
    const formattedDate = createdAt
        ? new Date(createdAt).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        })
        : new Date().toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });

    const formattedPaymentMethod =
        paymentMethod === "COD"
            ? "Cash on Delivery"
            : "Online Payment";

    const itemsText = items
        .map(
            (item) =>
                `${item.name} x ${item.quantity} - ₹${Number(
                    item.subtotal
                ).toFixed(2)}`
        )
        .join("\n");

    const itemsHtml = items
        .map(
            (item) => `
                <tr>
                    <td style="
                        padding: 14px 0;
                        border-bottom: 1px solid #eeeeee;
                    ">
                        <div style="
                            font-size: 14px;
                            font-weight: 600;
                            color: #111111;
                        ">
                            ${item.name}
                        </div>

                        <div style="
                            margin-top: 4px;
                            font-size: 12px;
                            color: #888888;
                        ">
                            SKU: ${item.sku || "-"}
                        </div>
                    </td>

                    <td
                        align="center"
                        style="
                            padding: 14px 8px;
                            border-bottom: 1px solid #eeeeee;
                            font-size: 13px;
                            color: #555555;
                            white-space: nowrap;
                        "
                    >
                        ${item.quantity}
                    </td>

                    <td
                        align="right"
                        style="
                            padding: 14px 0;
                            border-bottom: 1px solid #eeeeee;
                            font-size: 14px;
                            font-weight: 600;
                            color: #111111;
                            white-space: nowrap;
                        "
                    >
                        ₹${Number(item.subtotal).toFixed(2)}
                    </td>
                </tr>
            `
        )
        .join("");

    const addressHtml = `
        ${shippingAddress.name || name}<br>
        ${shippingAddress.addressLine1 || ""}<br>
        ${shippingAddress.addressLine2
            ? `${shippingAddress.addressLine2}<br>`
            : ""
        }
        ${shippingAddress.city || ""},
        ${shippingAddress.state || ""} -
        ${shippingAddress.postalCode || ""}<br>
        ${shippingAddress.country || "India"}<br>
        Phone: ${shippingAddress.phone || "-"}
    `;

    const addressText = [
        shippingAddress.name || name,
        shippingAddress.addressLine1,
        shippingAddress.addressLine2,
        `${shippingAddress.city || ""}, ${shippingAddress.state || ""
        } - ${shippingAddress.postalCode || ""}`,
        shippingAddress.country || "India",
        `Phone: ${shippingAddress.phone || "-"}`,
    ]
        .filter(Boolean)
        .join("\n");

    return {
        subject: `Order ${orderNumber} received — Kamvasna`,

        text: `
Hello ${name},

Thank you for shopping with Kamvasna!

Your order has been received successfully.

ORDER DETAILS
------------------------------
Order Number: ${orderNumber}
Order Date: ${formattedDate}
Payment Method: ${formattedPaymentMethod}
Payment Status: ${paymentStatus}
Order Status: ${orderStatus}

ITEMS
------------------------------
${itemsText}

ORDER SUMMARY
------------------------------
Subtotal: ₹${Number(subtotal).toFixed(2)}
Shipping: ₹${Number(shippingAmount).toFixed(2)}
Discount: ₹${Number(discountAmount).toFixed(2)}
Total: ₹${Number(totalAmount).toFixed(2)}

SHIPPING ADDRESS
------------------------------
${addressText}

We will keep you updated as your order progresses.

Thank you for choosing Kamvasna.

Regards,
Kamvasna
${BRAND_URL}
        `.trim(),

        html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >
    <title>Order Received — Kamvasna</title>
</head>

<body style="
    margin: 0;
    padding: 0;
    background-color: #f4f4f4;
    font-family: Arial, Helvetica, sans-serif;
    color: #111111;
">

    <table
        width="100%"
        cellpadding="0"
        cellspacing="0"
        border="0"
        style="background-color: #f4f4f4;"
    >
        <tr>
            <td align="center" style="padding: 40px 15px;">

                <table
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                    style="
                        max-width: 600px;
                        background-color: #ffffff;
                        border-radius: 16px;
                        overflow: hidden;
                        box-shadow: 0 8px 30px rgba(0,0,0,0.08);
                    "
                >

                    <!-- Header -->
                    <tr>
                        <td
                            align="center"
                            style="
                                background-color: #000000;
                                padding: 28px 30px;
                            "
                        >
                            <div style="
                                font-size: 30px;
                                font-weight: 800;
                                letter-spacing: -1px;
                                color: #ffffff;
                            ">
                                Kam<span style="color:#e50914;">vasna</span>
                            </div>

                            <div style="
                                margin-top: 6px;
                                color: #bdbdbd;
                                font-size: 12px;
                                letter-spacing: 1px;
                                text-transform: uppercase;
                            ">
                                Your order has been received
                            </div>
                        </td>
                    </tr>

                    <!-- Red Accent -->
                    <tr>
                        <td style="
                            height: 4px;
                            background-color: #e50914;
                            font-size: 0;
                            line-height: 0;
                        ">
                            &nbsp;
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 42px 40px;">

                            <!-- Badge -->
                            <div style="
                                display: inline-block;
                                padding: 7px 12px;
                                background-color: #fff1f2;
                                color: #e50914;
                                border-radius: 20px;
                                font-size: 12px;
                                font-weight: 700;
                            ">
                                ORDER RECEIVED
                            </div>

                            <h1 style="
                                margin: 18px 0 10px;
                                font-size: 26px;
                                line-height: 1.3;
                                color: #111111;
                            ">
                                Thank you for your order!
                            </h1>

                            <p style="
                                margin: 0 0 22px;
                                font-size: 15px;
                                line-height: 1.7;
                                color: #555555;
                            ">
                                Hello ${name},
                                <br><br>
                                We've received your order and
                                we're getting it ready for you.
                            </p>

                            <!-- Order Number -->
                            <div style="
                                margin-bottom: 28px;
                                padding: 18px 20px;
                                background-color: #fafafa;
                                border: 1px solid #eeeeee;
                                border-radius: 10px;
                            ">

                                <div style="
                                    font-size: 11px;
                                    font-weight: 700;
                                    letter-spacing: 1.3px;
                                    color: #888888;
                                    text-transform: uppercase;
                                ">
                                    Order Number
                                </div>

                                <div style="
                                    margin-top: 7px;
                                    font-size: 20px;
                                    font-weight: 800;
                                    color: #e50914;
                                ">
                                    ${orderNumber}
                                </div>

                                <div style="
                                    margin-top: 6px;
                                    font-size: 12px;
                                    color: #888888;
                                ">
                                    ${formattedDate}
                                </div>

                            </div>

                            <!-- Status -->
                            <table
                                width="100%"
                                cellpadding="0"
                                cellspacing="0"
                                border="0"
                                style="
                                    margin-bottom: 30px;
                                "
                            >
                                <tr>

                                    <td
                                        width="50%"
                                        style="
                                            padding-right: 6px;
                                        "
                                    >
                                        <div style="
                                            padding: 14px;
                                            background-color: #fafafa;
                                            border: 1px solid #eeeeee;
                                            border-radius: 8px;
                                        ">
                                            <div style="
                                                font-size: 11px;
                                                color: #888888;
                                                text-transform: uppercase;
                                                font-weight: 700;
                                            ">
                                                Payment
                                            </div>

                                            <div style="
                                                margin-top: 5px;
                                                font-size: 13px;
                                                font-weight: 700;
                                                color: #111111;
                                            ">
                                                ${formattedPaymentMethod}
                                            </div>

                                            <div style="
                                                margin-top: 3px;
                                                font-size: 12px;
                                                color: ${paymentStatus ===
                "PAID"
                ? "#16a34a"
                : "#777777"
            };
                                            ">
                                                ${paymentStatus}
                                            </div>
                                        </div>
                                    </td>

                                    <td
                                        width="50%"
                                        style="
                                            padding-left: 6px;
                                        "
                                    >
                                        <div style="
                                            padding: 14px;
                                            background-color: #fafafa;
                                            border: 1px solid #eeeeee;
                                            border-radius: 8px;
                                        ">
                                            <div style="
                                                font-size: 11px;
                                                color: #888888;
                                                text-transform: uppercase;
                                                font-weight: 700;
                                            ">
                                                Order Status
                                            </div>

                                            <div style="
                                                margin-top: 5px;
                                                font-size: 13px;
                                                font-weight: 700;
                                                color: #111111;
                                            ">
                                                ${orderStatus}
                                            </div>
                                        </div>
                                    </td>

                                </tr>
                            </table>

                            <!-- Items -->
                            <h2 style="
                                margin: 0 0 14px;
                                font-size: 17px;
                                color: #111111;
                            ">
                                Your Items
                            </h2>

                            <table
                                width="100%"
                                cellpadding="0"
                                cellspacing="0"
                                border="0"
                                style="
                                    border-top: 1px solid #eeeeee;
                                "
                            >
                                <thead>
                                    <tr>
                                        <th
                                            align="left"
                                            style="
                                                padding: 12px 0;
                                                font-size: 11px;
                                                color: #888888;
                                                text-transform: uppercase;
                                                letter-spacing: .5px;
                                            "
                                        >
                                            Product
                                        </th>

                                        <th
                                            align="center"
                                            style="
                                                padding: 12px 8px;
                                                font-size: 11px;
                                                color: #888888;
                                                text-transform: uppercase;
                                            "
                                        >
                                            Qty
                                        </th>

                                        <th
                                            align="right"
                                            style="
                                                padding: 12px 0;
                                                font-size: 11px;
                                                color: #888888;
                                                text-transform: uppercase;
                                            "
                                        >
                                            Amount
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    ${itemsHtml}
                                </tbody>
                            </table>

                            <!-- Summary -->
                            <div style="
                                margin-top: 25px;
                                padding: 20px;
                                background-color: #fafafa;
                                border-radius: 10px;
                            ">

                                <table
                                    width="100%"
                                    cellpadding="0"
                                    cellspacing="0"
                                    border="0"
                                >

                                    <tr>
                                        <td style="
                                            padding: 5px 0;
                                            font-size: 14px;
                                            color: #666666;
                                        ">
                                            Subtotal
                                        </td>

                                        <td
                                            align="right"
                                            style="
                                                padding: 5px 0;
                                                font-size: 14px;
                                                color: #111111;
                                            "
                                        >
                                            ₹${Number(subtotal).toFixed(2)}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="
                                            padding: 5px 0;
                                            font-size: 14px;
                                            color: #666666;
                                        ">
                                            Shipping
                                        </td>

                                        <td
                                            align="right"
                                            style="
                                                padding: 5px 0;
                                                font-size: 14px;
                                                color: #111111;
                                            "
                                        >
                                            ₹${Number(
                shippingAmount
            ).toFixed(2)}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="
                                            padding: 5px 0;
                                            font-size: 14px;
                                            color: #666666;
                                        ">
                                            Discount
                                        </td>

                                        <td
                                            align="right"
                                            style="
                                                padding: 5px 0;
                                                font-size: 14px;
                                                color: #16a34a;
                                            "
                                        >
                                            - ₹${Number(
                discountAmount
            ).toFixed(2)}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td
                                            colspan="2"
                                            style="
                                                padding-top: 12px;
                                                border-top: 1px solid #dddddd;
                                            "
                                        ></td>
                                    </tr>

                                    <tr>
                                        <td style="
                                            font-size: 17px;
                                            font-weight: 800;
                                            color: #111111;
                                        ">
                                            Total
                                        </td>

                                        <td
                                            align="right"
                                            style="
                                                font-size: 19px;
                                                font-weight: 800;
                                                color: #e50914;
                                            "
                                        >
                                            ₹${Number(
                totalAmount
            ).toFixed(2)}
                                        </td>
                                    </tr>

                                </table>

                            </div>

                            <!-- Shipping Address -->
                            <h2 style="
                                margin: 30px 0 14px;
                                font-size: 17px;
                                color: #111111;
                            ">
                                Delivery Address
                            </h2>

                            <div style="
                                padding: 18px 20px;
                                background-color: #fafafa;
                                border: 1px solid #eeeeee;
                                border-radius: 10px;
                                font-size: 13px;
                                line-height: 1.7;
                                color: #555555;
                            ">
                                ${addressHtml}
                            </div>

                            <!-- Message -->
                            <div style="
                                margin-top: 25px;
                                padding: 15px 16px;
                                background-color: #fff7f7;
                                border-left: 3px solid #e50914;
                                border-radius: 6px;
                            ">
                                <p style="
                                    margin: 0;
                                    font-size: 13px;
                                    line-height: 1.6;
                                    color: #666666;
                                ">
                                    We'll keep you updated as your
                                    order moves through each stage.
                                    Thank you for choosing Kamvasna.
                                </p>
                            </div>

                            <!-- CTA -->
                            <div style="
                                margin-top: 30px;
                                text-align: center;
                            ">
                                <a
                                    href="${BRAND_URL}/account/orders"
                                    style="
                                        display: inline-block;
                                        padding: 13px 24px;
                                        background-color: #000000;
                                        color: #ffffff;
                                        border-radius: 8px;
                                        font-size: 13px;
                                        font-weight: 700;
                                        text-decoration: none;
                                    "
                                >
                                    View My Orders
                                </a>
                            </div>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="
                            background-color: #111111;
                            padding: 28px 40px;
                            text-align: center;
                        ">

                            <div style="
                                font-size: 18px;
                                font-weight: 700;
                                color: #ffffff;
                            ">
                                Kam<span style="color:#e50914;">vasna</span>
                            </div>

                            <p style="
                                margin: 10px 0;
                                font-size: 12px;
                                color: #999999;
                            ">
                                Thank you for shopping with us.
                            </p>

                            <a
                                href="${BRAND_URL}"
                                style="
                                    color: #e50914;
                                    font-size: 12px;
                                    text-decoration: none;
                                    font-weight: 600;
                                "
                            >
                                kamvasna.shop
                            </a>

                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>
</html>
        `.trim(),
    };
};

const orderStatusUpdateTemplate = ({
    name,
    orderNumber,
    items = [],
    subtotal = 0,
    shippingAmount = 0,
    discountAmount = 0,
    totalAmount = 0,
    paymentMethod,
    paymentStatus = "PENDING",
    orderStatus = "PENDING",
    previousOrderStatus,
    shippingAddress = {},
    createdAt,
}) => {



    const formattedOrderStatus = {
        PENDING: "Order Pending",
        CONFIRMED: "Order Confirmed",
        PROCESSING: "Order Processing",
        SHIPPED: "Order Shipped",
        DELIVERED: "Order Delivered",
        CANCELLED: "Order Cancelled",
    }[orderStatus] || orderStatus;

    const formattedPreviousStatus = previousOrderStatus
        ? {
            PENDING: "Order Pending",
            CONFIRMED: "Order Confirmed",
            PROCESSING: "Order Processing",
            SHIPPED: "Order Shipped",
            DELIVERED: "Order Delivered",
            CANCELLED: "Order Cancelled",
        }[previousOrderStatus] || previousOrderStatus
        : null;

    const statusMessage = {
        PENDING:
            "Your order is waiting for confirmation. We will update you once it moves to the next stage.",
        CONFIRMED:
            "Your order has been confirmed and will be processed shortly.",
        PROCESSING:
            "Your order is now being prepared. We are getting it ready for dispatch.",
        SHIPPED:
            "Great news! Your order has been shipped and is on its way to you.",
        DELIVERED:
            "Your order has been delivered successfully. We hope you enjoy your purchase!",
        CANCELLED:
            "Your order has been cancelled. If you believe this was done in error, please contact our support team.",
    }[orderStatus] || "Your order status has been updated.";

    const statusSubject = {
        PENDING: "Order Pending",
        CONFIRMED: "Order Confirmed",
        PROCESSING: "Order Processing",
        SHIPPED: "Order Shipped",
        DELIVERED: "Order Delivered",
        CANCELLED: "Order Cancelled",
    }[orderStatus] || "Order Status Updated";

    const formattedDate = createdAt
        ? new Date(createdAt).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        })
        : new Date().toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });

    const formattedPaymentMethod =
        paymentMethod === "COD"
            ? "Cash on Delivery"
            : "Online Payment";

    const itemsText = items
        .map(
            (item) =>
                `${item.name} x ${item.quantity} - ₹${Number(
                    item.subtotal
                ).toFixed(2)}`
        )
        .join("\n");

    const itemsHtml = items
        .map(
            (item) => `
                <tr>
                    <td style="
                        padding: 14px 0;
                        border-bottom: 1px solid #eeeeee;
                    ">
                        <div style="
                            font-size: 14px;
                            font-weight: 600;
                            color: #111111;
                        ">
                            ${item.name}
                        </div>

                        <div style="
                            margin-top: 4px;
                            font-size: 12px;
                            color: #888888;
                        ">
                            SKU: ${item.sku || "-"}
                        </div>
                    </td>

                    <td
                        align="center"
                        style="
                            padding: 14px 8px;
                            border-bottom: 1px solid #eeeeee;
                            font-size: 13px;
                            color: #555555;
                            white-space: nowrap;
                        "
                    >
                        ${item.quantity}
                    </td>

                    <td
                        align="right"
                        style="
                            padding: 14px 0;
                            border-bottom: 1px solid #eeeeee;
                            font-size: 14px;
                            font-weight: 600;
                            color: #111111;
                            white-space: nowrap;
                        "
                    >
                        ₹${Number(item.subtotal).toFixed(2)}
                    </td>
                </tr>
            `
        )
        .join("");

    const addressHtml = `
        ${shippingAddress.name || name}<br>
        ${shippingAddress.addressLine1 || ""}<br>
        ${shippingAddress.addressLine2
            ? `${shippingAddress.addressLine2}<br>`
            : ""
        }
        ${shippingAddress.city || ""},
        ${shippingAddress.state || ""} -
        ${shippingAddress.postalCode || ""}<br>
        ${shippingAddress.country || "India"}<br>
        Phone: ${shippingAddress.phone || "-"}
    `;

    const addressText = [
        shippingAddress.name || name,
        shippingAddress.addressLine1,
        shippingAddress.addressLine2,
        `${shippingAddress.city || ""}, ${shippingAddress.state || ""
        } - ${shippingAddress.postalCode || ""}`,
        shippingAddress.country || "India",
        `Phone: ${shippingAddress.phone || "-"}`,
    ]
        .filter(Boolean)
        .join("\n");

    return {
        subject: `${statusSubject} — Order ${orderNumber} — Kamvasna`,

        text: `
Hello ${name},

We wanted to let you know that the status of your Kamvasna order has been updated.

ORDER STATUS UPDATE
------------------------------
Order Number: ${orderNumber}
Previous Status: ${formattedPreviousStatus || "N/A"}
Current Status: ${formattedOrderStatus}

${statusMessage}

ORDER DETAILS
------------------------------
Order Number: ${orderNumber}
Order Date: ${formattedDate}
Payment Method: ${formattedPaymentMethod}
Payment Status: ${paymentStatus}
Order Status: ${orderStatus}

ITEMS
------------------------------
${itemsText}

ORDER SUMMARY
------------------------------
Subtotal: ₹${Number(subtotal).toFixed(2)}
Shipping: ₹${Number(shippingAmount).toFixed(2)}
Discount: ₹${Number(discountAmount).toFixed(2)}
Total: ₹${Number(totalAmount).toFixed(2)}

SHIPPING ADDRESS
------------------------------
${addressText}

We will keep you updated as your order progresses.

Thank you for choosing Kamvasna.

Regards,
Kamvasna
${BRAND_URL}
        `.trim(),

        html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >
    <title>Order Received — Kamvasna</title>
</head>

<body style="
    margin: 0;
    padding: 0;
    background-color: #f4f4f4;
    font-family: Arial, Helvetica, sans-serif;
    color: #111111;
">

    <table
        width="100%"
        cellpadding="0"
        cellspacing="0"
        border="0"
        style="background-color: #f4f4f4;"
    >
        <tr>
            <td align="center" style="padding: 40px 15px;">

                <table
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                    style="
                        max-width: 600px;
                        background-color: #ffffff;
                        border-radius: 16px;
                        overflow: hidden;
                        box-shadow: 0 8px 30px rgba(0,0,0,0.08);
                    "
                >

                    <!-- Header -->
                    <tr>
                        <td
                            align="center"
                            style="
                                background-color: #000000;
                                padding: 28px 30px;
                            "
                        >
                            <div style="
                                font-size: 30px;
                                font-weight: 800;
                                letter-spacing: -1px;
                                color: #ffffff;
                            ">
                                Kam<span style="color:#e50914;">vasna</span>
                            </div>

                            <div style="
                                margin-top: 6px;
                                color: #bdbdbd;
                                font-size: 12px;
                                letter-spacing: 1px;
                                text-transform: uppercase;
                            ">
                                Order status has been updated
                            </div>
                        </td>
                    </tr>

                    <!-- Red Accent -->
                    <tr>
                        <td style="
                            height: 4px;
                            background-color: #e50914;
                            font-size: 0;
                            line-height: 0;
                        ">
                            &nbsp;
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 42px 40px;">

                            <!-- Badge -->
                            <div style="
                                display: inline-block;
                                padding: 7px 12px;
                                background-color: #fff1f2;
                                color: #e50914;
                                border-radius: 20px;
                                font-size: 12px;
                                font-weight: 700;
                            ">
                             ${statusSubject.toUpperCase()}
                            </div>

                            <h1 style="
                                margin: 18px 0 10px;
                                font-size: 26px;
                                line-height: 1.3;
                                color: #111111;
                            ">
                                ${statusSubject}
                            </h1>

                            <p style="
                                margin: 0 0 22px;
                                font-size: 15px;
                                line-height: 1.7;
                                color: #555555;
                            ">
                                Hello ${name},
                                <br><br>
                                ${statusMessage}
                            </p>

                            <!-- Order Number -->
                            <div style="
                                margin-bottom: 28px;
                                padding: 18px 20px;
                                background-color: #fafafa;
                                border: 1px solid #eeeeee;
                                border-radius: 10px;
                            ">

                                <div style="
                                    font-size: 11px;
                                    font-weight: 700;
                                    letter-spacing: 1.3px;
                                    color: #888888;
                                    text-transform: uppercase;
                                ">
                                    Order Number
                                </div>

                                <div style="
                                    margin-top: 7px;
                                    font-size: 20px;
                                    font-weight: 800;
                                    color: #e50914;
                                ">
                                    ${orderNumber}
                                </div>

                                <div style="
                                    margin-top: 6px;
                                    font-size: 12px;
                                    color: #888888;
                                ">
                                    ${formattedDate}
                                </div>

                            </div>

                            <!-- Status Update Message -->
<div style="
    margin-bottom: 28px;
    padding: 18px 20px;
    background-color: #fff7f7;
    border: 1px solid #ffd6d9;
    border-left: 4px solid #e50914;
    border-radius: 10px;
">
    <div style="
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 1px;
        color: #888888;
        text-transform: uppercase;
    ">
        Order Status Update
    </div>

    <div style="
        margin-top: 8px;
        font-size: 20px;
        font-weight: 800;
        color: #e50914;
    ">
        ${formattedOrderStatus}
    </div>

    ${formattedPreviousStatus
                ? `
                <div style="
                    margin-top: 6px;
                    font-size: 12px;
                    color: #777777;
                ">
                    Previous status: ${formattedPreviousStatus}
                </div>
              `
                : ""
            }

    <div style="
        margin-top: 12px;
        font-size: 13px;
        line-height: 1.6;
        color: #555555;
    ">
        ${statusMessage}
    </div>
</div>

                            <!-- Status -->
                            <table
                                width="100%"
                                cellpadding="0"
                                cellspacing="0"
                                border="0"
                                style="
                                    margin-bottom: 30px;
                                "
                            >
                                <tr>

                                    <td
                                        width="50%"
                                        style="
                                            padding-right: 6px;
                                        "
                                    >
                                        <div style="
                                            padding: 14px;
                                            background-color: #fafafa;
                                            border: 1px solid #eeeeee;
                                            border-radius: 8px;
                                        ">
                                            <div style="
                                                font-size: 11px;
                                                color: #888888;
                                                text-transform: uppercase;
                                                font-weight: 700;
                                            ">
                                                Payment
                                            </div>

                                            <div style="
                                                margin-top: 5px;
                                                font-size: 13px;
                                                font-weight: 700;
                                                color: #111111;
                                            ">
                                                ${formattedPaymentMethod}
                                            </div>

                                            <div style="
                                                margin-top: 3px;
                                                font-size: 12px;
                                                color: ${paymentStatus ===
                "PAID"
                ? "#16a34a"
                : "#777777"
            };
                                            ">
                                                ${paymentStatus}
                                            </div>
                                        </div>
                                    </td>

                                    <td
                                        width="50%"
                                        style="
                                            padding-left: 6px;
                                        "
                                    >
                                        <div style="
                                            padding: 14px;
                                            background-color: #fafafa;
                                            border: 1px solid #eeeeee;
                                            border-radius: 8px;
                                        ">
                                            <div style="
                                                font-size: 11px;
                                                color: #888888;
                                                text-transform: uppercase;
                                                font-weight: 700;
                                            ">
                                                Order Status
                                            </div>

                                            <div style="
                                                margin-top: 5px;
                                                font-size: 13px;
                                                font-weight: 700;
                                                color: #111111;
                                            ">
                                               ${formattedOrderStatus}
                                            </div>
                                        </div>
                                    </td>

                                </tr>
                            </table>

                            <!-- Items -->
                            <h2 style="
                                margin: 0 0 14px;
                                font-size: 17px;
                                color: #111111;
                            ">
                                Your Items
                            </h2>

                            <table
                                width="100%"
                                cellpadding="0"
                                cellspacing="0"
                                border="0"
                                style="
                                    border-top: 1px solid #eeeeee;
                                "
                            >
                                <thead>
                                    <tr>
                                        <th
                                            align="left"
                                            style="
                                                padding: 12px 0;
                                                font-size: 11px;
                                                color: #888888;
                                                text-transform: uppercase;
                                                letter-spacing: .5px;
                                            "
                                        >
                                            Product
                                        </th>

                                        <th
                                            align="center"
                                            style="
                                                padding: 12px 8px;
                                                font-size: 11px;
                                                color: #888888;
                                                text-transform: uppercase;
                                            "
                                        >
                                            Qty
                                        </th>

                                        <th
                                            align="right"
                                            style="
                                                padding: 12px 0;
                                                font-size: 11px;
                                                color: #888888;
                                                text-transform: uppercase;
                                            "
                                        >
                                            Amount
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    ${itemsHtml}
                                </tbody>
                            </table>

                            <!-- Summary -->
                            <div style="
                                margin-top: 25px;
                                padding: 20px;
                                background-color: #fafafa;
                                border-radius: 10px;
                            ">

                                <table
                                    width="100%"
                                    cellpadding="0"
                                    cellspacing="0"
                                    border="0"
                                >

                                    <tr>
                                        <td style="
                                            padding: 5px 0;
                                            font-size: 14px;
                                            color: #666666;
                                        ">
                                            Subtotal
                                        </td>

                                        <td
                                            align="right"
                                            style="
                                                padding: 5px 0;
                                                font-size: 14px;
                                                color: #111111;
                                            "
                                        >
                                            ₹${Number(subtotal).toFixed(2)}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="
                                            padding: 5px 0;
                                            font-size: 14px;
                                            color: #666666;
                                        ">
                                            Shipping
                                        </td>

                                        <td
                                            align="right"
                                            style="
                                                padding: 5px 0;
                                                font-size: 14px;
                                                color: #111111;
                                            "
                                        >
                                            ₹${Number(
                shippingAmount
            ).toFixed(2)}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="
                                            padding: 5px 0;
                                            font-size: 14px;
                                            color: #666666;
                                        ">
                                            Discount
                                        </td>

                                        <td
                                            align="right"
                                            style="
                                                padding: 5px 0;
                                                font-size: 14px;
                                                color: #16a34a;
                                            "
                                        >
                                            - ₹${Number(
                discountAmount
            ).toFixed(2)}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td
                                            colspan="2"
                                            style="
                                                padding-top: 12px;
                                                border-top: 1px solid #dddddd;
                                            "
                                        ></td>
                                    </tr>

                                    <tr>
                                        <td style="
                                            font-size: 17px;
                                            font-weight: 800;
                                            color: #111111;
                                        ">
                                            Total
                                        </td>

                                        <td
                                            align="right"
                                            style="
                                                font-size: 19px;
                                                font-weight: 800;
                                                color: #e50914;
                                            "
                                        >
                                            ₹${Number(
                totalAmount
            ).toFixed(2)}
                                        </td>
                                    </tr>

                                </table>

                            </div>

                            <!-- Shipping Address -->
                            <h2 style="
                                margin: 30px 0 14px;
                                font-size: 17px;
                                color: #111111;
                            ">
                                Delivery Address
                            </h2>

                            <div style="
                                padding: 18px 20px;
                                background-color: #fafafa;
                                border: 1px solid #eeeeee;
                                border-radius: 10px;
                                font-size: 13px;
                                line-height: 1.7;
                                color: #555555;
                            ">
                                ${addressHtml}
                            </div>

                            <!-- Message -->
                            <div style="
                                margin-top: 25px;
                                padding: 15px 16px;
                                background-color: #fff7f7;
                                border-left: 3px solid #e50914;
                                border-radius: 6px;
                            ">
                               <p style="
                                    margin: 0;
                                    font-size: 13px;
                                    line-height: 1.6;
                                    color: #666666;
                                ">
                                    Your order status has been updated to
                                    <strong>${formattedOrderStatus}</strong>.
                                    We'll continue to keep you informed as your order progresses.
                                    Thank you for choosing Kamvasna.
                                </p>
                            </div>

                            <!-- CTA -->
                            <div style="
                                margin-top: 30px;
                                text-align: center;
                            ">
                                <a
                                    href="${BRAND_URL}/account/orders"
                                    style="
                                        display: inline-block;
                                        padding: 13px 24px;
                                        background-color: #000000;
                                        color: #ffffff;
                                        border-radius: 8px;
                                        font-size: 13px;
                                        font-weight: 700;
                                        text-decoration: none;
                                    "
                                >
                                    View My Orders
                                </a>
                            </div>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="
                            background-color: #111111;
                            padding: 28px 40px;
                            text-align: center;
                        ">

                            <div style="
                                font-size: 18px;
                                font-weight: 700;
                                color: #ffffff;
                            ">
                                Kam<span style="color:#e50914;">vasna</span>
                            </div>

                            <p style="
                                margin: 10px 0;
                                font-size: 12px;
                                color: #999999;
                            ">
                                Thank you for shopping with us.
                            </p>

                            <a
                                href="${BRAND_URL}"
                                style="
                                    color: #e50914;
                                    font-size: 12px;
                                    text-decoration: none;
                                    font-weight: 600;
                                "
                            >
                                kamvasna.shop
                            </a>

                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>
</html>
        `.trim(),
    };
};

const orderReceivedTemplateAdmin = ({
    name,
    customerEmail,
    orderNumber,
    items = [],
    subtotal = 0,
    shippingAmount = 0,
    discountAmount = 0,
    totalAmount = 0,
    paymentMethod,
    paymentStatus = "PENDING",
    orderStatus = "PENDING",
    shippingAddress = {},
    createdAt,
}) => {
    const formattedDate = createdAt
        ? new Date(createdAt).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        })
        : new Date().toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });

    const formattedPaymentMethod =
        paymentMethod === "COD"
            ? "Cash on Delivery"
            : "Online Payment";

    const itemsText = items
        .map(
            (item) =>
                `${item.name} x ${item.quantity} - ₹${Number(
                    item.subtotal
                ).toFixed(2)}`
        )
        .join("\n");

    const itemsHtml = items
        .map(
            (item) => `
                <tr>
                    <td style="
                        padding: 14px 0;
                        border-bottom: 1px solid #eeeeee;
                    ">
                        <div style="
                            font-size: 14px;
                            font-weight: 600;
                            color: #111111;
                        ">
                            ${item.name}
                        </div>

                        <div style="
                            margin-top: 4px;
                            font-size: 12px;
                            color: #888888;
                        ">
                            SKU: ${item.sku || "-"}
                        </div>
                    </td>

                    <td
                        align="center"
                        style="
                            padding: 14px 8px;
                            border-bottom: 1px solid #eeeeee;
                            font-size: 13px;
                            color: #555555;
                        "
                    >
                        ${item.quantity}
                    </td>

                    <td
                        align="right"
                        style="
                            padding: 14px 0;
                            border-bottom: 1px solid #eeeeee;
                            font-size: 14px;
                            font-weight: 600;
                            color: #111111;
                            white-space: nowrap;
                        "
                    >
                        ₹${Number(item.subtotal).toFixed(2)}
                    </td>
                </tr>
            `
        )
        .join("");

    const addressHtml = `
        ${shippingAddress.name || name}<br>
        ${shippingAddress.addressLine1 || ""}<br>

        ${shippingAddress.addressLine2
            ? `${shippingAddress.addressLine2}<br>`
            : ""
        }

        ${shippingAddress.city || ""},
        ${shippingAddress.state || ""} -
        ${shippingAddress.postalCode || ""}<br>

        ${shippingAddress.country || "India"}<br>

        Phone: ${shippingAddress.phone || "-"}
    `;

    const addressText = [
        shippingAddress.name || name,
        shippingAddress.addressLine1,
        shippingAddress.addressLine2,
        `${shippingAddress.city || ""}, ${shippingAddress.state || ""
        } - ${shippingAddress.postalCode || ""}`,
        shippingAddress.country || "India",
        `Phone: ${shippingAddress.phone || "-"}`,
    ]
        .filter(Boolean)
        .join("\n");

    return {
        subject: `New Order ${orderNumber} — Kamvasna Admin`,

        text: `
${statusSubject.toUpperCase()}
==============================

A new order has been placed on Kamvasna.

ORDER DETAILS
------------------------------
Order Number: ${orderNumber}
Order Date: ${formattedDate}

CUSTOMER
------------------------------
Name: ${name}
Email: ${customerEmail || "-"}
Phone: ${shippingAddress.phone || "-"}

PAYMENT
------------------------------
Payment Method: ${formattedPaymentMethod}
Payment Status: ${paymentStatus}
Order Status: ${orderStatus}

ITEMS
------------------------------
${itemsText}

ORDER SUMMARY
------------------------------
Subtotal: ₹${Number(subtotal).toFixed(2)}
Shipping: ₹${Number(shippingAmount).toFixed(2)}
Discount: ₹${Number(discountAmount).toFixed(2)}
Total: ₹${Number(totalAmount).toFixed(2)}

SHIPPING ADDRESS
------------------------------
${addressText}

Please log in to the admin panel to process this order.

Regards,
Kamvasna Admin
${BRAND_URL}
        `.trim(),

        html: `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>
        New Order — Kamvasna Admin
    </title>
</head>

<body style="
    margin: 0;
    padding: 0;
    background-color: #f4f4f4;
    font-family: Arial, Helvetica, sans-serif;
    color: #111111;
">

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="background-color:#f4f4f4;"
>
    <tr>
        <td
            align="center"
            style="padding:40px 15px;"
        >

            <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                    max-width:600px;
                    background-color:#ffffff;
                    border-radius:16px;
                    overflow:hidden;
                    box-shadow:0 8px 30px rgba(0,0,0,0.08);
                "
            >

                <!-- Header -->

                <tr>
                    <td
                        align="center"
                        style="
                            background-color:#000000;
                            padding:28px 30px;
                        "
                    >

                        <div style="
                            font-size:30px;
                            font-weight:800;
                            letter-spacing:-1px;
                            color:#ffffff;
                        ">
                            Kam
                            <span style="color:#e50914;">
                                vasna
                            </span>
                        </div>

                        <div style="
                            margin-top:6px;
                            color:#bdbdbd;
                            font-size:12px;
                            letter-spacing:1px;
                            text-transform:uppercase;
                        ">
                            Admin Order Notification
                        </div>

                    </td>
                </tr>

                <!-- Red Accent -->

                <tr>
                    <td style="
                        height:4px;
                        background-color:#e50914;
                        font-size:0;
                        line-height:0;
                    ">
                        &nbsp;
                    </td>
                </tr>

                <!-- Content -->

                <tr>
                    <td style="padding:42px 40px;">

                        <!-- Badge -->

                        <div style="
                            display:inline-block;
                            padding:7px 12px;
                            background-color:#fff1f2;
                            color:#e50914;
                            border-radius:20px;
                            font-size:12px;
                            font-weight:700;
                        ">
                            NEW ORDER
                        </div>

                        <h1 style="
                            margin:18px 0 10px;
                            font-size:26px;
                            line-height:1.3;
                            color:#111111;
                        ">
                            New order received
                        </h1>

                        <p style="
                            margin:0 0 25px;
                            font-size:15px;
                            line-height:1.7;
                            color:#555555;
                        ">
                            A new order has been placed on
                            <strong>Kamvasna</strong>.
                            Please review the order details
                            below and process it from the
                            admin panel.
                        </p>

                        <!-- Order Number -->

                        <div style="
                            margin-bottom:25px;
                            padding:20px;
                            background-color:#fff7f7;
                            border:1px solid #f1d5d5;
                            border-radius:10px;
                        ">

                            <div style="
                                font-size:11px;
                                font-weight:700;
                                letter-spacing:1.3px;
                                color:#888888;
                                text-transform:uppercase;
                            ">
                                Order Number
                            </div>

                            <div style="
                                margin-top:7px;
                                font-size:21px;
                                font-weight:800;
                                color:#e50914;
                            ">
                                ${orderNumber}
                            </div>

                            <div style="
                                margin-top:6px;
                                font-size:12px;
                                color:#888888;
                            ">
                                ${formattedDate}
                            </div>

                        </div>

                        <!-- Customer -->

                        <h2 style="
                            margin:0 0 14px;
                            font-size:17px;
                            color:#111111;
                        ">
                            Customer Details
                        </h2>

                        <div style="
                            padding:18px 20px;
                            background-color:#fafafa;
                            border:1px solid #eeeeee;
                            border-radius:10px;
                            font-size:13px;
                            line-height:1.8;
                            color:#555555;
                        ">

                            <strong style="color:#111111;">
                                ${name}
                            </strong>

                            <br>

                            Email:
                            ${customerEmail || "-"}

                            <br>

                            Phone:
                            ${shippingAddress.phone || "-"}

                        </div>

                        <!-- Payment / Status -->

                        <table
                            width="100%"
                            cellpadding="0"
                            cellspacing="0"
                            border="0"
                            style="
                                margin-top:25px;
                                margin-bottom:30px;
                            "
                        >
                            <tr>

                                <td
                                    width="50%"
                                    style="padding-right:6px;"
                                >

                                    <div style="
                                        padding:15px;
                                        background-color:#fafafa;
                                        border:1px solid #eeeeee;
                                        border-radius:8px;
                                    ">

                                        <div style="
                                            font-size:11px;
                                            color:#888888;
                                            text-transform:uppercase;
                                            font-weight:700;
                                        ">
                                            Payment
                                        </div>

                                        <div style="
                                            margin-top:6px;
                                            font-size:13px;
                                            font-weight:700;
                                            color:#111111;
                                        ">
                                            ${formattedPaymentMethod}
                                        </div>

                                        <div style="
                                            margin-top:4px;
                                            font-size:12px;
                                            color:${paymentStatus === "PAID"
                ? "#16a34a"
                : "#777777"
            };
                                        ">
                                            ${paymentStatus}
                                        </div>

                                    </div>

                                </td>

                                <td
                                    width="50%"
                                    style="padding-left:6px;"
                                >

                                    <div style="
                                        padding:15px;
                                        background-color:#fafafa;
                                        border:1px solid #eeeeee;
                                        border-radius:8px;
                                    ">

                                        <div style="
                                            font-size:11px;
                                            color:#888888;
                                            text-transform:uppercase;
                                            font-weight:700;
                                        ">
                                            Order Status
                                        </div>

                                        <div style="
                                            margin-top:6px;
                                            font-size:13px;
                                            font-weight:700;
                                            color:#111111;
                                        ">
                                            ${orderStatus}
                                        </div>

                                    </div>

                                </td>

                            </tr>
                        </table>

                        <!-- Items -->

                        <h2 style="
                            margin:0 0 14px;
                            font-size:17px;
                            color:#111111;
                        ">
                            Ordered Products
                        </h2>

                        <table
                            width="100%"
                            cellpadding="0"
                            cellspacing="0"
                            border="0"
                            style="
                                border-top:1px solid #eeeeee;
                            "
                        >

                            <thead>

                                <tr>

                                    <th
                                        align="left"
                                        style="
                                            padding:12px 0;
                                            font-size:11px;
                                            color:#888888;
                                            text-transform:uppercase;
                                        "
                                    >
                                        Product
                                    </th>

                                    <th
                                        align="center"
                                        style="
                                            padding:12px 8px;
                                            font-size:11px;
                                            color:#888888;
                                            text-transform:uppercase;
                                        "
                                    >
                                        Qty
                                    </th>

                                    <th
                                        align="right"
                                        style="
                                            padding:12px 0;
                                            font-size:11px;
                                            color:#888888;
                                            text-transform:uppercase;
                                        "
                                    >
                                        Amount
                                    </th>

                                </tr>

                            </thead>

                            <tbody>
                                ${itemsHtml}
                            </tbody>

                        </table>

                        <!-- Summary -->

                        <div style="
                            margin-top:25px;
                            padding:20px;
                            background-color:#fafafa;
                            border-radius:10px;
                        ">

                            <table
                                width="100%"
                                cellpadding="0"
                                cellspacing="0"
                                border="0"
                            >

                                <tr>

                                    <td style="
                                        padding:5px 0;
                                        font-size:14px;
                                        color:#666666;
                                    ">
                                        Subtotal
                                    </td>

                                    <td
                                        align="right"
                                        style="
                                            padding:5px 0;
                                            font-size:14px;
                                        "
                                    >
                                        ₹${Number(subtotal).toFixed(2)}
                                    </td>

                                </tr>

                                <tr>

                                    <td style="
                                        padding:5px 0;
                                        font-size:14px;
                                        color:#666666;
                                    ">
                                        Shipping
                                    </td>

                                    <td
                                        align="right"
                                        style="
                                            padding:5px 0;
                                            font-size:14px;
                                        "
                                    >
                                        ₹${Number(
                shippingAmount
            ).toFixed(2)}
                                    </td>

                                </tr>

                                <tr>

                                    <td style="
                                        padding:5px 0;
                                        font-size:14px;
                                        color:#666666;
                                    ">
                                        Discount
                                    </td>

                                    <td
                                        align="right"
                                        style="
                                            padding:5px 0;
                                            font-size:14px;
                                            color:#16a34a;
                                        "
                                    >
                                        - ₹${Number(
                discountAmount
            ).toFixed(2)}
                                    </td>

                                </tr>

                                <tr>

                                    <td
                                        colspan="2"
                                        style="
                                            padding-top:12px;
                                            border-top:1px solid #dddddd;
                                        "
                                    >
                                    </td>

                                </tr>

                                <tr>

                                    <td style="
                                        font-size:17px;
                                        font-weight:800;
                                    ">
                                        Total
                                    </td>

                                    <td
                                        align="right"
                                        style="
                                            font-size:19px;
                                            font-weight:800;
                                            color:#e50914;
                                        "
                                    >
                                        ₹${Number(
                totalAmount
            ).toFixed(2)}
                                    </td>

                                </tr>

                            </table>

                        </div>

                        <!-- Shipping -->

                        <h2 style="
                            margin:30px 0 14px;
                            font-size:17px;
                            color:#111111;
                        ">
                            Shipping Address
                        </h2>

                        <div style="
                            padding:18px 20px;
                            background-color:#fafafa;
                            border:1px solid #eeeeee;
                            border-radius:10px;
                            font-size:13px;
                            line-height:1.7;
                            color:#555555;
                        ">
                            ${addressHtml}
                        </div>

                        <!-- CTA -->

                        <div style="
                            margin-top:30px;
                            text-align:center;
                        ">

                            <a
                                href="${BRAND_URL}/admin/orders"
                                style="
                                    display:inline-block;
                                    padding:13px 24px;
                                    background-color:#000000;
                                    color:#ffffff;
                                    border-radius:8px;
                                    font-size:13px;
                                    font-weight:700;
                                    text-decoration:none;
                                "
                            >
                                View Order in Admin
                            </a>

                        </div>

                    </td>
                </tr>

                <!-- Footer -->

                <tr>

                    <td style="
                        background-color:#111111;
                        padding:28px 40px;
                        text-align:center;
                    ">

                        <div style="
                            font-size:18px;
                            font-weight:700;
                            color:#ffffff;
                        ">
                            Kam
                            <span style="color:#e50914;">
                                vasna
                            </span>
                        </div>

                        <p style="
                            margin:10px 0;
                            font-size:12px;
                            color:#999999;
                        ">
                            Admin Order Notification
                        </p>

                        <a
                            href="${BRAND_URL}"
                            style="
                                color:#e50914;
                                font-size:12px;
                                text-decoration:none;
                                font-weight:600;
                            "
                        >
                            kamvasna.shop
                        </a>

                    </td>

                </tr>

            </table>

        </td>
    </tr>
</table>

</body>
</html>
        `.trim(),
    };
};

module.exports = {
    verificationOTPTemplate,
    loginOTPTemplate,
    passwordResetOTPTemplate,
    orderReceivedTemplate,
    orderStatusUpdateTemplate,
    orderReceivedTemplateAdmin,
};