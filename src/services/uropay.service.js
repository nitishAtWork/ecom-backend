
const crypto = require("crypto");

const BASE_URL = (
    process.env.UROPAY_BASE_URL || "https://api.uropai.in"
).replace(/\/+$/, "");

const API_KEY = process.env.UROPAY_API_KEY;
const API_SECRET = process.env.UROPAY_API_SECRET;

const signRequest = ({ method, path, query = "", body = "" }) => {
    if (!API_KEY || !API_SECRET) {
        throw new Error("UroPai API credentials are not configured.");
    }

    const timestamp = String(Math.floor(Date.now() / 1000));
    const nonce = crypto.randomUUID();

    const canonical = [
        method.toUpperCase(),
        path,
        timestamp,
        nonce,
        query,
        body,
    ].join("\n");

    return {
        "X-Api-Key": API_KEY,
        "X-Timestamp": timestamp,
        "X-Nonce": nonce,
        "X-Signature": crypto
            .createHmac("sha256", API_SECRET)
            .update(canonical)
            .digest("hex"),
    };
};

const uropaiRequest = async (method, path, payload = null) => {
    const body = payload === null ? "" : JSON.stringify(payload);

    const headers = signRequest({
        method,
        path,
        query: "",
        body,
    });

    if (payload !== null) {
        headers["Content-Type"] = "application/json";
    }

    let response;

    try {
        response = await fetch(`${BASE_URL}${path}`, {
            method,
            headers,
            ...(payload !== null ? { body } : {}),
            signal: AbortSignal.timeout(15000),
        });
    } catch (cause) {
        const error = new Error(
            "Could not connect to UroPai. Payment status may need reconciliation."
        );
        error.statusCode = 502;
        error.cause = cause;
        throw error;
    }

    let result;

    try {
        result = await response.json();
    } catch {
        result = null;
    }

    if (
        !response.ok ||
        result?.status !== "success" ||
        !result?.data
    ) {
        const error = new Error(
            result?.message || "UroPai request failed."
        );

        error.statusCode = response.status || 502;
        error.providerResponse = result;
        throw error;
    }

    return result.data;
};

const createUroPayOrder = async ({
    tenantOrderRef,
    amount,
    customerEmail,
    customerPhone,
    returnUrl,
    webhookUrl,
}) => {
    if (
        typeof tenantOrderRef !== "string" ||
        !tenantOrderRef.trim()
    ) {
        throw new Error("A unique local order reference is required.");
    }

    if (!tenantOrderRef) {
        throw new Error("A unique local order reference is required.");
    }

    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        throw new Error("Payment amount must be greater than zero.");
    }

    const resolvedReturnUrl =
        returnUrl || process.env.UROPAY_RETURN_URL;

    const resolvedWebhookUrl =
        webhookUrl || process.env.UROPAY_WEBHOOK_URL;

    if (!resolvedReturnUrl || !resolvedWebhookUrl) {
        throw new Error(
            "UroPai return and webhook URLs must be configured."
        );
    }

    // UroPai documents HTTPS URLs for returnUrl and webhookUrl.
    for (const value of [resolvedReturnUrl, resolvedWebhookUrl]) {
        const parsed = new URL(value);

        if (parsed.protocol !== "https:") {
            throw new Error(
                "UroPai return and webhook URLs must use HTTPS."
            );
        }
    }

    const payload = {
        tenantOrderRef: tenantOrderRef.trim(),
        amount: Number(parsedAmount.toFixed(2)),
        currency: "INR",
        paymentMethods: ["upi"],
        ...(customerEmail ? { customerEmail } : {}),
        ...(customerPhone ? { customerPhone } : {}),
        metaData: {
            orderRef: tenantOrderRef.trim(),
        },
        returnUrl: resolvedReturnUrl,
        webhookUrl: resolvedWebhookUrl,
    };

    const data = await uropaiRequest("POST", "/v1/orders", payload);

    if (
        typeof data.id !== "string" ||
        !data.id ||
        typeof data.tenantOrderRef !== "string" ||
        !data.openUrl
    ) {
        const error = new Error(
            "UroPai returned an incomplete payment order."
        );
        error.statusCode = 502;
        throw error;
    }

    if (data.tenantOrderRef !== payload.tenantOrderRef) {
        throw new Error("UroPai returned a mismatched order reference.");
    }

    if (
        Number(data.amount) !== payload.amount ||
        data.currency !== "INR"
    ) {
        throw new Error("UroPai returned a mismatched amount or currency.");
    }

    return data;
};

const getUroPayOrder = async (orderId) => {
    if (
        typeof orderId !== "string" ||
        !/^[A-Za-z0-9_-]+$/.test(orderId)
    ) {
        throw new Error("Invalid UroPai provider order ID.");
    }

    return uropaiRequest(
        "GET",
        `/v1/orders/${encodeURIComponent(orderId)}`
    );
};

module.exports = {
    createUroPayOrder,
    getUroPayOrder,
};
