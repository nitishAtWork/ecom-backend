const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const OTPVerification = require("../models/OTPVerification");

const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;

/**
 * Generate a 6 digit OTP
 */
const generateOTP = () => {
    return crypto.randomInt(100000, 1000000).toString();
};

/**
 * Hash OTP before storing it in database
 */
const hashOTP = async (otp) => {
    return bcrypt.hash(otp, 10);
};

/**
 * Verify OTP against stored hash
 */
const compareOTP = async (otp, otpHash) => {
    return bcrypt.compare(otp, otpHash);
};

/**
 * Create and store OTP
 */
const createOTP = async ({ email, purpose }) => {
    email = email.toLowerCase().trim();

    /*
     * Check if another OTP was recently generated.
     */
    const recentOTP = await OTPVerification.findOne({
        email,
        purpose,
        createdAt: {
            $gte: new Date(
                Date.now() - RESEND_COOLDOWN_SECONDS * 1000
            ),
        },
    });

    if (recentOTP) {
        const secondsPassed = Math.floor(
            (Date.now() - recentOTP.createdAt.getTime()) / 1000
        );

        const remainingSeconds =
            RESEND_COOLDOWN_SECONDS - secondsPassed;

        const error = new Error(
            `Please wait ${remainingSeconds} seconds before requesting another OTP.`
        );

        error.statusCode = 429;

        throw error;
    }

    /*
     * Invalidate any previous unused OTP
     * for the same email and purpose.
     */
    await OTPVerification.deleteMany({
        email,
        purpose,
        verifiedAt: null,
    });

    /*
     * Generate OTP
     */
    const otp = generateOTP();

    /*
     * Hash OTP
     */
    const otpHash = await hashOTP(otp);

    /*
     * Expiration time
     */
    const expiresAt = new Date(
        Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
    );

    /*
     * Save OTP
     */
    await OTPVerification.create({
        email,
        otpHash,
        purpose,
        expiresAt,
    });

    /*
     * Return plain OTP to the caller.
     *
     * Important:
     * We will NOT store this value in MongoDB.
     */
    return {
        otp,
        expiresAt,
    };
};

/**
 * Verify OTP
 */
const verifyOTP = async ({ email, otp, purpose }) => {
    email = email.toLowerCase().trim();

    const otpRecord = await OTPVerification.findOne({
        email,
        purpose,
        verifiedAt: null,
    }).sort({
        createdAt: -1,
    });

    if (!otpRecord) {
        const error = new Error(
            "OTP not found or already used."
        );

        error.statusCode = 400;

        throw error;
    }

    /*
     * Check expiration
     */
    if (otpRecord.expiresAt < new Date()) {
        await OTPVerification.deleteOne({
            _id: otpRecord._id,
        });

        const error = new Error("OTP has expired.");

        error.statusCode = 400;

        throw error;
    }

    /*
     * Check maximum attempts
     */
    if (otpRecord.attempts >= MAX_ATTEMPTS) {
        await OTPVerification.deleteOne({
            _id: otpRecord._id,
        });

        const error = new Error(
            "Maximum OTP attempts exceeded."
        );

        error.statusCode = 429;

        throw error;
    }

    /*
     * Check OTP
     */
    const isValid = await compareOTP(
        otp,
        otpRecord.otpHash
    );

    if (!isValid) {
        otpRecord.attempts += 1;

        await otpRecord.save();

        const remainingAttempts =
            MAX_ATTEMPTS - otpRecord.attempts;

        const error = new Error(
            `Invalid OTP. ${remainingAttempts} attempts remaining.`
        );

        error.statusCode = 400;

        throw error;
    }

    /*
     * Mark OTP as verified
     */
    otpRecord.verifiedAt = new Date();

    await otpRecord.save();

    return true;
};

module.exports = {
    createOTP,
    verifyOTP,
};