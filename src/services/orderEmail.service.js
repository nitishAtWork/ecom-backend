const {
    sendEmail,
} = require("./email.service");

const BRAND_URL = (
    process.env.BRAND_URL
).replace(/\/+$/, "");

const {
    orderReceivedTemplate,
    orderStatusUpdateTemplate,
    orderReceivedTemplateAdmin,
} = require("./emailTemplates");

const sendOrderReceivedEmailServ = async ({
    email,
    name,
    order,
}) => {
    if (!email) {
        throw new Error(
            "Customer email is required."
        );
    }

    if (!order) {
        throw new Error(
            "Order details are required."
        );
    }

    const emailTemplate =
        orderReceivedTemplate({
            name,

            orderNumber:
                order.orderNumber,

            items:
                order.items,

            subtotal:
                order.subtotal,

            shippingAmount:
                order.shippingAmount,

            discountAmount:
                order.discountAmount,

            totalAmount:
                order.totalAmount,

            paymentMethod:
                order.paymentMethod,

            paymentStatus:
                order.paymentStatus,

            orderStatus:
                order.orderStatus,

            shippingAddress:
                order.shippingAddress,

            createdAt:
                order.createdAt,
        });

    await sendEmail({
        to: email,

        subject:
            emailTemplate.subject,

        text:
            emailTemplate.text,

        html:
            emailTemplate.html,
    });

    return {
        success: true,

        orderNumber:
            order.orderNumber,
    };
};

const sendAdminNewOrderEmail = async ({
    order,
    customer,
}) => {
    const adminEmail =
        process.env.ADMIN_ORDER_EMAIL;

    if (!adminEmail) {
        console.warn(
            "ADMIN_ORDER_EMAIL is not configured."
        );

        return;
    }

    const emailTemplate =
        orderReceivedTemplateAdmin({
            name:
                order.shippingAddress?.name ||
                customer?.name ||
                "Customer",

            customerEmail:
                customer?.email || "",

            orderNumber:
                order.orderNumber,

            items:
                order.items,

            subtotal:
                order.subtotal,

            shippingAmount:
                order.shippingAmount,

            discountAmount:
                order.discountAmount,

            totalAmount:
                order.totalAmount,

            paymentMethod:
                order.paymentMethod,

            paymentStatus:
                order.paymentStatus,

            orderStatus:
                order.orderStatus,

            shippingAddress:
                order.shippingAddress,

            createdAt:
                order.createdAt,
        });

    await sendEmail({
        to: adminEmail,
        subject: emailTemplate.subject,
        text: emailTemplate.text,
        html: emailTemplate.html,
    });

    console.log(
        `New order notification sent to admin: ${order.orderNumber}`
    );
};

const sendOrderStatusUpdateEmailServ = async ({
    email,
    name,
    order,
    previousOrderStatus,
}) => {
    if (!email) {
        throw new Error("Customer email is required.");
    }

    if (!order) {
        throw new Error("Order details are required.");
    }

    const emailTemplate = orderStatusUpdateTemplate({
        name,
        orderNumber: order.orderNumber,
        items: order.items,
        subtotal: order.subtotal,
        shippingAmount: order.shippingAmount,
        discountAmount: order.discountAmount,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        previousOrderStatus,
        shippingAddress: order.shippingAddress,
        createdAt: order.createdAt,
    });

    await sendEmail({
        to: email,
        subject: emailTemplate.subject,
        text: emailTemplate.text,
        html: emailTemplate.html,
    });

    console.log(
        `Order status email sent: ${order.orderNumber} → ${order.orderStatus}`
    );

    return {
        success: true,
        orderNumber: order.orderNumber,
        orderStatus: order.orderStatus,
    };
};


/* ==========================================
   ONLINE PAYMENT SUCCESS EMAIL TEMPLATE
========================================== */

const escapePaymentEmailHtml = (value = "") =>
    String(value).replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
    })[character]);

const paymentSuccessTemplate = ({
    name = "Customer",
    order,
    isAdmin = false,
}) => {
    const orderNumber = escapePaymentEmailHtml(
        order.orderNumber
    );

    const customerName = escapePaymentEmailHtml(name);

    const amount = Number(order.totalAmount || 0).toLocaleString(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2,
        }
    );

    const orderDate = new Date(
        order.paymentPaidAt || order.createdAt || Date.now()
    ).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    const items = (order.items || [])
        .map((item) => {
            const itemName = escapePaymentEmailHtml(item.name);
            const quantity = Number(item.quantity || 0);
            const itemTotal = Number(item.subtotal || 0).toLocaleString(
                "en-IN",
                {
                    style: "currency",
                    currency: "INR",
                    minimumFractionDigits: 2,
                }
            );

            return {
                text: `${item.name} x ${quantity} — ${itemTotal}`,
                html: `
                    <tr>
                        <td style="padding:12px 0;border-bottom:1px solid #eee;color:#222;">
                            ${itemName}
                        </td>
                        <td align="center" style="padding:12px 6px;border-bottom:1px solid #eee;color:#555;">
                            ${quantity}
                        </td>
                        <td align="right" style="padding:12px 0;border-bottom:1px solid #eee;color:#222;font-weight:600;white-space:nowrap;">
                            ${itemTotal}
                        </td>
                    </tr>
                `,
            };
        });

    const itemsText = items.map((item) => item.text).join("\n");
    const itemsHtml = items.map((item) => item.html).join("");

    const title = isAdmin
        ? "Online payment received"
        : "Payment successful!";

    const message = isAdmin
        ? `Payment has been confirmed for order ${orderNumber}.`
        : "Your online payment has been received successfully. Your order is now confirmed.";

    const subject = isAdmin
        ? `Payment Received — Order ${order.orderNumber} — Kamvasna`
        : `Payment Successful — Order ${order.orderNumber} — Kamvasna`;

    return {
        subject,

        text: `
${title}

Hello ${name},

${message}

Order Number: ${order.orderNumber}
Payment Status: PAID
Order Status: ${order.orderStatus}
Payment Method: Online Payment
Amount Paid: ${amount}
Payment Date: ${orderDate}

ORDER ITEMS
${itemsText}

Subtotal: ₹${Number(order.subtotal || 0).toFixed(2)}
Shipping: ₹${Number(order.shippingAmount || 0).toFixed(2)}
Discount: ₹${Number(order.discountAmount || 0).toFixed(2)}
Total Paid: ${amount}

${BRAND_URL}

Thank you,
Kamvasna
        `.trim(),

        html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>${title} — Kamvasna</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;color:#111;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;">
        <tr>
            <td align="center" style="padding:32px 12px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                    style="max-width:600px;background:#fff;border-radius:14px;overflow:hidden;">

                    <tr>
                        <td align="center" style="padding:28px;background:#000;">
                            <div style="font-size:29px;font-weight:800;color:#fff;">
                                Kam<span style="color:#e50914;">vasna</span>
                            </div>
                            <div style="margin-top:7px;color:#bbb;font-size:11px;letter-spacing:1px;">
                                ${isAdmin ? "PAYMENT NOTIFICATION" : "PAYMENT CONFIRMATION"}
                            </div>
                        </td>
                    </tr>

                    <tr>
                        <td style="height:4px;background:#e50914;font-size:0;">&nbsp;</td>
                    </tr>

                    <tr>
                        <td style="padding:32px 28px;">
                            <div style="display:inline-block;padding:7px 12px;background:#eafaf0;color:#15803d;border-radius:20px;font-size:12px;font-weight:700;">
                                PAYMENT SUCCESSFUL
                            </div>

                            <h1 style="margin:18px 0 10px;font-size:25px;line-height:1.3;">
                                ${title}
                            </h1>

                            <p style="font-size:14px;line-height:1.7;color:#555;">
                                Hello ${customerName},<br><br>
                                ${message}
                            </p>

                            <div style="margin:24px 0;padding:20px;background:#fafafa;border:1px solid #eee;border-radius:10px;">
                                <div style="font-size:11px;color:#888;font-weight:700;letter-spacing:1px;">
                                    ORDER NUMBER
                                </div>
                                <div style="margin-top:7px;font-size:20px;font-weight:800;color:#e50914;">
                                    ${orderNumber}
                                </div>
                                <div style="margin-top:8px;font-size:12px;color:#777;">
                                    ${escapePaymentEmailHtml(orderDate)}
                                </div>
                                <div style="margin-top:18px;font-size:12px;color:#777;">
                                    AMOUNT PAID
                                </div>
                                <div style="margin-top:5px;font-size:25px;font-weight:800;color:#111;">
                                    ${amount}
                                </div>
                            </div>

                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                                style="margin-bottom:24px;">
                                <tr>
                                    <td style="padding:12px;background:#fafafa;border:1px solid #eee;">
                                        <div style="font-size:11px;color:#888;">PAYMENT STATUS</div>
                                        <div style="margin-top:5px;font-size:13px;font-weight:700;color:#15803d;">PAID</div>
                                    </td>
                                    <td style="padding:12px;background:#fafafa;border:1px solid #eee;">
                                        <div style="font-size:11px;color:#888;">ORDER STATUS</div>
                                        <div style="margin-top:5px;font-size:13px;font-weight:700;">
                                            ${escapePaymentEmailHtml(order.orderStatus)}
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <h2 style="font-size:17px;margin:0 0 12px;">Order Items</h2>
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <thead>
                                    <tr>
                                        <th align="left" style="padding:10px 0;font-size:11px;color:#888;">PRODUCT</th>
                                        <th align="center" style="padding:10px 6px;font-size:11px;color:#888;">QTY</th>
                                        <th align="right" style="padding:10px 0;font-size:11px;color:#888;">AMOUNT</th>
                                    </tr>
                                </thead>
                                <tbody>${itemsHtml}</tbody>
                            </table>

                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                                style="margin-top:20px;background:#fafafa;">
                                <tr>
                                    <td style="padding:8px 14px;color:#666;">Subtotal</td>
                                    <td align="right" style="padding:8px 14px;">₹${Number(order.subtotal || 0).toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td style="padding:8px 14px;color:#666;">Shipping</td>
                                    <td align="right" style="padding:8px 14px;">₹${Number(order.shippingAmount || 0).toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td style="padding:8px 14px;color:#666;">Discount</td>
                                    <td align="right" style="padding:8px 14px;">− ₹${Number(order.discountAmount || 0).toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td style="padding:14px;font-weight:800;border-top:1px solid #ddd;">Total Paid</td>
                                    <td align="right" style="padding:14px;font-weight:800;font-size:18px;color:#e50914;border-top:1px solid #ddd;">${amount}</td>
                                </tr>
                            </table>

                            ${isAdmin
                ? ""
                : `<div style="margin-top:25px;text-align:center;">
                                        <a href="${BRAND_URL}/account/orders"
                                            style="display:inline-block;padding:13px 22px;background:#000;color:#fff;border-radius:7px;text-decoration:none;font-weight:700;font-size:13px;">
                                            View My Orders
                                        </a>
                                    </div>`
            }

                            <p style="margin:26px 0 0;font-size:13px;line-height:1.7;color:#666;">
                                ${isAdmin
                ? "This is an automated notification for an online payment confirmed by the payment provider."
                : "Thank you for choosing Kamvasna. We will keep you informed as your order progresses."}
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="padding:24px;background:#111;color:#aaa;font-size:12px;">
                            <strong style="font-size:18px;color:#fff;">
                                Kam<span style="color:#e50914;">vasna</span>
                            </strong>
                            <p style="margin:9px 0 0;">Thank you for shopping with us.</p>
                            <a href="${BRAND_URL}" style="display:inline-block;margin-top:8px;color:#e50914;text-decoration:none;">
                                Kamvasna
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


/* ==========================================
   CUSTOMER PAYMENT SUCCESS EMAIL SERVICE
========================================== */

const sendPaymentSuccessEmailServ = async ({
    email,
    name,
    order,
}) => {
    if (!email) {
        throw new Error("Customer email is required.");
    }

    if (!order) {
        throw new Error("Order details are required.");
    }

    const template = paymentSuccessTemplate({
        name: name || "Customer",
        order,
        isAdmin: false,
    });

    await sendEmail({
        to: email,
        subject: template.subject,
        text: template.text,
        html: template.html,
    });

    console.log(
        `Payment success email sent: ${order.orderNumber} → ${email}`
    );
};


/* ==========================================
   ADMIN PAYMENT SUCCESS EMAIL SERVICE
========================================== */

const sendAdminPaymentSuccessEmailServ = async ({
    order,
    customer,
}) => {
    const email = process.env.ADMIN_ORDER_EMAIL;

    if (!email) {
        throw new Error(
            "ADMIN_ORDER_EMAIL is not configured."
        );
    }

    const template = paymentSuccessTemplate({
        name:
            order.shippingAddress?.name ||
            customer?.name ||
            "Admin",
        order,
        isAdmin: true,
    });

    await sendEmail({
        to: email,
        subject: template.subject,
        text: template.text,
        html: template.html,
    });

    console.log(
        `Admin payment notification sent: ${order.orderNumber} → ${email}`
    );
};


module.exports = {
    sendOrderReceivedEmailServ,
    sendAdminNewOrderEmail,
    sendOrderStatusUpdateEmailServ,
    sendPaymentSuccessEmailServ,
    sendAdminPaymentSuccessEmailServ,
};