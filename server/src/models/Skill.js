/**
 * @module models/Skill
 * @description Skill model representing a standardized skill entry.
 * Used by candidates to tag their profiles and by jobs to specify required skills.
 * Slug is auto-generated from the skill name. Supports categorization and
 * text search on the name field.
 */

const mongoose = require('mongoose');
const slugify = require('slugify');

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Skill name is required'],
      unique: true,
      trim: true,
      maxlength: [100, 'Skill name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    isActive: {
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
skillSchema.index({ category: 1 });
skillSchema.index({ isActive: 1 });
skillSchema.index({ name: 'text' });

// Pre-save: auto-generate slug from name
skillSchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
      trim: true,
    });
  }
  next();
});

module.exports = mongoose.model('Skill', skillSchema);
