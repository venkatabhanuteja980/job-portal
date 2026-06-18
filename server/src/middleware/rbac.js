const ApiError = require('../utils/ApiError');

/**
 * Role-Based Access Control (RBAC) middleware.
 * Must be used AFTER the authenticate middleware.
 * @param  {...string} allowedRoles - Roles that are permitted to access the route
 * @returns {Function} Express middleware
 *
 * @example
 * router.get('/admin/dashboard', authenticate, authorize('admin'), adminController.dashboard);
 * router.get('/jobs', authenticate, authorize('employer', 'admin'), jobController.create);
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication is required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Role '${req.user.role}' is not authorized to access this resource`
        )
      );
    }

    next();
  };
};

/**
 * Middleware to check if the employer account has been approved by admin.
 * Must be used AFTER authenticate + authorize('employer').
 */
const requireApprovedEmployer = async (req, res, next) => {
  try {
    if (req.user.role !== 'employer') {
      return next();
    }

    const EmployerProfile = require('../models/EmployerProfile');
    const profile = await EmployerProfile.findOne({ userId: req.user._id });

    if (!profile) {
      return next(ApiError.notFound('Employer profile not found'));
    }

    if (!profile.isApproved) {
      return next(
        ApiError.forbidden(
          'Your employer account is pending approval. Please wait for admin verification.'
        )
      );
    }

    req.employerProfile = profile;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { authorize, requireApprovedEmployer };
