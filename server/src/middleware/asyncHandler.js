/**
 * Wraps an async route handler to catch rejected promises and forward to error handler.
 * Express 5 handles this natively, but this wrapper provides a consistent pattern.
 * @param {Function} fn - Async route handler function
 * @returns {Function} Wrapped handler
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
