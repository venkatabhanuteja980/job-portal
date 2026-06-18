/**
 * @module models/Application
 * @description Job application model tracking the full lifecycle of a candidate's
 * application from submission through hiring/rejection. Includes status timeline,
 * interview scheduling, skill match scoring, and employer notes.
 */

const mongoose = require('mongoose');

const timelineEntrySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: [true, 'Timeline status is required'],
      trim: true,
    },
    note: {
      type: String,
      trim: true,
      maxlength: [500, 'Note cannot exceed 500 characters'],
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job reference is required'],
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Candidate reference is required'],
    },
    candidateProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CandidateProfile',
      required: [true, 'Candidate profile reference is required'],
    },
    coverLetter: {
      type: String,
      maxlength: [2000, 'Cover letter cannot exceed 2000 characters'],
    },
    resumeUrl: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['applied', 'reviewed', 'shortlisted', 'interview', 'offered', 'hired', 'rejected', 'withdrawn'],
        message: '{VALUE} is not a valid application status',
      },
      default: 'applied',
    },
    matchScore: {
      type: Number,
      min: [0, 'Match score cannot be below 0'],
      max: [100, 'Match score cannot exceed 100'],
    },
    matchingSkills: [
      {
        type: String,
        trim: true,
      },
    ],
    missingSkills: [
      {
        type: String,
        trim: true,
      },
    ],
    timeline: [timelineEntrySchema],
    interview: {
      scheduledDate: {
        type: Date,
      },
      scheduledTime: {
        type: String,
        trim: true,
      },
      type: {
        type: String,
        enum: {
          values: ['phone', 'video', 'onsite'],
          message: '{VALUE} is not a valid interview type',
        },
      },
      meetingLink: {
        type: String,
        trim: true,
      },
      location: {
        type: String,
        trim: true,
        maxlength: [200, 'Interview location cannot exceed 200 characters'],
      },
      notes: {
        type: String,
        maxlength: [1000, 'Interview notes cannot exceed 1000 characters'],
      },
      feedback: {
        type: String,
        maxlength: [2000, 'Interview feedback cannot exceed 2000 characters'],
      },
    },
    employerNotes: {
      type: String,
      select: false,
      maxlength: [2000, 'Employer notes cannot exceed 2000 characters'],
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.__v;
        delete ret.employerNotes;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Compound unique index: one application per candidate per job
applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });
applicationSchema.index({ candidate: 1, status: 1 });
applicationSchema.index({ job: 1, status: 1 });
applicationSchema.index({ appliedAt: -1 });

// Pre-save: push initial timeline entry on creation
applicationSchema.pre('save', function (next) {
  if (this.isNew && (!this.timeline || this.timeline.length === 0)) {
    this.timeline.push({
      status: 'applied',
      date: this.appliedAt || new Date(),
    });
  }
  next();
});

module.exports = mongoose.model('Application', applicationSchema);
