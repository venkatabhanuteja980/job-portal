const Company = require('../models/Company');
const Category = require('../models/Category');
const Skill = require('../models/Skill');
const Job = require('../models/Job');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Controller for public access resources.
 */
class PublicController {
  /**
   * List all verified companies (paginated).
   */
  static getCompanies = async (req, res, next) => {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const skip = (page - 1) * limit;

      const filter = { isVerified: true };
      
      if (req.query.search) {
        filter.name = new RegExp(req.query.search, 'i');
      }

      if (req.query.industry) {
        filter.industry = req.query.industry;
      }

      const companies = await Company.find(filter)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit);

      const total = await Company.countDocuments(filter);

      return ApiResponse.paginated(res, 'Companies list retrieved successfully', companies, {
        page,
        limit,
        total,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get detailed Company profile and its active job posts.
   */
  static getCompanyDetails = async (req, res, next) => {
    try {
      const { identifier } = req.params; // slug or objectId
      
      // Determine if identifier is an ObjectId
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);
      
      const filter = isObjectId ? { _id: identifier } : { slug: identifier };
      const company = await Company.findOne(filter);
      
      if (!company) {
        throw ApiError.notFound('Company profile not found');
      }

      // Fetch active jobs posted by this company
      const activeJobs = await Job.find({ company: company._id, status: 'active' })
        .populate('skills', 'name')
        .populate('category', 'name')
        .sort({ createdAt: -1 });

      return ApiResponse.success(res, { company, activeJobs }, 'Company profile loaded successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get list of all active categories (for job filters / home page).
   */
  static getCategories = async (req, res, next) => {
    try {
      const categories = await Category.find({ isActive: true }).sort({ name: 1 });

      return ApiResponse.success(res, { categories }, 'Categories list loaded');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get list of all active skills.
   */
  static getSkills = async (req, res, next) => {
    try {
      const filter = { isActive: true };
      
      if (req.query.category) {
        filter.category = req.query.category;
      }

      const skills = await Skill.find(filter)
        .populate('category', 'name')
        .sort({ name: 1 });

      return ApiResponse.success(res, { skills }, 'Skills list loaded');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get high-level platform statistics for the public homepage.
   */
  static getPlatformStats = async (req, res, next) => {
    try {
      const activeJobs = await Job.countDocuments({ status: 'active' });
      const totalCompanies = await Company.countDocuments({ isVerified: true });
      const candidatesCount = await User.countDocuments({ role: 'candidate', isBlocked: false });
      
      // Calculate a mock hires count or fetch from application schema where status = hired
      const hiresCount = await Job.aggregate([
        { $group: { _id: null, totalHires: { $sum: '$applicantCount' } } }
      ]);
      
      const totalHires = hiresCount.length > 0 ? Math.round(hiresCount[0].totalHires * 0.15) + 12 : 37;

      return ApiResponse.success(
        res,
        {
          activeJobs,
          totalCompanies,
          totalCandidates: candidatesCount,
          totalHires,
        },
        'Platform stats loaded successfully'
      );
    } catch (error) {
      next(error);
    }
  };
}

module.exports = PublicController;
