const crypto = require("crypto");
const Session = require("../models/Session");

const {
    generateRefreshToken,
    verifyRefreshToken,
} = require("../utils/token");

const REFRESH_TOKEN_DAYS = 7;

const hashRefreshToken = (token) => {
    return crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
};

const createSession = async ({
    user,
    userAgent,
    ipAddress,
}) => {
    const sessionId = new Session()._id;

    const refreshToken = generateRefreshToken(
        user,
        sessionId
    );

    const refreshTokenHash =
        hashRefreshToken(refreshToken);

    const expiresAt = new Date();

    expiresAt.setDate(
        expiresAt.getDate() + REFRESH_TOKEN_DAYS
    );

    await Session.create({
        _id: sessionId,
        user: user._id,
        refreshTokenHash,
        userAgent: userAgent || null,
        ipAddress: ipAddress || null,
        expiresAt,
    });

    return {
        refreshToken,
        expiresAt,
    };
};

const findSession = async (sessionId) => {
    return Session.findOne({
        _id: sessionId,
        revokedAt: null,
        expiresAt: {
            $gt: new Date(),
        },
    });
};

const rotateRefreshToken = async ({
    session,
    user,
}) => {
    const refreshToken = generateRefreshToken(
        user,
        session._id
    );

    const refreshTokenHash =
        hashRefreshToken(refreshToken);

    const expiresAt = new Date();

    expiresAt.setDate(
        expiresAt.getDate() + REFRESH_TOKEN_DAYS
    );

    session.refreshTokenHash = refreshTokenHash;
    session.expiresAt = expiresAt;
    session.lastUsedAt = new Date();

    await session.save();

    return {
        refreshToken,
        expiresAt,
    };
};

const revokeSession = async (sessionId) => {
    await Session.findByIdAndUpdate(
        sessionId,
        {
            revokedAt: new Date(),
        }
    );
};

const revokeAllUserSessions = async (userId) => {
    await Session.updateMany(
        {
            user: userId,
            revokedAt: null,
        },
        {
            revokedAt: new Date(),
        }
    );
};

const isRefreshTokenValid = (
    refreshToken,
    storedHash
) => {
    const incomingHash =
        hashRefreshToken(refreshToken);

    const incomingBuffer =
        Buffer.from(incomingHash, "hex");

    const storedBuffer =
        Buffer.from(storedHash, "hex");

    if (
        incomingBuffer.length !==
        storedBuffer.length
    ) {
        return false;
    }

    return crypto.timingSafeEqual(
        incomingBuffer,
        storedBuffer
    );
};

const revokeSessionByRefreshToken = async (
    refreshToken
) => {
    try {
        const decoded =
            verifyRefreshToken(refreshToken);

        await revokeSession(
            decoded.sessionId
        );
    } catch (error) {
        // Do not expose token verification details.
    }
};

const getUserSessions = async (userId) => {
    return Session.find({
        user: userId,
        revokedAt: null,
        expiresAt: {
            $gt: new Date(),
        },
    })
        .select(
            "_id userAgent ipAddress createdAt lastUsedAt expiresAt"
        )
        .sort({
            lastUsedAt: -1,
            createdAt: -1,
        })
        .lean();
};

module.exports = {
    createSession,
    findSession,
    rotateRefreshToken,
    revokeSession,
    revokeAllUserSessions,
    getUserSessions,
    hashRefreshToken,
    isRefreshTokenValid,
    revokeSessionByRefreshToken,
};