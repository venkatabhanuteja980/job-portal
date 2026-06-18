const CandidateProfile = require('../models/CandidateProfile');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const CloudinaryService = require('../services/cloudinaryService');
const ResumeParserService = require('../services/resumeParserService');
const JobMatcherService = require('../services/jobMatcherService');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Controller for Candidate-specific features.
 * Handles Profile CRUD, resume upload/parsing, avatar upload, job recommendation, and saved jobs.
 */
class CandidateController {
  /**
   * Get Candidate Profile.
   */
  static getProfile = async (req, res, next) => {
    try {
      const profile = await CandidateProfile.findOne({ userId: req.user._id })
        .populate('skills')
        .populate('userId', 'firstName lastName email avatar role isVerified lastLogin');

      if (!profile) {
        throw ApiError.notFound('Candidate profile not found');
      }

      return ApiResponse.success(res, { profile }, 'Profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update Candidate Profile.
   */
  static updateProfile = async (req, res, next) => {
    try {
      const profile = await CandidateProfile.findOne({ userId: req.user._id });
      if (!profile) {
        throw ApiError.notFound('Candidate profile not found');
      }

      const allowedUpdates = [
        'phone', 'dateOfBirth', 'gender', 'address', 'headline', 'summary',
        'skills', 'customSkills', 'experience', 'education', 'certifications',
        'languages', 'linkedinUrl', 'portfolioUrl', 'githubUrl', 'jobPreferences',
        'searchable'
      ];

      // Assign update values
      allowedUpdates.forEach((field) => {
        if (req.body[field] !== undefined) {
          profile[field] = req.body[field];
        }
      });

      // Recalculate experience years and profile completion
      profile.calculateTotalExperience();
      profile.calculateProfileCompletion(req.user);

      await profile.save();

      // Fetch updated profile with populated fields
      const updatedProfile = await CandidateProfile.findById(profile._id)
        .populate('skills')
        .populate('userId', 'firstName lastName email avatar role isVerified');

      return ApiResponse.success(res, { profile: updatedProfile }, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Upload resume (PDF/DOCX) and parse it.
   */
  static uploadResume = async (req, res, next) => {
    try {
      if (!req.file) {
        throw ApiError.badRequest('Resume file is required');
      }

      const profile = await CandidateProfile.findOne({ userId: req.user._id });
      if (!profile) {
        throw ApiError.notFound('Candidate profile not found');
      }

      // 1. Delete previous resume from Cloudinary if exists
      if (profile.resumePublicId) {
        // Resumes are uploaded as 'raw' resource type
        await CloudinaryService.deleteFile(profile.resumePublicId, 'raw');
      }

      // 2. Upload file to Cloudinary
      const uploadResult = await CloudinaryService.uploadResume(
        req.file.buffer,
        req.file.originalname
      );

      // 3. Extract and parse resume text
      const rawText = await ResumeParserService.extractRawText(
        req.file.buffer,
        req.file.mimetype
      );
      const parsedResume = await ResumeParserService.parseResumeText(rawText);

      // 4. Update candidate profile fields
      profile.resumeUrl = uploadResult.url;
      profile.resumePublicId = uploadResult.publicId;
      profile.resumeOriginalName = uploadResult.originalName;
      profile.parsedResume = parsedResume;

      // Recalculate completion percentage (resume gives 15%)
      profile.calculateProfileCompletion(req.user);
      await profile.save();

      return ApiResponse.success(
        res,
        {
          resumeUrl: profile.resumeUrl,
          resumeOriginalName: profile.resumeOriginalName,
          parsedResume: profile.parsedResume,
          profileCompletion: profile.profileCompletion,
        },
        'Resume uploaded and parsed successfully'
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Upload candidate avatar.
   */
  static uploadAvatar = async (req, res, next) => {
    try {
      if (!req.file) {
        throw ApiError.badRequest('Avatar image file is required');
      }

      const user = await User.findById(req.user._id);
      if (!user) {
        throw ApiError.notFound('User not found');
      }

      // Delete old avatar image from Cloudinary if exists
      if (user.avatar && user.avatar.publicId) {
        await CloudinaryService.deleteFile(user.avatar.publicId, 'image');
      }

      // Upload new avatar image to Cloudinary
      const uploadResult = await CloudinaryService.uploadAvatar(
        req.file.buffer,
        user._id.toString()
      );

      user.avatar = {
        url: uploadResult.url,
        publicId: uploadResult.publicId,
      };
      await user.save();

      // Recalculate candidate profile completion since avatar contributes 10%
      const profile = await CandidateProfile.findOne({ userId: user._id });
      let completionScore = 0;
      if (profile) {
        profile.calculateProfileCompletion(user);
        await profile.save();
        completionScore = profile.profileCompletion;
      }

      return ApiResponse.success(
        res,
        {
          avatar: user.avatar,
          profileCompletion: completionScore,
        },
        'Avatar picture uploaded successfully'
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Save a Job to bookmarks.
   */
  static saveJob = async (req, res, next) => {
    try {
      const { jobId } = req.params;

      const job = await Job.findById(jobId);
      if (!job) {
        throw ApiError.notFound('Job not found');
      }

      const profile = await CandidateProfile.findOne({ userId: req.user._id });
      if (!profile) {
        throw ApiError.notFound('Candidate profile not found');
      }

      if (profile.savedJobs.includes(jobId)) {
        throw ApiError.badRequest('Job has already been saved');
      }

      profile.savedJobs.push(jobId);
      await profile.save();

      return ApiResponse.success(res, null, 'Job bookmarked successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Unsave a bookmarked Job.
   */
  static unsaveJob = async (req, res, next) => {
    try {
      const { jobId } = req.params;

      const profile = await CandidateProfile.findOne({ userId: req.user._id });
      if (!profile) {
        throw ApiError.notFound('Candidate profile not found');
      }

      if (!profile.savedJobs.includes(jobId)) {
        throw ApiError.badRequest('Job is not in your bookmarked list');
      }

      profile.savedJobs = profile.savedJobs.filter((id) => id.toString() !== jobId);
      await profile.save();

      return ApiResponse.success(res, null, 'Job removed from bookmarks');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Fetch all bookmarked Jobs.
   */
  static getSavedJobs = async (req, res, next) => {
    try {
      const profile = await CandidateProfile.findOne({ userId: req.user._id })
        .populate({
          path: 'savedJobs',
          populate: { path: 'company', select: 'name logo location size industry' },
        });

      if (!profile) {
        throw ApiError.notFound('Candidate profile not found');
      }

      return ApiResponse.success(res, { savedJobs: profile.savedJobs }, 'Saved jobs fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get intelligent Job recommendations for candidate.
   */
  static getRecommendations = async (req, res, next) => {
    try {
      const profile = await CandidateProfile.findOne({ userId: req.user._id });
      if (!profile) {
        throw ApiError.notFound('Candidate profile not found');
      }

      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
      const recommendations = await JobMatcherService.getRecommendationsForCandidate(
        profile,
        limit
      );

      return ApiResponse.success(
        res,
        { recommendations },
        'Job recommendations fetched successfully'
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get personalized Candidate dashboard details.
   */
  static getDashboard = async (req, res, next) => {
    try {
      const profile = await CandidateProfile.findOne({ userId: req.user._id });
      if (!profile) {
        throw ApiError.notFound('Candidate profile not found');
      }

      // 1. Fetch recent 5 applications
      const recentApplications = await Application.find({ candidate: req.user._id })
        .sort({ appliedAt: -1 })
        .limit(5)
        .populate({
          path: 'job',
          select: 'title location jobType salary',
          populate: { path: 'company', select: 'name logo' },
        });

      // 2. Fetch top 3 job recommendations
      const recommendations = await JobMatcherService.getRecommendationsForCandidate(profile, 3);

      // 3. Count dashboard metrics
      const totalApplications = await Application.countDocuments({ candidate: req.user._id });
      const activeInterviews = await Application.countDocuments({
        candidate: req.user._id,
        status: 'interview',
      });
      const savedJobsCount = profile.savedJobs.length;

      return ApiResponse.success(
        res,
        {
          profileCompletion: profile.profileCompletion,
          metrics: {
            totalApplications,
            activeInterviews,
            savedJobsCount,
          },
          recentApplications,
          recommendations,
        },
        'Candidate dashboard data loaded'
      );
    } catch (error) {
      next(error);
    }
  };
}

module.exports = CandidateController;
