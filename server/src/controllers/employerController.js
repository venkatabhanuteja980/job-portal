const EmployerProfile = require('../models/EmployerProfile');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');
const CloudinaryService = require('../services/cloudinaryService');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Controller for Employer-specific features.
 * Handles profile management, company linking, dashboard analytics, and logo uploads.
 */
class EmployerController {
  /**
   * Get Employer Profile.
   */
  static getProfile = async (req, res, next) => {
    try {
      const profile = await EmployerProfile.findOne({ userId: req.user._id })
        .populate('company')
        .populate('userId', 'firstName lastName email avatar role isVerified');

      if (!profile) {
        throw ApiError.notFound('Employer profile not found');
      }

      return ApiResponse.success(res, { profile }, 'Profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update Employer Profile details.
   */
  static updateProfile = async (req, res, next) => {
    try {
      const { phone, designation, department } = req.body;

      const profile = await EmployerProfile.findOne({ userId: req.user._id });
      if (!profile) {
        throw ApiError.notFound('Employer profile not found');
      }

      if (phone !== undefined) profile.phone = phone;
      if (designation !== undefined) profile.designation = designation;
      if (department !== undefined) profile.department = department;

      await profile.save();

      const updatedProfile = await EmployerProfile.findById(profile._id)
        .populate('company')
        .populate('userId', 'firstName lastName email avatar role');

      return ApiResponse.success(res, { profile: updatedProfile }, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get own associated Company Profile.
   */
  static getCompany = async (req, res, next) => {
    try {
      const profile = await EmployerProfile.findOne({ userId: req.user._id });
      if (!profile) {
        throw ApiError.notFound('Employer profile not found');
      }

      if (!profile.company) {
        return ApiResponse.success(res, { company: null }, 'No company associated with this profile');
      }

      const company = await Company.findById(profile.company);
      if (!company) {
        throw ApiError.notFound('Associated company profile not found in database');
      }

      return ApiResponse.success(res, { company }, 'Company details retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create a new Company Profile and associate with Employer.
   */
  static createCompany = async (req, res, next) => {
    try {
      const profile = await EmployerProfile.findOne({ userId: req.user._id });
      if (!profile) {
        throw ApiError.notFound('Employer profile not found');
      }

      if (profile.company) {
        throw ApiError.badRequest('You are already associated with a company profile');
      }

      // Create new company document
      const company = new Company({
        ...req.body,
        createdBy: req.user._id,
      });

      await company.save();

      // Link company to employer profile
      profile.company = company._id;
      await profile.save();

      return ApiResponse.created(res, { company }, 'Company profile created successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update own associated Company Profile details.
   */
  static updateCompany = async (req, res, next) => {
    try {
      const profile = await EmployerProfile.findOne({ userId: req.user._id });
      if (!profile || !profile.company) {
        throw ApiError.badRequest('No company associated with your employer profile');
      }

      const company = await Company.findById(profile.company);
      if (!company) {
        throw ApiError.notFound('Associated company profile not found');
      }

      const allowedUpdates = [
        'name', 'website', 'email', 'phone', 'industry', 'description',
        'headquarters', 'locations', 'size', 'foundedYear', 'revenue',
        'techStack', 'benefits', 'culture', 'socialLinks'
      ];

      // Assign update values
      allowedUpdates.forEach((field) => {
        if (req.body[field] !== undefined) {
          company[field] = req.body[field];
        }
      });

      await company.save();

      return ApiResponse.success(res, { company }, 'Company profile updated successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Upload and set Company logo.
   */
  static uploadLogo = async (req, res, next) => {
    try {
      if (!req.file) {
        throw ApiError.badRequest('Logo image file is required');
      }

      const profile = await EmployerProfile.findOne({ userId: req.user._id });
      if (!profile || !profile.company) {
        throw ApiError.badRequest('No company associated with your employer profile');
      }

      const company = await Company.findById(profile.company);
      if (!company) {
        throw ApiError.notFound('Associated company profile not found');
      }

      // Delete existing logo from Cloudinary if it exists
      if (company.logo && company.logo.publicId) {
        await CloudinaryService.deleteFile(company.logo.publicId, 'image');
      }

      // Upload logo to Cloudinary
      const uploadResult = await CloudinaryService.uploadLogo(
        req.file.buffer,
        company.slug
      );

      company.logo = {
        url: uploadResult.url,
        publicId: uploadResult.publicId,
      };

      await company.save();

      return ApiResponse.success(res, { logo: company.logo }, 'Company logo uploaded successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get Employer Dashboard Analytics metrics.
   */
  static getDashboard = async (req, res, next) => {
    try {
      const profile = await EmployerProfile.findOne({ userId: req.user._id });
      if (!profile) {
        throw ApiError.notFound('Employer profile not found');
      }

      if (!profile.company) {
        return ApiResponse.success(
          res,
          {
            metrics: { totalJobs: 0, activeJobs: 0, totalApplicants: 0, pendingInterviews: 0 },
            recentApplicants: [],
          },
          'No company linked yet'
        );
      }

      // Fetch active and total job counts posted by this company
      const totalJobs = await Job.countDocuments({ company: profile.company });
      const activeJobs = await Job.countDocuments({ company: profile.company, status: 'active' });

      // Find all job IDs for this company
      const companyJobs = await Job.find({ company: profile.company }).select('_id');
      const jobIds = companyJobs.map((j) => j._id);

      // Count total applicants and pending interviews
      const totalApplicants = await Application.countDocuments({ job: { $in: jobIds } });
      const pendingInterviews = await Application.countDocuments({
        job: { $in: jobIds },
        status: 'interview',
      });

      // Fetch recent 5 applicants
      const recentApplicants = await Application.find({ job: { $in: jobIds } })
        .sort({ appliedAt: -1 })
        .limit(5)
        .populate('candidate', 'firstName lastName email avatar')
        .populate('job', 'title');

      return ApiResponse.success(
        res,
        {
          metrics: {
            totalJobs,
            activeJobs,
            totalApplicants,
            pendingInterviews,
          },
          recentApplicants,
        },
        'Dashboard analytics loaded successfully'
      );
    } catch (error) {
      next(error);
    }
  };
}

module.exports = EmployerController;
