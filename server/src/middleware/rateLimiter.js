const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter.
 * 100 requests per 15 minutes per IP.
 */
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    status: 'fail',
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
  keyGenerator: (req) => {
    return req.headers['x-forwarded-for'] || req.ip;
  },
});

/**
 * Strict rate limiter for authentication endpoints.
 * 5 requests per 15 minutes per IP.
 */
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    status: 'fail',
    message: 'Too many authentication attempts, please try again after 15 minutes',
  },
  keyGenerator: (req) => {
    return req.headers['x-forwarded-for'] || req.ip;
  },
  skipSuccessfulRequests: true,
});

/**
 * Rate limiter for file upload endpoints.
 * 20 uploads per 15 minutes per IP.
 */
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    status: 'fail',
    message: 'Too many file uploads, please try again later',
  },
});

module.exports = { apiLimiter, authLimiter, uploadLimiter };
