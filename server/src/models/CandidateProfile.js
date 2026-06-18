/**
 * @module models/CandidateProfile
 * @description Candidate profile model storing professional details, work history,
 * education, certifications, resume data, job preferences, and saved jobs.
 * Linked 1-to-1 with a User document (role: 'candidate').
 */

const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [150, 'Job title cannot exceed 150 characters'],
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [200, 'Company name cannot exceed 200 characters'],
    },
    location: {
      type: String,
      trim: true,
      maxlength: [150, 'Location cannot exceed 150 characters'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
    },
    current: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
  },
  { _id: true }
);

const educationSchema = new mongoose.Schema(
  {
    institution: {
      type: String,
      required: [true, 'Institution name is required'],
      trim: true,
      maxlength: [200, 'Institution name cannot exceed 200 characters'],
    },
    degree: {
      type: String,
      required: [true, 'Degree is required'],
      trim: true,
      maxlength: [150, 'Degree cannot exceed 150 characters'],
    },
    fieldOfStudy: {
      type: String,
      trim: true,
      maxlength: [150, 'Field of study cannot exceed 150 characters'],
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    grade: {
      type: String,
      trim: true,
      maxlength: [50, 'Grade cannot exceed 50 characters'],
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
  },
  { _id: true }
);

const certificationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Certification name is required'],
      trim: true,
      maxlength: [200, 'Certification name cannot exceed 200 characters'],
    },
    issuer: {
      type: String,
      trim: true,
      maxlength: [200, 'Issuer name cannot exceed 200 characters'],
    },
    issueDate: {
      type: Date,
    },
    expiryDate: {
      type: Date,
    },
    credentialId: {
      type: String,
      trim: true,
      maxlength: [100, 'Credential ID cannot exceed 100 characters'],
    },
    credentialUrl: {
      type: String,
      trim: true,
    },
  },
  { _id: true }
);

const languageSchema = new mongoose.Schema(
  {
    language: {
      type: String,
      trim: true,
      maxlength: [50, 'Language name cannot exceed 50 characters'],
    },
    proficiency: {
      type: String,
      enum: {
        values: ['basic', 'conversational', 'proficient', 'fluent', 'native'],
        message: '{VALUE} is not a valid proficiency level',
      },
    },
  },
  { _id: true }
);

const candidateProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [15, 'Phone number cannot exceed 15 characters'],
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: {
        values: ['male', 'female', 'other', 'prefer-not-to-say'],
        message: '{VALUE} is not a valid gender option',
      },
    },
    address: {
      street: { type: String, trim: true, maxlength: 200 },
      city: { type: String, trim: true, maxlength: 100 },
      state: { type: String, trim: true, maxlength: 100 },
      country: { type: String, trim: true, maxlength: 100 },
      zipCode: { type: String, trim: true, maxlength: 20 },
    },
    headline: {
      type: String,
      trim: true,
      maxlength: [200, 'Professional headline cannot exceed 200 characters'],
    },
    summary: {
      type: String,
      maxlength: [2000, 'Summary cannot exceed 2000 characters'],
    },
    skills: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill',
      },
    ],
    customSkills: [
      {
        type: String,
        trim: true,
        maxlength: [100, 'Custom skill name cannot exceed 100 characters'],
      },
    ],
    totalExperience: {
      type: Number,
      default: 0,
      min: [0, 'Total experience cannot be negative'],
    },
    experience: [experienceSchema],
    education: [educationSchema],
    certifications: [certificationSchema],
    languages: [languageSchema],
    resumeUrl: {
      type: String,
    },
    resumePublicId: {
      type: String,
    },
    resumeOriginalName: {
      type: String,
      trim: true,
    },
    parsedResume: {
      rawText: { type: String },
      extractedName: { type: String },
      extractedEmail: { type: String },
      extractedPhone: { type: String },
      extractedSkills: [{ type: String }],
      extractedEducation: [{ type: mongoose.Schema.Types.Mixed }],
      extractedExperience: [{ type: mongoose.Schema.Types.Mixed }],
      parsedAt: { type: Date },
    },
    linkedinUrl: {
      type: String,
      trim: true,
    },
    portfolioUrl: {
      type: String,
      trim: true,
    },
    githubUrl: {
      type: String,
      trim: true,
    },
    profileCompletion: {
      type: Number,
      default: 0,
      min: [0, 'Profile completion cannot be below 0'],
      max: [100, 'Profile completion cannot exceed 100'],
    },
    jobPreferences: {
      desiredTitle: {
        type: String,
        trim: true,
        maxlength: [150, 'Desired title cannot exceed 150 characters'],
      },
      desiredLocations: [
        {
          type: String,
          trim: true,
        },
      ],
      desiredSalary: {
        min: { type: Number, min: 0 },
        max: { type: Number, min: 0 },
        currency: { type: String, default: 'INR', trim: true },
      },
      desiredJobType: [
        {
          type: String,
          enum: {
            values: ['full-time', 'part-time', 'contract', 'internship', 'freelance'],
            message: '{VALUE} is not a valid job type',
          },
        },
      ],
      remotePreference: {
        type: String,
        enum: {
          values: ['onsite', 'remote', 'hybrid', 'any'],
          message: '{VALUE} is not a valid remote preference',
        },
        default: 'any',
      },
      noticePeriod: {
        type: String,
        trim: true,
        maxlength: [50, 'Notice period cannot exceed 50 characters'],
      },
    },
    savedJobs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
      },
    ],
    searchable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Indexes
candidateProfileSchema.index({ skills: 1 });
candidateProfileSchema.index({ 'address.city': 1 });
candidateProfileSchema.index({ searchable: 1 });

/**
 * Calculate the total years of experience from the experience array.
 * Sums the duration of each experience entry in years.
 * @returns {number} Total experience in years (rounded to 1 decimal place)
 */
candidateProfileSchema.methods.calculateTotalExperience = function () {
  if (!this.experience || this.experience.length === 0) {
    this.totalExperience = 0;
    return 0;
  }

  let totalMonths = 0;
  for (const exp of this.experience) {
    const start = new Date(exp.startDate);
    const end = exp.current ? new Date() : exp.endDate ? new Date(exp.endDate) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const months = diffMs / (1000 * 60 * 60 * 24 * 30.44);
    if (months > 0) {
      totalMonths += months;
    }
  }

  const totalYears = Math.round((totalMonths / 12) * 10) / 10;
  this.totalExperience = totalYears;
  return totalYears;
};

/**
 * Calculate profile completion percentage based on filled sections.
 * Requires the associated User document to check name/avatar.
 *
 * Breakdown:
 * - firstName/lastName (from user): 10%
 * - phone: 5%
 * - headline: 10%
 * - skills (>0): 15%
 * - experience (>0): 20%
 * - education (>0): 15%
 * - resume uploaded: 15%
 * - profile picture (from user avatar): 10%
 *
 * @param {Object} user - The associated User document
 * @returns {number} Profile completion percentage (0-100)
 */
candidateProfileSchema.methods.calculateProfileCompletion = function (user) {
  let completion = 0;

  // firstName/lastName from User (10%)
  if (user && user.firstName && user.lastName) {
    completion += 10;
  }

  // phone (5%)
  if (this.phone && this.phone.trim().length > 0) {
    completion += 5;
  }

  // headline (10%)
  if (this.headline && this.headline.trim().length > 0) {
    completion += 10;
  }

  // skills > 0 (15%)
  if (
    (this.skills && this.skills.length > 0) ||
    (this.customSkills && this.customSkills.length > 0)
  ) {
    completion += 15;
  }

  // experience > 0 (20%)
  if (this.experience && this.experience.length > 0) {
    completion += 20;
  }

  // education > 0 (15%)
  if (this.education && this.education.length > 0) {
    completion += 15;
  }

  // resume uploaded (15%)
  if (this.resumeUrl) {
    completion += 15;
  }

  // profile picture from user avatar (10%)
  if (user && user.avatar && user.avatar.url) {
    completion += 10;
  }

  this.profileCompletion = completion;
  return completion;
};

module.exports = mongoose.model('CandidateProfile', candidateProfileSchema);
