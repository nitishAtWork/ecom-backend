const {
    createOTP,
} = require("./otp.service");

const {
    sendEmail,
} = require("./email.service");

const {
    verificationOTPTemplate,
    loginOTPTemplate,
    passwordResetOTPTemplate,
} = require("./emailTemplates");

const sendEmailVerificationOTP = async ({
    email,
    name,
}) => {

    const { otp, expiresAt } =
        await createOTP({
            email,
            purpose: "EMAIL_VERIFICATION",
        });

    const emailTemplate =
        verificationOTPTemplate({
            name,
            otp,
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
        expiresAt,
    };
};

const sendLoginOTP = async ({
    email,
    name,
}) => {

    const {
        otp,
        expiresAt,
    } = await createOTP({
        email,
        purpose: "LOGIN",
    });


    const emailTemplate =
        loginOTPTemplate({
            name,
            otp,
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
        expiresAt,
    };
};

const sendPasswordResetOTP = async ({
    email,
    name,
}) => {

    const {
        otp,
        expiresAt,
    } = await createOTP({
        email,
        purpose: "PASSWORD_RESET",
    });


    const emailTemplate =
        passwordResetOTPTemplate({
            name,
            otp,
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
        expiresAt,
    };
};

module.exports = {
    sendEmailVerificationOTP,
    sendLoginOTP,
    sendPasswordResetOTP,
};