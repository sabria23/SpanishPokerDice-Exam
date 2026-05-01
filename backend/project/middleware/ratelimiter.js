import rateLimit from "express-rate-limit";
// Rate limiting middleware to prevent API abuse
// Uses express-rate-limit to limit the number of requests per IP
// Reference: https://www.npmjs.com/package/express-rate-limit

// General rate limiter for all API router
// Allows 100 requests per 15 minutes per IP
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Max requests per window
    message: { msg: "Too many requests, please try again later" },
    standardHeaders: true, // Sends rate limit info in the RateLimit-* headers
    legacyHeaders: false // Disables the X-RateLimit-* headers, avoids duplicates
});

// Stricter rate limiter for auth routes, prevents brute force attacks on passwords
// Allows 10 requests per 15 minutes per IP
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: { msg: "Too many login attempts, please try again later" },
    standardHeaders: true,
    legacyHeaders: false
});

// Rate limiter for matchmaking, prevents users from spamming the matchmaking queue
// Allows 30 requests per minute per IP
export const matchmakeLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30,
    message: { msg: "Too many matchmaking requests, please try again later" },
    standardHeaders: true,
    legacyHeaders: false
});
