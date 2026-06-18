const ApiError = require('../utils/ApiError');

/**
 * Handle 404 - Route Not Found
 */
const notFoundHandler = (req, res, next) => {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
};

/**
 * Handle Mongoose CastError (invalid ObjectId)
 */
const handleCastError = (err) => {
  return ApiError.badRequest(`Invalid value '${err.value}' for field '${err.path}'`);
};

/**
 * Handle Mongoose duplicate key error
 */
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  return ApiError.conflict(`Duplicate value '${value}' for field '${field}'. Please use another value.`);
};

/**
 * Handle Mongoose validation error
 */
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((e) => ({
    field: e.path,
    message: e.message,
  }));
  return ApiError.validationError(errors);
};

/**
 * Handle JWT errors
 */
const handleJWTError = () => {
  return ApiError.unauthorized('Invalid token. Please log in again.');
};

const handleJWTExpiredError = () => {
  return ApiError.unauthorized('Token has expired. Please log in again.');
};

/**
 * Global error handling middleware.
 * Must be registered LAST in the middleware chain.
 * Express identifies error handlers by their 4-parameter signature.
 */
const errorHandler = (err, req, res, _next) => {
  let error = { ...err, message: err.message, stack: err.stack };

  // Mongoose CastError
  if (err.name === 'CastError') {
    error = handleCastError(err);
  }

  // Mongoose duplicate key (code 11000)
  if (err.code === 11000) {
    error = handleDuplicateKeyError(err);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    error = handleValidationError(err);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = handleJWTError();
  }
  if (err.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  }

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = ApiError.badRequest('File size exceeds the allowed limit');
  }

  // Multer unexpected field error
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error = ApiError.badRequest('Unexpected file field');
  }

  const statusCode = error.statusCode || 500;
  const status = error.status || 'error';

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('ERROR:', {
      status: statusCode,
      message: error.message,
      stack: error.stack,
      errors: error.errors,
    });
  } else {
    // In production, log only server errors
    if (statusCode >= 500) {
      console.error('SERVER ERROR:', {
        message: error.message,
        stack: error.stack,
      });
    }
  }

  res.status(statusCode).json({
    success: false,
    status,
    message: statusCode >= 500 && process.env.NODE_ENV === 'production'
      ? 'Something went wrong. Please try again later.'
      : error.message,
    ...(error.errors && error.errors.length > 0 && { errors: error.errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};

module.exports = { errorHandler, notFoundHandler };
