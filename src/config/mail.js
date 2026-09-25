const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,

    secure:
        process.env.SMTP_SECURE === "true",

    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

const verifyMailConnection = async () => {
    try {
        await transporter.verify();

        console.log("SMTP server is ready");
    } catch (error) {
        console.error(
            "SMTP connection failed:",
            error.message
        );
    }
};

module.exports = {
    transporter,
    verifyMailConnection,
};