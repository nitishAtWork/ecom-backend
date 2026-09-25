const crypto = require("crypto");

const BASE_URL =
    process.env.UROPAY_BASE_URL ||
    "https://api.uropai.in";

const API_KEY =
    process.env.UROPAY_API_KEY;

const API_SECRET =
    process.env.UROPAY_API_SECRET;

const signRequest = ({
    method,
    path,
    query = "",
    body = "",
}) => {
    if (!API_KEY || !API_SECRET) {
        throw new Error(
            "UroPay credentials are not configured."
        );
    }

    const timestamp =
        String(
            Math.floor(
                Date.now() / 1000
            )
        );

    const nonce =
        crypto.randomUUID();

    /*
     * UroPay requires EXACTLY:
     *
     * method
     * path
     * timestamp
     * nonce
     * query
     * rawBody
     */
    const canonical = [
        method,
        path,
        timestamp,
        nonce,
        query,
        body,
    ].join("\n");

    const signature =
        crypto
            .createHmac(
                "sha256",
                API_SECRET
            )
            .update(canonical)
            .digest("hex");

    return {
        "X-Api-Key": API_KEY,
        "X-Timestamp": timestamp,
        "X-Nonce": nonce,
        "X-Signature": signature,
    };
};

/*
 * Create UroPay payment order.
 */
const createUroPayOrder = async ({
    tenantOrderRef,
    amount,
    customerEmail,
    customerPhone,
    returnUrl,
    webhookUrl,
}) => {
    const path = "/v1/orders";

    const bodyObject = {
        tenantOrderRef,
        amount,
        currency: "INR",

        paymentMethods: [
            "upi",
        ],

        customerEmail,
        customerPhone,

        metaData: {
            orderRef:
                tenantOrderRef,
        },

        returnUrl:
            returnUrl ||
            process.env.UROPAY_RETURN_URL,

        webhookUrl:
            webhookUrl ||
            process.env.UROPAY_WEBHOOK_URL,
    };

    /*
     * IMPORTANT:
     * Sign the EXACT raw JSON string
     * that is sent in fetch().
     */
    const body =
        JSON.stringify(bodyObject);

    const headers = {
        ...signRequest({
            method: "POST",
            path,
            query: "",
            body,
        }),

        "Content-Type":
            "application/json",
    };

    const response =
        await fetch(
            `${BASE_URL}${path}`,
            {
                method: "POST",
                headers,
                body,
            }
        );

    const result =
        await response.json();

    if (!response.ok) {
        const error =
            new Error(
                result?.message ||
                "Unable to create UroPay payment."
            );

        error.statusCode =
            response.status;

        error.providerResponse =
            result;

        throw error;
    }

    if (
        !result?.data?.id ||
        !result?.data?.openUrl
    ) {
        const error =
            new Error(
                "Invalid response received from UroPay."
            );

        error.statusCode = 502;

        error.providerResponse =
            result;

        throw error;
    }

    return result.data;
};

/*
 * Get authoritative UroPay order status.
 */
const getUroPayOrder =
    async (orderId) => {
        const path =
            `/v1/orders/${orderId}`;

        const headers =
            signRequest({
                method: "GET",
                path,
                query: "",
                body: "",
            });

        const response =
            await fetch(
                `${BASE_URL}${path}`,
                {
                    method: "GET",
                    headers,
                }
            );

        const result =
            await response.json();

        if (!response.ok) {
            const error =
                new Error(
                    result?.message ||
                    "Unable to get UroPay order status."
                );

            error.statusCode =
                response.status;

            error.providerResponse =
                result;

            throw error;
        }

        return result.data;
    };

module.exports = {
    createUroPayOrder,
    getUroPayOrder,
};