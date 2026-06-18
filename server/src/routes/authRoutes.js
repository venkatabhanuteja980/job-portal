const express = require('express');
const AuthController = require('../controllers/authController');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  verifyEmailSchema,
} = require('../validators/authValidator');

const router = express.Router();

// Apply auth rate limiter to sensitive endpoints
router.use(authLimiter);

// Public Routes
router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/verify-email', validate(verifyEmailSchema), AuthController.verifyEmail);
router.post('/resend-verification', validate(forgotPasswordSchema), AuthController.resendVerification);
router.post('/forgot-password', validate(forgotPasswordSchema), AuthController.forgotPassword);
router.post('/reset-password/:token', validate(resetPasswordSchema), AuthController.resetPassword);

// LinkedIn OAuth Public Endpoints
router.get('/linkedin', AuthController.linkedinLogin);
router.get('/linkedin/callback', AuthController.linkedinCallback);

// Protected Routes (Require Authentication)
router.post('/logout', authenticate, AuthController.logout);
router.put('/change-password', authenticate, validate(changePasswordSchema), AuthController.changePassword);
router.get('/me', authenticate, AuthController.getCurrentUser);

module.exports = router;
