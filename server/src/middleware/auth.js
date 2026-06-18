const { verifyAccessToken } = require('../utils/generateToken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

/**
 * Middleware to authenticate requests using JWT access token.
 * Extracts token from Authorization header (Bearer scheme).
 * Attaches the user object to req.user.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Access token is required');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw ApiError.unauthorized('Access token is required');
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw ApiError.unauthorized('Access token has expired');
      }
      if (err.name === 'JsonWebTokenError') {
        throw ApiError.unauthorized('Invalid access token');
      }
      throw ApiError.unauthorized('Token verification failed');
    }

    const user = await User.findById(decoded.id).select('-password -refreshToken');

    if (!user) {
      throw ApiError.unauthorized('User associated with this token no longer exists');
    }

    if (user.isBlocked) {
      throw ApiError.forbidden('Your account has been blocked. Please contact support.');
    }

    if (!user.isVerified && process.env.NODE_ENV === 'production') {
      throw ApiError.forbidden('Please verify your email address before accessing this resource');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication middleware.
 * If a valid token is present, attaches user to req.user.
 * If no token or invalid token, continues without user (req.user = null).
 * Useful for public routes that optionally personalize content.
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      req.user = null;
      return next();
    }

    try {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id).select('-password -refreshToken');
      req.user = user && !user.isBlocked && (user.isVerified || process.env.NODE_ENV !== 'production') ? user : null;
    } catch {
      req.user = null;
    }

    next();
  } catch {
    req.user = null;
    next();
  }
};

module.exports = { authenticate, optionalAuth };
