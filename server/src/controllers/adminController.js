const User = require('../models/User');
const EmployerProfile = require('../models/EmployerProfile');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Report = require('../models/Report');
const Category = require('../models/Category');
const Skill = require('../models/Skill');
const NotificationService = require('../services/notificationService');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// In-memory platform settings store for simulation
let platformSettings = {
  maintenanceMode: false,
  allowNewRegistrations: true,
  maxFeaturedJobsPerEmployer: 5,
  requireEmployerVerification: true,
};

/**
 * Controller for Admin operations.
 */
class AdminController {
  /**
   * Get Platform Dashboard Statistics.
   */
  static getDashboardStats = async (req, res, next) => {
    try {
      // 1. User registrations count
      const totalUsers = await User.countDocuments();
      const candidatesCount = await User.countDocuments({ role: 'candidate' });
      const employersCount = await User.countDocuments({ role: 'employer' });
      const blockedCount = await User.countDocuments({ isBlocked: true });

      // 2. Jobs stats
      const totalJobs = await Job.countDocuments();
      const activeJobs = await Job.countDocuments({ status: 'active' });
      const closedJobs = await Job.countDocuments({ status: 'closed' });

      // 3. Applications stats
      const totalApplications = await Application.countDocuments();
      const hiredCount = await Application.countDocuments({ status: 'hired' });
      const pendingInterviews = await Application.countDocuments({ status: 'interview' });

      // 4. Company stats
      const totalCompanies = await Company.countDocuments();
      const verifiedCompanies = await Company.countDocuments({ isVerified: true });

      // 5. Recent 5 users
      const recentUsers = await User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('-password');

      // 6. Recent 5 reports
      const recentReports = await Report.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('reportedBy', 'firstName lastName email');

      return ApiResponse.success(
        res,
        {
          metrics: {
            users: { total: totalUsers, candidates: candidatesCount, employers: employersCount, blocked: blockedCount },
            jobs: { total: totalJobs, active: activeJobs, closed: closedJobs },
            applications: { total: totalApplications, hired: hiredCount, pendingInterviews },
            companies: { total: totalCompanies, verified: verifiedCompanies },
          },
          recentUsers,
          recentReports,
        },
        'Dashboard statistics loaded successfully'
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * List users with search & filter.
   */
  static listUsers = async (req, res, next) => {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const skip = (page - 1) * limit;

      const { role, isBlocked, isVerified, search } = req.query;
      const filter = {};

      if (role) filter.role = role;
      if (isBlocked !== undefined) filter.isBlocked = isBlocked === 'true';
      if (isVerified !== undefined) filter.isVerified = isVerified === 'true';

      if (search) {
        filter.$or = [
          { firstName: new RegExp(search, 'i') },
          { lastName: new RegExp(search, 'i') },
          { email: new RegExp(search, 'i') },
        ];
      }

      const users = await User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await User.countDocuments(filter);

      return ApiResponse.paginated(res, 'Users list retrieved successfully', users, {
        page,
        limit,
        total,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Block or Unblock a User.
   */
  static toggleBlockUser = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { isBlocked } = req.body;

      const user = await User.findById(id);
      if (!user) {
        throw ApiError.notFound('User not found');
      }

      if (user.role === 'admin') {
        throw ApiError.badRequest('Admin users cannot be blocked');
      }

      user.isBlocked = isBlocked;
      await user.save();

      // If user is blocked, clear refresh token in db to force logout
      if (isBlocked) {
        user.refreshToken = null;
        await user.save();
      }

      // Notify user via email
      await NotificationService.createNotification({
        user: user._id,
        title: isBlocked ? 'Account Suspended' : 'Account Re-activated',
        message: isBlocked
          ? 'Your account has been temporarily suspended by an administrator for violating community guidelines.'
          : 'Your account has been re-activated by an administrator.',
        type: 'account',
        metadata: {
          suspension: {
            reason: isBlocked ? 'Violation of guidelines' : 'Re-activation',
          },
        },
      });

      return ApiResponse.success(
        res,
        { user },
        `User successfully ${isBlocked ? 'blocked' : 'unblocked'}`
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Approve an Employer Profile.
   */
  static approveEmployer = async (req, res, next) => {
    try {
      const { id } = req.params;

      const profile = await EmployerProfile.findById(id).populate('userId');
      if (!profile) {
        throw ApiError.notFound('Employer profile not found');
      }

      if (profile.isApproved) {
        throw ApiError.badRequest('Employer profile is already approved');
      }

      profile.isApproved = true;
      profile.approvedAt = new Date();
      profile.approvedBy = req.user._id;
      profile.rejectionReason = null;

      await profile.save();

      // Notify the employer
      await NotificationService.createNotification({
        user: profile.userId._id,
        title: 'Employer Verification Approved',
        message: 'Congratulations! Your employer account verification request has been approved by admin. You can now post jobs and schedule interviews.',
        type: 'employer_alert',
        link: '/employer/dashboard',
        metadata: {
          verificationStatus: 'approved',
        },
      });

      return ApiResponse.success(res, { profile }, 'Employer profile approved successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Reject an Employer Profile verification request.
   */
  static rejectEmployer = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { rejectionReason } = req.body;

      const profile = await EmployerProfile.findById(id).populate('userId');
      if (!profile) {
        throw ApiError.notFound('Employer profile not found');
      }

      profile.isApproved = false;
      profile.rejectionReason = rejectionReason;
      profile.approvedAt = null;
      profile.approvedBy = null;

      await profile.save();

      // Notify the employer
      await NotificationService.createNotification({
        user: profile.userId._id,
        title: 'Employer Verification Rejected',
        message: `Your employer account verification request was rejected. Reason: ${rejectionReason}`,
        type: 'employer_alert',
        link: '/employer/profile',
        metadata: {
          verificationStatus: 'rejected',
          reason: rejectionReason,
        },
      });

      return ApiResponse.success(res, { profile }, 'Employer profile rejected successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * List pending verification employer profiles.
   */
  static listPendingEmployers = async (req, res, next) => {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const skip = (page - 1) * limit;

      const filter = { isApproved: false };

      const profiles = await EmployerProfile.find(filter)
        .populate('userId', 'firstName lastName email isVerified')
        .populate('company')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await EmployerProfile.countDocuments(filter);

      return ApiResponse.paginated(res, 'Pending employer profiles retrieved', profiles, {
        page,
        limit,
        total,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Moderate Jobs (List all / delete / hide job posts).
   */
  static listJobs = async (req, res, next) => {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const skip = (page - 1) * limit;

      const { status, search } = req.query;
      const filter = {};

      if (status) filter.status = status;
      if (search) {
        filter.$text = { $search: search };
      }

      const jobs = await Job.find(filter)
        .populate('company', 'name')
        .populate('postedBy', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Job.countDocuments(filter);

      return ApiResponse.paginated(res, 'Jobs list loaded for moderation', jobs, {
        page,
        limit,
        total,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete or force-close a Job listing as moderation.
   */
  static moderateJob = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { action } = req.body; // 'delete' or 'close'

      const job = await Job.findById(id);
      if (!job) {
        throw ApiError.notFound('Job listing not found');
      }

      if (action === 'close') {
        job.status = 'closed';
        await job.save();

        // Notify employer
        await NotificationService.createNotification({
          user: job.postedBy,
          title: 'Job Closed by Administrator',
          message: `Your job posting "${job.title}" has been closed by platform moderation.`,
          type: 'system',
          metadata: { jobId: job._id },
        });

        return ApiResponse.success(res, { job }, 'Job listing has been moderated and closed');
      } else if (action === 'delete') {
        await Job.findByIdAndDelete(id);

        // Cleanup applications for this job in background
        Application.deleteMany({ job: id })
          .catch((err) => console.error(`Job cleanup applications error: ${err.message}`));

        // Notify employer
        await NotificationService.createNotification({
          user: job.postedBy,
          title: 'Job Removed by Administrator',
          message: `Your job posting "${job.title}" has been removed by moderation due to violations.`,
          type: 'system',
        });

        return ApiResponse.success(res, null, 'Job listing successfully removed by moderation');
      } else {
        throw ApiError.badRequest('Invalid moderation action (must be delete or close)');
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * List platform user flag reports.
   */
  static listReports = async (req, res, next) => {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const skip = (page - 1) * limit;

      const { status, targetType } = req.query;
      const filter = {};

      if (status) filter.status = status;
      if (targetType) filter.targetType = targetType;

      const reports = await Report.find(filter)
        .populate('reportedBy', 'firstName lastName email')
        .populate('resolvedBy', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Report.countDocuments(filter);

      return ApiResponse.paginated(res, 'Flag reports retrieved successfully', reports, {
        page,
        limit,
        total,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Resolve platform flag reports.
   */
  static resolveReport = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status, resolution } = req.body;

      const report = await Report.findById(id);
      if (!report) {
        throw ApiError.notFound('Flag report not found');
      }

      report.status = status;
      report.resolution = resolution;
      report.resolvedBy = req.user._id;
      report.resolvedAt = new Date();

      await report.save();

      return ApiResponse.success(res, { report }, 'Flag report resolved successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create category.
   */
  static createCategory = async (req, res, next) => {
    try {
      const { name, icon, description, isActive } = req.body;

      const existing = await Category.findOne({ name });
      if (existing) {
        throw ApiError.conflict('Category name already exists');
      }

      const category = new Category({
        name,
        icon,
        description,
        isActive,
      });

      await category.save();

      return ApiResponse.created(res, { category }, 'Category created successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update category.
   */
  static updateCategory = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, icon, description, isActive } = req.body;

      const category = await Category.findById(id);
      if (!category) {
        throw ApiError.notFound('Category not found');
      }

      if (name !== undefined) category.name = name;
      if (icon !== undefined) category.icon = icon;
      if (description !== undefined) category.description = description;
      if (isActive !== undefined) category.isActive = isActive;

      await category.save();

      return ApiResponse.success(res, { category }, 'Category updated successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete Category.
   */
  static deleteCategory = async (req, res, next) => {
    try {
      const { id } = req.params;

      const category = await Category.findById(id);
      if (!category) {
        throw ApiError.notFound('Category not found');
      }

      await Category.findByIdAndDelete(id);

      return ApiResponse.success(res, null, 'Category deleted successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create Skill.
   */
  static createSkill = async (req, res, next) => {
    try {
      const { name, category, isActive } = req.body;

      const existing = await Skill.findOne({ name });
      if (existing) {
        throw ApiError.conflict('Skill name already exists');
      }

      const categoryDoc = await Category.findById(category);
      if (!categoryDoc) {
        throw ApiError.notFound('Associated Category not found');
      }

      const skill = new Skill({
        name,
        category,
        isActive,
      });

      await skill.save();

      return ApiResponse.created(res, { skill }, 'Skill created successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update Skill.
   */
  static updateSkill = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, category, isActive } = req.body;

      const skill = await Skill.findById(id);
      if (!skill) {
        throw ApiError.notFound('Skill not found');
      }

      if (category !== undefined) {
        const categoryDoc = await Category.findById(category);
        if (!categoryDoc) {
          throw ApiError.notFound('Associated Category not found');
        }
        skill.category = category;
      }

      if (name !== undefined) skill.name = name;
      if (isActive !== undefined) skill.isActive = isActive;

      await skill.save();

      return ApiResponse.success(res, { skill }, 'Skill updated successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete Skill.
   */
  static deleteSkill = async (req, res, next) => {
    try {
      const { id } = req.params;

      const skill = await Skill.findById(id);
      if (!skill) {
        throw ApiError.notFound('Skill not found');
      }

      await Skill.findByIdAndDelete(id);

      return ApiResponse.success(res, null, 'Skill deleted successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get platform settings configurations.
   */
  static getSettings = async (req, res, next) => {
    try {
      return ApiResponse.success(res, { settings: platformSettings }, 'Platform settings loaded');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update platform settings configurations.
   */
  static updateSettings = async (req, res, next) => {
    try {
      const { maintenanceMode, allowNewRegistrations, maxFeaturedJobsPerEmployer, requireEmployerVerification } = req.body;

      if (maintenanceMode !== undefined) platformSettings.maintenanceMode = maintenanceMode;
      if (allowNewRegistrations !== undefined) platformSettings.allowNewRegistrations = allowNewRegistrations;
      if (maxFeaturedJobsPerEmployer !== undefined) platformSettings.maxFeaturedJobsPerEmployer = maxFeaturedJobsPerEmployer;
      if (requireEmployerVerification !== undefined) platformSettings.requireEmployerVerification = requireEmployerVerification;

      return ApiResponse.success(res, { settings: platformSettings }, 'Platform settings updated successfully');
    } catch (error) {
      next(error);
    }
  };
}

module.exports = AdminController;
