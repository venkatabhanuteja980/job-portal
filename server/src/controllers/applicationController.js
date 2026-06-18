const Application = require('../models/Application');
const Job = require('../models/Job');
const CandidateProfile = require('../models/CandidateProfile');
const Company = require('../models/Company');
const JobMatcherService = require('../services/jobMatcherService');
const NotificationService = require('../services/notificationService');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Controller for managing Job Applications and Interview scheduling.
 */
class ApplicationController {
  /**
   * Apply for a Job (Candidate only).
   */
  static applyJob = async (req, res, next) => {
    try {
      const { jobId, coverLetter, resumeUrl } = req.body;

      // 1. Get candidate profile
      const candidateProfile = await CandidateProfile.findOne({ userId: req.user._id });
      if (!candidateProfile) {
        throw ApiError.badRequest('You must complete your Candidate profile before applying');
      }

      // 2. Get job details
      const job = await Job.findById(jobId);
      if (!job) {
        throw ApiError.notFound('Job listing not found');
      }

      if (job.status !== 'active') {
        throw ApiError.badRequest('This job listing is no longer active');
      }

      // 3. Check for existing application
      const existingApplication = await Application.findOne({
        job: jobId,
        candidate: req.user._id,
      });

      if (existingApplication) {
        throw ApiError.conflict('You have already applied for this job');
      }

      // 4. Determine which resume to use
      const selectedResumeUrl = resumeUrl || candidateProfile.resumeUrl;
      if (!selectedResumeUrl) {
        throw ApiError.badRequest('Please upload a resume in your profile or provide a resume link to apply');
      }

      // 5. Calculate match score and skill sets using Job Matcher Service
      const matchData = await JobMatcherService.calculateMatch(candidateProfile, job);

      // 6. Create application
      const application = new Application({
        job: jobId,
        candidate: req.user._id,
        candidateProfile: candidateProfile._id,
        coverLetter,
        resumeUrl: selectedResumeUrl,
        matchScore: matchData.matchScore,
        matchingSkills: matchData.matchingSkills,
        missingSkills: matchData.missingSkills,
      });

      await application.save();

      // 7. Increment applicant count on Job
      job.applicantCount = (job.applicantCount || 0) + 1;
      await job.save();

      // 8. Notify employer
      await NotificationService.createNotification({
        user: job.postedBy,
        title: 'New Job Application',
        message: `${req.user.fullName} has applied for your job post "${job.title}"`,
        type: 'employer_alert',
        link: `/employer/applications/${application._id}`,
        metadata: {
          applicationId: application._id,
          jobId: job._id,
          candidateName: req.user.fullName,
        },
      });

      return ApiResponse.created(res, { application }, 'Application submitted successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Withdraw an Application (Candidate only).
   */
  static withdrawApplication = async (req, res, next) => {
    try {
      const { id } = req.params;

      const application = await Application.findById(id);
      if (!application) {
        throw ApiError.notFound('Application not found');
      }

      // Verify ownership
      if (application.candidate.toString() !== req.user._id.toString()) {
        throw ApiError.forbidden('You are not authorized to withdraw this application');
      }

      if (application.status === 'withdrawn') {
        throw ApiError.badRequest('Application is already withdrawn');
      }

      // Update status and timeline
      application.status = 'withdrawn';
      application.timeline.push({
        status: 'withdrawn',
        note: 'Application withdrawn by candidate',
        updatedBy: req.user._id,
        date: new Date(),
      });

      await application.save();

      // Decrement applicant count on job
      const job = await Job.findById(application.job);
      if (job) {
        if (job.applicantCount > 0) {
          job.applicantCount -= 1;
          await job.save();
        }

        // Notify employer of withdrawal
        await NotificationService.createNotification({
          user: job.postedBy,
          title: 'Application Withdrawn',
          message: `${req.user.fullName} has withdrawn their application for "${job.title}"`,
          type: 'employer_alert',
          link: `/employer/jobs/${job._id}`,
          metadata: {
            jobId: job._id,
            candidateName: req.user.fullName,
          },
        });
      }

      return ApiResponse.success(res, { application }, 'Application withdrawn successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update Application Status (Employer/Admin only).
   */
  static updateStatus = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status, note } = req.body;

      const application = await Application.findById(id).populate('job');
      if (!application) {
        throw ApiError.notFound('Application not found');
      }

      // Verify authorization: logged in user must be the employer who posted the job, or an admin
      if (
        application.job.postedBy.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin'
      ) {
        throw ApiError.forbidden('You are not authorized to update status on this application');
      }

      if (application.status === 'withdrawn') {
        throw ApiError.badRequest('Cannot update status of a withdrawn application');
      }

      // Update status and timeline
      application.status = status;
      application.timeline.push({
        status,
        note: note || `Status updated to ${status}`,
        updatedBy: req.user._id,
        date: new Date(),
      });

      await application.save();

      // Retrieve company name
      const company = await Company.findById(application.job.company);
      const companyName = company ? company.name : 'Employer';

      // Send status update notification to Candidate
      await NotificationService.createNotification({
        user: application.candidate,
        title: 'Application Update',
        message: `Your application status for "${application.job.title}" at ${companyName} has been updated to "${status}".`,
        type: 'application_update',
        link: `/candidate/applications/${application._id}`,
        metadata: {
          application: {
            jobTitle: application.job.title,
            companyName,
            status,
            note: note || '',
          },
        },
      });

      return ApiResponse.success(res, { application }, `Application status updated to ${status}`);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Schedule an Interview (Employer/Admin only).
   */
  static scheduleInterview = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { scheduledDate, scheduledTime, type, meetingLink, location, notes } = req.body;

      const application = await Application.findById(id).populate('job');
      if (!application) {
        throw ApiError.notFound('Application not found');
      }

      // Verify authorization: job poster or admin
      if (
        application.job.postedBy.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin'
      ) {
        throw ApiError.forbidden('You are not authorized to schedule interviews for this application');
      }

      if (application.status === 'withdrawn' || application.status === 'rejected') {
        throw ApiError.badRequest(`Cannot schedule interview for application in "${application.status}" status`);
      }

      // Set interview details
      application.status = 'interview';
      application.interview = {
        scheduledDate,
        scheduledTime,
        type,
        meetingLink,
        location,
        notes,
      };

      // Add timeline entry
      application.timeline.push({
        status: 'interview',
        note: `Interview scheduled (${type}) on ${new Date(scheduledDate).toLocaleDateString()} at ${scheduledTime}`,
        updatedBy: req.user._id,
        date: new Date(),
      });

      await application.save();

      // Retrieve company details
      const company = await Company.findById(application.job.company);
      const companyName = company ? company.name : 'Employer';

      // Send interview notification and email to Candidate
      await NotificationService.createNotification({
        user: application.candidate,
        title: 'Interview Scheduled',
        message: `You have been invited for an interview for "${application.job.title}" at ${companyName}.`,
        type: 'interview_invite',
        link: `/candidate/applications/${application._id}`,
        metadata: {
          interview: {
            jobTitle: application.job.title,
            companyName,
            date: scheduledDate,
            time: scheduledTime,
            type,
            meetingLink: meetingLink || '',
            location: location || '',
            notes: notes || '',
          },
        },
      });

      return ApiResponse.success(res, { application }, 'Interview scheduled successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * View Applicants for a specific Job (Employer/Admin only).
   */
  static viewApplicants = async (req, res, next) => {
    try {
      const { jobId } = req.params;
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const skip = (page - 1) * limit;

      const job = await Job.findById(jobId);
      if (!job) {
        throw ApiError.notFound('Job listing not found');
      }

      // Verify authorization
      if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        throw ApiError.forbidden('You are not authorized to view applicants for this job');
      }

      const filter = { job: jobId };

      // Optional status filter
      if (req.query.status) {
        filter.status = req.query.status;
      }

      // Optional minimum match score filter
      if (req.query.minScore) {
        filter.matchScore = { $gte: parseInt(req.query.minScore, 10) };
      }

      const applications = await Application.find(filter)
        .populate('candidate', 'firstName lastName email avatar')
        .populate('candidateProfile', 'headline phone skills totalExperience')
        .sort({ matchScore: -1, appliedAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Application.countDocuments(filter);

      return ApiResponse.paginated(res, 'Applicants list retrieved successfully', applications, {
        page,
        limit,
        total,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * View Candidate's own Applications (Candidate only).
   */
  static viewCandidateApplications = async (req, res, next) => {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const skip = (page - 1) * limit;

      const filter = { candidate: req.user._id };

      // Optional status filter
      if (req.query.status) {
        filter.status = req.query.status;
      }

      const applications = await Application.find(filter)
        .populate({
          path: 'job',
          select: 'title location jobType salary status',
          populate: { path: 'company', select: 'name logo industry' },
        })
        .sort({ appliedAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Application.countDocuments(filter);

      return ApiResponse.paginated(res, 'Applications retrieved successfully', applications, {
        page,
        limit,
        total,
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = ApplicationController;
