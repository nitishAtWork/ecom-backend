const crypto = require("crypto");

const API_KEY =
    process.env.UROPAY_API_KEY;

const API_SECRET =
    process.env.UROPAY_API_SECRET;

const verifyUroPayWebhook = ({
    headers,
    rawBody,
}) => {
    if (!API_SECRET) {
        return false;
    }

    /*
     * UroPay webhook canonical path.
     */
    const canonical = [
        "POST",
        "/tenant-webhook",
        headers["x-timestamp"],
        headers["x-nonce"],
        "",
        rawBody.toString("utf8"),
    ].join("\n");

    const expectedSignature =
        crypto
            .createHmac(
                "sha256",
                API_SECRET
            )
            .update(canonical)
            .digest("hex");

    const actualSignature =
        headers["x-signature"];

    if (
        !actualSignature ||
        !headers["x-api-key"]
    ) {
        return false;
    }

    if (
        headers["x-api-key"] !==
        API_KEY
    ) {
        return false;
    }

    const expectedBuffer =
        Buffer.from(
            expectedSignature,
            "hex"
        );

    const actualBuffer =
        Buffer.from(
            actualSignature,
            "hex"
        );

    if (
        expectedBuffer.length !==
        actualBuffer.length
    ) {
        return false;
    }

    return crypto.timingSafeEqual(
        expectedBuffer,
        actualBuffer
    );
};

module.exports = {
    verifyUroPayWebhook,
};