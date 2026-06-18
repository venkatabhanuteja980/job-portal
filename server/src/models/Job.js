/**
 * @module models/Job
 * @description Job posting model with full listing details including salary,
 * experience requirements, skills, location, and application tracking.
 * Slug is auto-generated from title with a random 6-char suffix for uniqueness.
 */

const mongoose = require('mongoose');
const crypto = require('crypto');
const slugify = require('slugify');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [150, 'Job title cannot exceed 150 characters'],
    },
    slug: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    requirements: [
      {
        type: String,
        trim: true,
      },
    ],
    responsibilities: [
      {
        type: String,
        trim: true,
      },
    ],
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
        maxlength: [100, 'Custom skill cannot exceed 100 characters'],
      },
    ],
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company reference is required'],
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Posted by reference is required'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters'],
    },
    locationType: {
      type: String,
      enum: {
        values: ['onsite', 'remote', 'hybrid'],
        message: '{VALUE} is not a valid location type',
      },
      default: 'onsite',
    },
    salary: {
      min: {
        type: Number,
        min: [0, 'Minimum salary cannot be negative'],
      },
      max: {
        type: Number,
        min: [0, 'Maximum salary cannot be negative'],
      },
      currency: {
        type: String,
        default: 'INR',
        trim: true,
      },
      isNegotiable: {
        type: Boolean,
        default: false,
      },
      isConfidential: {
        type: Boolean,
        default: false,
      },
    },
    experienceLevel: {
      type: String,
      enum: {
        values: ['entry', 'mid', 'senior', 'lead', 'executive'],
        message: '{VALUE} is not a valid experience level',
      },
    },
    experienceRequired: {
      min: {
        type: Number,
        default: 0,
        min: [0, 'Minimum experience cannot be negative'],
      },
      max: {
        type: Number,
        min: [0, 'Maximum experience cannot be negative'],
      },
    },
    educationRequired: {
      type: String,
      trim: true,
      maxlength: [200, 'Education requirement cannot exceed 200 characters'],
    },
    jobType: {
      type: String,
      enum: {
        values: ['full-time', 'part-time', 'contract', 'internship', 'freelance'],
        message: '{VALUE} is not a valid job type',
      },
      required: [true, 'Job type is required'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    status: {
      type: String,
      enum: {
        values: ['draft', 'active', 'closed', 'expired'],
        message: '{VALUE} is not a valid status',
      },
      default: 'active',
    },
    deadline: {
      type: Date,
    },
    openings: {
      type: Number,
      default: 1,
      min: [1, 'At least 1 opening is required'],
    },
    applicantCount: {
      type: Number,
      default: 0,
      min: [0, 'Applicant count cannot be negative'],
    },
    views: {
      type: Number,
      default: 0,
      min: [0, 'View count cannot be negative'],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    benefits: [
      {
        type: String,
        trim: true,
        maxlength: [200, 'Benefit cannot exceed 200 characters'],
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
        maxlength: [50, 'Tag cannot exceed 50 characters'],
      },
    ],
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

// Indexes for query performance
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ company: 1 });
jobSchema.index({ postedBy: 1 });
jobSchema.index({ skills: 1 });
jobSchema.index({ category: 1 });
jobSchema.index({ location: 1, locationType: 1 });
jobSchema.index({ jobType: 1, experienceLevel: 1 });
jobSchema.index({ 'salary.min': 1, 'salary.max': 1 });
jobSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Pre-save: auto-generate slug from title + random 6-char suffix
jobSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    const suffix = crypto.randomBytes(3).toString('hex'); // 6 hex characters
    this.slug = `${slugify(this.title, { lower: true, strict: true, trim: true })}-${suffix}`;
  }
  next();
});

module.exports = mongoose.model('Job', jobSchema);
