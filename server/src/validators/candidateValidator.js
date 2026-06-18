const { z } = require('zod');
const { GENDERS, LANGUAGE_PROFICIENCIES, JOB_TYPES, LOCATION_TYPES } = require('../utils/constants');

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

const addressSchema = z.object({
  street: z.string().trim().optional().nullable(),
  city: z.string().trim().min(1, 'City is required').optional(),
  state: z.string().trim().min(1, 'State is required').optional(),
  country: z.string().trim().min(1, 'Country is required').optional(),
  zipCode: z.string().trim().optional().nullable(),
}).optional();

const experienceItemSchema = z.object({
  title: z.string().trim().min(1, 'Job title is required'),
  company: z.string().trim().min(1, 'Company name is required'),
  location: z.string().trim().optional().nullable(),
  startDate: z.preprocess((val) => new Date(val), z.date({ invalid_type_error: 'Invalid start date' })),
  endDate: z.preprocess((val) => (val ? new Date(val) : null), z.date().nullable().optional()),
  current: z.boolean().default(false),
  description: z.string().trim().max(1000, 'Description cannot exceed 1000 characters').optional().nullable(),
}).refine((data) => data.current || data.endDate, {
  message: 'End date is required if you are not currently working here',
  path: ['endDate'],
}).refine((data) => !data.endDate || data.startDate <= data.endDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

const educationItemSchema = z.object({
  institution: z.string().trim().min(1, 'Institution is required'),
  degree: z.string().trim().min(1, 'Degree is required'),
  fieldOfStudy: z.string().trim().optional().nullable(),
  startDate: z.preprocess((val) => (val ? new Date(val) : null), z.date().nullable().optional()),
  endDate: z.preprocess((val) => (val ? new Date(val) : null), z.date().nullable().optional()),
  grade: z.string().trim().optional().nullable(),
  description: z.string().trim().optional().nullable(),
}).refine((data) => !data.startDate || !data.endDate || data.startDate <= data.endDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

const certificationItemSchema = z.object({
  name: z.string().trim().min(1, 'Certification name is required'),
  issuer: z.string().trim().optional().nullable(),
  issueDate: z.preprocess((val) => (val ? new Date(val) : null), z.date().nullable().optional()),
  expiryDate: z.preprocess((val) => (val ? new Date(val) : null), z.date().nullable().optional()),
  credentialId: z.string().trim().optional().nullable(),
  credentialUrl: z.string().url('Invalid credential URL').or(z.string().length(0)).optional().nullable(),
}).refine((data) => !data.issueDate || !data.expiryDate || data.issueDate <= data.expiryDate, {
  message: 'Expiry date must be after issue date',
  path: ['expiryDate'],
});

const languageItemSchema = z.object({
  language: z.string().trim().min(1, 'Language is required'),
  proficiency: z.enum(LANGUAGE_PROFICIENCIES, {
    errorMap: () => ({ message: 'Invalid proficiency level' }),
  }),
});

const jobPreferencesSchema = z.object({
  desiredTitle: z.string().trim().optional().nullable(),
  desiredLocations: z.array(z.string().trim()).optional().default([]),
  desiredSalary: z.object({
    min: z.number().nonnegative().optional().nullable(),
    max: z.number().nonnegative().optional().nullable(),
    currency: z.string().trim().default('INR'),
  }).optional().refine((data) => !data || data.min === undefined || data.max === undefined || data.min === null || data.max === null || data.min <= data.max, {
    message: 'Maximum salary must be greater than or equal to minimum salary',
    path: ['max'],
  }),
  desiredJobType: z.array(z.enum(Object.values(JOB_TYPES))).optional().default([]),
  remotePreference: z.enum(Object.values(LOCATION_TYPES)).optional().default(LOCATION_TYPES.ONSITE),
  noticePeriod: z.string().trim().optional().nullable(),
}).optional();

const updateCandidateProfileSchema = z.object({
  phone: z.string().trim().max(15, 'Phone number cannot exceed 15 characters').optional().nullable(),
  dateOfBirth: z.preprocess((val) => (val ? new Date(val) : null), z.date().nullable().optional()),
  gender: z.enum(GENDERS).optional().nullable(),
  address: addressSchema,
  headline: z.string().trim().max(200, 'Headline cannot exceed 200 characters').optional().nullable(),
  summary: z.string().trim().max(2000, 'Summary cannot exceed 2000 characters').optional().nullable(),
  skills: z.array(objectIdSchema).optional().default([]),
  customSkills: z.array(z.string().trim()).optional().default([]),
  experience: z.array(experienceItemSchema).optional().default([]),
  education: z.array(educationItemSchema).optional().default([]),
  certifications: z.array(certificationItemSchema).optional().default([]),
  languages: z.array(languageItemSchema).optional().default([]),
  linkedinUrl: z.string().url('Invalid LinkedIn URL').or(z.string().length(0)).optional().nullable(),
  portfolioUrl: z.string().url('Invalid Portfolio URL').or(z.string().length(0)).optional().nullable(),
  githubUrl: z.string().url('Invalid GitHub URL').or(z.string().length(0)).optional().nullable(),
  jobPreferences: jobPreferencesSchema,
  searchable: z.boolean().optional(),
});

module.exports = {
  updateCandidateProfileSchema,
  addressSchema,
  experienceItemSchema,
  educationItemSchema,
  certificationItemSchema,
  languageItemSchema,
  jobPreferencesSchema,
};
