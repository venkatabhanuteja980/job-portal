const Job = require('../models/Job');
const EmployerProfile = require('../models/EmployerProfile');
const Application = require('../models/Application');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Controller for Job Listings.
 * Handles job postings, updates, listings, searches, and filters.
 */
class JobController {
  /**
   * Post a new Job (Employer only).
   */
  static createJob = async (req, res, next) => {
    try {
      const employerProfile = await EmployerProfile.findOne({ userId: req.user._id });
      if (!employerProfile || !employerProfile.company) {
        throw ApiError.badRequest('You must create a Company profile before posting a job');
      }

      // Add company and postedBy references
      const jobData = {
        ...req.body,
        company: employerProfile.company,
        postedBy: req.user._id,
      };

      const job = new Job(jobData);
      await job.save();

      return ApiResponse.created(res, { job }, 'Job posted successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update an existing Job post (Posted employer only).
   */
  static updateJob = async (req, res, next) => {
    try {
      const { id } = req.params;

      const job = await Job.findById(id);
      if (!job) {
        throw ApiError.notFound('Job not found');
      }

      // Verify ownership
      if (job.postedBy.toString() !== req.user._id.toString()) {
        throw ApiError.forbidden('You are not authorized to update this job listing');
      }

      const allowedUpdates = [
        'title', 'description', 'requirements', 'responsibilities', 'skills',
        'customSkills', 'location', 'locationType', 'salary', 'experienceLevel',
        'experienceRequired', 'educationRequired', 'jobType', 'category',
        'deadline', 'openings', 'benefits', 'tags'
      ];

      // Assign update values
      allowedUpdates.forEach((field) => {
        if (req.body[field] !== undefined) {
          job[field] = req.body[field];
        }
      });

      await job.save();

      return ApiResponse.success(res, { job }, 'Job updated successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete a Job listing (Posted employer or Admin).
   */
  static deleteJob = async (req, res, next) => {
    try {
      const { id } = req.params;

      const job = await Job.findById(id);
      if (!job) {
        throw ApiError.notFound('Job not found');
      }

      // Verify ownership or admin role
      if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        throw ApiError.forbidden('You are not authorized to delete this job listing');
      }

      // Delete job document
      await Job.findByIdAndDelete(id);

      // Clean up applications for this job in background
      Application.deleteMany({ job: id })
        .catch((err) => console.error(`Failed to clean up applications for deleted job ${id}:`, err.message));

      return ApiResponse.success(res, null, 'Job deleted successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Close or Reopen a Job post (change status).
   */
  static changeStatus = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const job = await Job.findById(id);
      if (!job) {
        throw ApiError.notFound('Job not found');
      }

      // Verify ownership
      if (job.postedBy.toString() !== req.user._id.toString()) {
        throw ApiError.forbidden('You are not authorized to update status of this job');
      }

      job.status = status;
      await job.save();

      return ApiResponse.success(res, { job }, `Job status updated to ${status}`);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get detailed Job view (increments views count).
   */
  static getJobDetails = async (req, res, next) => {
    try {
      const { id } = req.params;

      const job = await Job.findById(id)
        .populate('company', 'name logo website headquarters description size industry')
        .populate('skills', 'name')
        .populate('category', 'name');

      if (!job) {
        throw ApiError.notFound('Job not found');
      }

      // Increment view count in background
      job.views += 1;
      await job.save();

      return ApiResponse.success(res, { job }, 'Job details retrieved');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Query list of active Jobs with pagination, filtering, and text search (Public).
   */
  static listJobs = async (req, res, next) => {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        location,
        locationType,
        jobType,
        experienceLevel,
        companyId,
        skills,
        minSalary,
        maxSalary,
      } = req.query;

      const parsedPage = parseInt(page, 10);
      const parsedLimit = parseInt(limit, 10);
      const skip = (parsedPage - 1) * parsedLimit;

      // Filter active jobs only
      const filter = { status: 'active' };

      // Text Search
      if (search) {
        filter.$text = { $search: search };
      }

      // Location match (case-insensitive regex)
      if (location) {
        filter.location = new RegExp(location.toString(), 'i');
      }

      // Enums match
      if (locationType) filter.locationType = locationType;
      if (jobType) filter.jobType = jobType;
      if (experienceLevel) filter.experienceLevel = experienceLevel;
      if (companyId) filter.company = companyId;

      // Filter by skill IDs (comma-separated query parameter)
      if (skills) {
        const skillIds = skills.toString().split(',');
        filter.skills = { $in: skillIds };
      }

      // Salary Filter
      if (minSalary || maxSalary) {
        filter['salary.isConfidential'] = { $ne: true }; // Filter out confidential salaries
        const salaryFilter = {};
        if (minSalary) salaryFilter.$gte = parseInt(minSalary.toString(), 10);
        if (maxSalary) salaryFilter.$lte = parseInt(maxSalary.toString(), 10);
        
        filter.$or = [
          { 'salary.min': salaryFilter },
          { 'salary.max': salaryFilter },
        ];
      }

      const jobs = await Job.find(filter)
        .populate('company', 'name logo location size industry')
        .populate('skills', 'name')
        .sort(search ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit);

      const total = await Job.countDocuments(filter);

      return ApiResponse.paginated(res, 'Jobs retrieved successfully', jobs, {
        page: parsedPage,
        limit: parsedLimit,
        total,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Fetch paginated list of own posted Jobs (Employer dashboard).
   */
  static getMyJobs = async (req, res, next) => {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const skip = (page - 1) * limit;

      const filter = { postedBy: req.user._id };

      const jobs = await Job.find(filter)
        .populate('skills', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Job.countDocuments(filter);

      return ApiResponse.paginated(res, 'Employer job listings fetched', jobs, {
        page,
        limit,
        total,
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = JobController;
