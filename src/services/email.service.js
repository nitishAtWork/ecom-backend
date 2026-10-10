const {
    transporter,
} = require("../config/mail");

const sendEmail = async ({
    to,
    subject,
    html,
    text,
}) => {
    try {
        const info = await transporter.sendMail({
            from: {
                name:
                    process.env.MAIL_FROM_NAME ||
                    "Kamvasna.Shop",

                address:
                    process.env.MAIL_FROM_EMAIL ||
                    process.env.SMTP_USER,
            },

            to,

            subject,

            text,

            html,
        });

        // console.log(
        //     `Email sent to ${to}: ${info.messageId}`
        // );

        return info;
    } catch (error) {
        console.error(
            `Failed to send email to ${to}:`,
            error.message
        );

        throw error;
    }
};

module.exports = {
    sendEmail,
};