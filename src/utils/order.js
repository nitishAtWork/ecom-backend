const crypto = require("crypto");

const generateOrderNumber = () => {
    const date = new Date()
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, "");

    const randomPart = crypto
        .randomBytes(4)
        .toString("hex")
        .toUpperCase();

    return `ORD-${date}-${randomPart}`;
};

module.exports = {
    generateOrderNumber,
};