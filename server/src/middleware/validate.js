const ApiError = require('../utils/ApiError');

/**
 * Middleware factory for validating request data against a Zod schema.
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @param {'body' | 'query' | 'params'} source - Which part of the request to validate
 * @returns {Function} Express middleware
 *
 * @example
 * const { z } = require('zod');
 * const loginSchema = z.object({
 *   email: z.string().email(),
 *   password: z.string().min(8),
 * });
 * router.post('/login', validate(loginSchema), authController.login);
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return next(new ApiError(422, 'Validation failed', errors));
    }

    // Replace request data with parsed (and potentially transformed) data
    req[source] = result.data;
    next();
  };
};

module.exports = validate;
