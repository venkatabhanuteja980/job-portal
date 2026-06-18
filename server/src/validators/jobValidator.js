const { z } = require('zod');
const { LOCATION_TYPES, EXPERIENCE_LEVELS, JOB_TYPES, JOB_STATUS } = require('../utils/constants');

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

const createJobSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Job title is required')
    .max(150, 'Job title cannot exceed 150 characters'),
  description: z
    .string()
    .trim()
    .min(10, 'Job description must be at least 10 characters')
    .max(5000, 'Job description cannot exceed 5000 characters'),
  requirements: z
    .array(z.string().trim())
    .min(1, 'At least one requirement is required'),
  responsibilities: z
    .array(z.string().trim())
    .optional()
    .default([]),
  skills: z
    .array(objectIdSchema)
    .min(1, 'At least one skill is required'),
  customSkills: z
    .array(z.string().trim())
    .optional()
    .default([]),
  company: objectIdSchema,
  location: z
    .string()
    .trim()
    .min(1, 'Location is required'),
  locationType: z.enum(Object.values(LOCATION_TYPES), {
    errorMap: () => ({ message: 'Invalid location type (must be onsite, remote, or hybrid)' }),
  }),
  salary: z
    .object({
      min: z.number().nonnegative('Salary min must be non-negative').optional().nullable(),
      max: z.number().nonnegative('Salary max must be non-negative').optional().nullable(),
      currency: z.string().trim().default('INR'),
      isNegotiable: z.boolean().default(false),
      isConfidential: z.boolean().default(false),
    })
    .optional()
    .refine((data) => !data || data.min === undefined || data.max === undefined || data.min === null || data.max === null || data.min <= data.max, {
      message: 'Maximum salary must be greater than or equal to minimum salary',
      path: ['max'],
    }),
  experienceLevel: z.enum(Object.values(EXPERIENCE_LEVELS), {
    errorMap: () => ({ message: 'Invalid experience level' }),
  }),
  experienceRequired: z
    .object({
      min: z.number().nonnegative().default(0),
      max: z.number().nonnegative().optional().nullable(),
    })
    .optional()
    .refine((data) => !data || data.max === undefined || data.max === null || data.min <= data.max, {
      message: 'Maximum experience must be greater than or equal to minimum experience',
      path: ['max'],
    }),
  educationRequired: z
    .string()
    .trim()
    .min(1, 'Education requirement is required'),
  jobType: z.enum(Object.values(JOB_TYPES), {
    errorMap: () => ({ message: 'Invalid job type' }),
  }),
  category: objectIdSchema,
  status: z.enum(Object.values(JOB_STATUS)).default(JOB_STATUS.ACTIVE),
  deadline: z.preprocess((val) => (val ? new Date(val) : null), z.date().nullable().optional())
    .refine((date) => !date || date > new Date(), {
      message: 'Deadline must be a date in the future',
    }),
  openings: z
    .number()
    .int('Openings must be an integer')
    .min(1, 'Must have at least 1 opening')
    .default(1),
  benefits: z
    .array(z.string().trim())
    .optional()
    .default([]),
  tags: z
    .array(z.string().trim())
    .optional()
    .default([]),
});

const updateJobSchema = createJobSchema.partial().extend({
  // Override company to be optional on updates (since it is immutable/rarely modified)
  company: objectIdSchema.optional(),
  category: objectIdSchema.optional(),
});

const updateJobStatusSchema = z.object({
  status: z.enum([JOB_STATUS.ACTIVE, JOB_STATUS.CLOSED, JOB_STATUS.DRAFT], {
    errorMap: () => ({ message: 'Invalid status update option' }),
  }),
});

module.exports = {
  createJobSchema,
  updateJobSchema,
  updateJobStatusSchema,
};
