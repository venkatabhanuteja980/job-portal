const crypto = require('crypto');
const User = require('../models/User');
const CandidateProfile = require('../models/CandidateProfile');
const EmployerProfile = require('../models/EmployerProfile');
const EmailService = require('../services/emailService');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const {
  generateAccessToken,
  generateRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  verifyRefreshToken,
} = require('../utils/generateToken');

/**
 * Authentication and Authorization Controller.
 * Handles user signup, login, logout, verification, password resets, and LinkedIn OAuth.
 */
class AuthController {
  /**
   * Register a new Candidate or Employer.
   */
  static register = async (req, res, next) => {
    try {
      const { firstName, lastName, email, password, role } = req.body;

      // Check for existing user
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw ApiError.conflict('A user with this email address already exists');
      }

      // Create new user instance
      const user = new User({
        firstName,
        lastName,
        email,
        password,
        role,
        isVerified: process.env.NODE_ENV !== 'production',
      });

      // Generate verification token (saved to user model)
      const rawVerificationToken = user.generateVerificationToken();
      await user.save();

      // Create corresponding empty profile based on role
      if (role === 'candidate') {
        await CandidateProfile.create({ userId: user._id });
      } else if (role === 'employer') {
        await EmployerProfile.create({ userId: user._id });
      }

      // Send verification email in the background
      EmailService.sendVerificationEmail(user.email, user.fullName, rawVerificationToken)
        .catch((err) => console.error('Failed to send registration verification email:', err.message));

      return ApiResponse.created(
        res,
        {
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
          },
        },
        'Registration successful. Please check your email to verify your account.'
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Login user and issue access/refresh tokens.
   */
  static login = async (req, res, next) => {
    try {
      const { email, password } = req.body;

      // Find user by email and explicitly select password field
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        throw ApiError.unauthorized('Invalid email or password');
      }

      // Verify password
      const isPasswordCorrect = await user.comparePassword(password);
      if (!isPasswordCorrect) {
        throw ApiError.unauthorized('Invalid email or password');
      }

      // Check if account is suspended/blocked
      if (user.isBlocked) {
        throw ApiError.forbidden('Your account has been suspended. Please contact support.');
      }

      // Update last login timestamp
      user.lastLogin = new Date();
      if (process.env.NODE_ENV !== 'production' && !user.isVerified) {
        user.isVerified = true;
      }

      // Generate access & refresh tokens
      const accessToken = generateAccessToken({ id: user._id, role: user.role });
      const refreshToken = generateRefreshToken({ id: user._id });

      // Save refresh token to user document
      user.refreshToken = refreshToken;
      await user.save();

      // Set HTTP-only refresh cookie
      setRefreshTokenCookie(res, refreshToken);

      // Return response (without password & refreshToken fields due to toJSON transform)
      return ApiResponse.success(
        res,
        {
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            isVerified: user.isVerified,
            lastLogin: user.lastLogin,
          },
          accessToken,
        },
        'Login successful'
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Logout user, clear refresh token cookie and invalidate stored token.
   */
  static logout = async (req, res, next) => {
    try {
      // Invalidate token in DB if authenticated
      if (req.user) {
        await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });
      }

      // Clear cookie
      clearRefreshTokenCookie(res);

      return ApiResponse.success(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Refresh JWT access token using refresh token.
   */
  static refreshToken = async (req, res, next) => {
    try {
      const token = req.cookies.refreshToken || req.body.refreshToken;
      if (!token) {
        throw ApiError.unauthorized('Refresh token is required');
      }

      let decoded;
      try {
        decoded = verifyRefreshToken(token);
      } catch {
        throw ApiError.unauthorized('Invalid or expired refresh token');
      }

      // Find user and select their refresh token
      const user = await User.findById(decoded.id).select('+refreshToken');
      if (!user || user.refreshToken !== token) {
        throw ApiError.unauthorized('Invalid refresh token');
      }

      if (user.isBlocked) {
        throw ApiError.forbidden('Your account has been suspended.');
      }

      // Rotate tokens (generate new access & refresh token for security)
      const accessToken = generateAccessToken({ id: user._id, role: user.role });
      const newRefreshToken = generateRefreshToken({ id: user._id });

      user.refreshToken = newRefreshToken;
      await user.save();

      setRefreshTokenCookie(res, newRefreshToken);

      return ApiResponse.success(
        res,
        { accessToken },
        'Token refreshed successfully'
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Verify email address using verification token.
   */
  static verifyEmail = async (req, res, next) => {
    try {
      const { token } = req.body;

      // Hash raw token to match stored database hash
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      const user = await User.findOne({
        verificationToken: hashedToken,
        verificationExpires: { $gt: new Date() },
      });

      if (!user) {
        throw ApiError.badRequest('Invalid or expired verification link');
      }

      // Mark email as verified, clean token fields
      user.isVerified = true;
      user.verificationToken = undefined;
      user.verificationExpires = undefined;
      await user.save();

      // Trigger Welcome Onboarding Email in background
      EmailService.sendWelcomeEmail(user.email, user.fullName, user.role)
        .catch((err) => console.error('Failed to send onboarding welcome email:', err.message));

      return ApiResponse.success(res, null, 'Email verified successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Resend verification email link.
   */
  static resendVerification = async (req, res, next) => {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        throw ApiError.notFound('No user found with this email address');
      }

      if (user.isVerified) {
        throw ApiError.badRequest('This email address has already been verified');
      }

      // Generate new token
      const rawVerificationToken = user.generateVerificationToken();
      await user.save();

      // Resend email
      await EmailService.sendVerificationEmail(user.email, user.fullName, rawVerificationToken);

      return ApiResponse.success(res, null, 'Verification email resent. Please check your inbox.');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Request password reset link.
   */
  static forgotPassword = async (req, res, next) => {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        throw ApiError.notFound('No account associated with this email address');
      }

      // Generate reset token (saved to user model)
      const rawResetToken = user.generateResetPasswordToken();
      await user.save();

      // Send email
      await EmailService.sendPasswordResetEmail(user.email, user.fullName, rawResetToken);

      return ApiResponse.success(
        res,
        null,
        'A password reset link has been dispatched to your email address'
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Reset password using reset token.
   */
  static resetPassword = async (req, res, next) => {
    try {
      const { token } = req.params;
      const { password } = req.body;

      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: new Date() },
      });

      if (!user) {
        throw ApiError.badRequest('Invalid or expired password reset link');
      }

      // Set new password (will be auto-hashed by User model pre-save hook)
      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      return ApiResponse.success(res, null, 'Password reset successful. You can now log in.');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Change password (authenticated).
   */
  static changePassword = async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(req.user._id).select('+password');
      if (!user) {
        throw ApiError.unauthorized('User not authenticated');
      }

      // Check current password correctness
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        throw ApiError.badRequest('Incorrect current password');
      }

      // Save new password
      user.password = newPassword;
      await user.save();

      return ApiResponse.success(res, null, 'Password updated successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get current authenticated user details.
   */
  static getCurrentUser = async (req, res, next) => {
    try {
      return ApiResponse.success(res, { user: req.user });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Redirect users to LinkedIn authorization portal.
   */
  static linkedinLogin = async (req, res, next) => {
    try {
      const clientId = process.env.LINKEDIN_CLIENT_ID;
      const redirectUri = encodeURIComponent(process.env.LINKEDIN_CALLBACK_URL || '');
      
      if (!clientId || !redirectUri) {
        throw ApiError.internal('LinkedIn OAuth is not configured on the server');
      }

      // Scopes: openid, profile, email (LinkedIn v2/OpenID Connect standard scopes)
      const url = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=openid%20profile%20email&state=jobportalsecurestate`;
      
      return res.redirect(url);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handle LinkedIn redirection authorization code, fetch user metadata, login/register.
   */
  static linkedinCallback = async (req, res, next) => {
    try {
      const { code, error, error_description } = req.query;

      if (error) {
        throw ApiError.badRequest(`LinkedIn Authorization Failed: ${error_description || error}`);
      }

      if (!code) {
        throw ApiError.badRequest('LinkedIn authorization code is missing');
      }

      const clientId = process.env.LINKEDIN_CLIENT_ID;
      const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
      const redirectUri = process.env.LINKEDIN_CALLBACK_URL;

      // 1. Exchange auth code for access token
      const tokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken';
      const bodyParams = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code.toString(),
        redirect_uri: redirectUri || '',
        client_id: clientId || '',
        client_secret: clientSecret || '',
      });

      const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: bodyParams.toString(),
      });

      const tokenData = await tokenResponse.json();
      if (!tokenResponse.ok) {
        throw ApiError.unauthorized(`LinkedIn Access Token exchange failed: ${tokenData.error_description || tokenData.error}`);
      }

      const accessToken = tokenData.access_token;

      // 2. Fetch User Profile Info via OpenID Connect userinfo endpoint
      const userinfoUrl = 'https://api.linkedin.com/v2/userinfo';
      const userinfoResponse = await fetch(userinfoUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const profileData = await userinfoResponse.json();
      if (!userinfoResponse.ok) {
        throw ApiError.unauthorized('Failed to fetch LinkedIn profile information');
      }

      const email = profileData.email;
      const firstName = profileData.given_name || 'LinkedIn';
      const lastName = profileData.family_name || 'User';
      const avatarUrl = profileData.picture || null;

      if (!email) {
        throw ApiError.badRequest('LinkedIn account must share a primary email address');
      }

      // 3. Find or register user (fallback to candidate role if registration is required)
      let user = await User.findOne({ email });
      let isNewUser = false;

      if (!user) {
        isNewUser = true;
        // Generate random secure password since it's an OAuth user
        const randomPassword = crypto.randomBytes(16).toString('hex') + 'A@1';
        
        user = new User({
          firstName,
          lastName,
          email,
          password: randomPassword,
          role: 'candidate',
          isVerified: true, // OAuth emails are pre-verified by provider
        });

        if (avatarUrl) {
          user.avatar = { url: avatarUrl, publicId: null };
        }

        await user.save();

        // Create empty profile
        await CandidateProfile.create({ userId: user._id });
        
        // Welcome email
        EmailService.sendWelcomeEmail(user.email, user.fullName, user.role)
          .catch((err) => console.error('Failed to send LinkedIn onboarding welcome email:', err.message));
      }

      if (user.isBlocked) {
        throw ApiError.forbidden('Your account has been suspended.');
      }

      // Update last login
      user.lastLogin = new Date();
      
      // Generate access & refresh tokens
      const clientAccessToken = generateAccessToken({ id: user._id, role: user.role });
      const clientRefreshToken = generateRefreshToken({ id: user._id });

      user.refreshToken = clientRefreshToken;
      await user.save();

      setRefreshTokenCookie(res, clientRefreshToken);

      // Redirect back to frontend client dashboard with token parameters
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      const redirectTarget = `${clientUrl}/oauth-success?token=${clientAccessToken}&role=${user.role}&isNew=${isNewUser}`;
      
      return res.redirect(redirectTarget);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = AuthController;
