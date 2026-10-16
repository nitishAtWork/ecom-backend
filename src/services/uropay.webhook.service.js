
const crypto = require("crypto");

const API_KEY = process.env.UROPAY_API_KEY;
const API_SECRET = process.env.UROPAY_API_SECRET;

const verifyUroPayWebhook = ({ headers, rawBody }) => {
    if (!API_KEY || !API_SECRET || !Buffer.isBuffer(rawBody)) {
        return false;
    }

    const apiKey = headers["x-api-key"];
    const timestamp = headers["x-timestamp"];
    const nonce = headers["x-nonce"];
    const actualSignature = headers["x-signature"];

    if (
        apiKey !== API_KEY ||
        typeof timestamp !== "string" ||
        !/^\d{10}$/.test(timestamp) ||
        typeof nonce !== "string" ||
        nonce.length === 0 ||
        nonce.length > 200 ||
        typeof actualSignature !== "string" ||
        !/^[a-f0-9]{64}$/i.test(actualSignature)
    ) {
        return false;
    }

    // Reject stale or future-dated webhook signatures.
    const timestampSeconds = Number(timestamp);
    const nowSeconds = Math.floor(Date.now() / 1000);

    if (
        nowSeconds - timestampSeconds > 300 ||
        timestampSeconds - nowSeconds > 30
    ) {
        return false;
    }

    // UroPai specifies /tenant-webhook for this signature,
    // irrespective of the configured public webhook URL.
    const canonical = [
        "POST",
        "/tenant-webhook",
        timestamp,
        nonce,
        "",
        rawBody.toString("utf8"),
    ].join("\n");

    const expectedSignature = crypto
        .createHmac("sha256", API_SECRET)
        .update(canonical)
        .digest();

    const suppliedSignature = Buffer.from(actualSignature, "hex");

    if (expectedSignature.length !== suppliedSignature.length) {
        return false;
    }

    return crypto.timingSafeEqual(
        expectedSignature,
        suppliedSignature
    );
};

module.exports = { verifyUroPayWebhook };
