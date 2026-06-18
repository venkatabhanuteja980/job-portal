/**
 * @module models/Company
 * @description Company model representing employer organizations.
 * Stores company details, branding, culture info, and verification status.
 * Slug is auto-generated from the company name on save.
 */

const mongoose = require('mongoose');
const slugify = require('slugify');

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [200, 'Company name cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
    },
    logo: {
      url: { type: String, default: null },
      publicId: { type: String, default: null },
    },
    coverImage: {
      url: { type: String, default: null },
      publicId: { type: String, default: null },
    },
    website: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [15, 'Phone number cannot exceed 15 characters'],
    },
    industry: {
      type: String,
      required: [true, 'Industry is required'],
      trim: true,
      maxlength: [100, 'Industry cannot exceed 100 characters'],
    },
    description: {
      type: String,
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
    },
    headquarters: {
      type: String,
      required: [true, 'Headquarters location is required'],
      trim: true,
      maxlength: [200, 'Headquarters cannot exceed 200 characters'],
    },
    locations: [
      {
        type: String,
        trim: true,
      },
    ],
    size: {
      type: String,
      enum: {
        values: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+'],
        message: '{VALUE} is not a valid company size',
      },
    },
    foundedYear: {
      type: Number,
      min: [1800, 'Founded year cannot be before 1800'],
      max: [new Date().getFullYear(), 'Founded year cannot be in the future'],
    },
    revenue: {
      type: String,
      trim: true,
      maxlength: [100, 'Revenue cannot exceed 100 characters'],
    },
    techStack: [
      {
        type: String,
        trim: true,
        maxlength: [100, 'Tech stack item cannot exceed 100 characters'],
      },
    ],
    benefits: [
      {
        type: String,
        trim: true,
        maxlength: [200, 'Benefit cannot exceed 200 characters'],
      },
    ],
    culture: {
      type: String,
      maxlength: [2000, 'Culture description cannot exceed 2000 characters'],
    },
    socialLinks: {
      linkedin: { type: String, trim: true },
      twitter: { type: String, trim: true },
      facebook: { type: String, trim: true },
      instagram: { type: String, trim: true },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator reference is required'],
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
companySchema.index({ industry: 1 });
companySchema.index({ isVerified: 1 });
companySchema.index({ name: 'text', description: 'text' });

// Pre-save: auto-generate slug from name
companySchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
      trim: true,
    });
  }
  next();
});

module.exports = mongoose.model('Company', companySchema);
