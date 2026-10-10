const {
    sendEmail,
} = require("./email.service");

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

module.exports = {
    sendOrderReceivedEmailServ,
    sendAdminNewOrderEmail,
    sendOrderStatusUpdateEmailServ
};