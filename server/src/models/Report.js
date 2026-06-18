/**
 * @module models/Report
 * @description Report model for content moderation. Allows users to flag
 * jobs, users, or companies for admin review. Tracks resolution workflow
 * including who resolved and the resolution outcome.
 */

const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporter reference is required'],
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Target ID is required'],
    },
    targetType: {
      type: String,
      enum: {
        values: ['job', 'user', 'company'],
        message: '{VALUE} is not a valid target type',
      },
      required: [true, 'Target type is required'],
    },
    reason: {
      type: String,
      enum: {
        values: ['spam', 'fake', 'inappropriate', 'misleading', 'duplicate', 'other'],
        message: '{VALUE} is not a valid report reason',
      },
      required: [true, 'Report reason is required'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'reviewing', 'resolved', 'dismissed'],
        message: '{VALUE} is not a valid report status',
      },
      default: 'pending',
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    resolution: {
      type: String,
      trim: true,
      maxlength: [500, 'Resolution cannot exceed 500 characters'],
    },
    resolvedAt: {
      type: Date,
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
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ targetType: 1, targetId: 1 });

module.exports = mongoose.model('Report', reportSchema);
