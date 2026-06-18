const { z } = require('zod');
const { REPORT_STATUS } = require('../utils/constants');

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

const rejectEmployerSchema = z.object({
  rejectionReason: z
    .string()
    .trim()
    .min(5, 'Rejection reason must be at least 5 characters')
    .max(500, 'Rejection reason cannot exceed 500 characters'),
});

const blockUserSchema = z.object({
  isBlocked: z.boolean({
    required_error: 'isBlocked flag is required',
  }),
});

const resolveReportSchema = z.object({
  status: z.enum([REPORT_STATUS.RESOLVED, REPORT_STATUS.DISMISSED], {
    errorMap: () => ({ message: 'Report resolution status must be resolved or dismissed' }),
  }),
  resolution: z
    .string()
    .trim()
    .min(3, 'Resolution text must be at least 3 characters')
    .max(500, 'Resolution text cannot exceed 500 characters'),
});

const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Category name is required')
    .max(100, 'Category name cannot exceed 100 characters'),
  icon: z
    .string()
    .trim()
    .max(50, 'Icon class name cannot exceed 50 characters')
    .optional()
    .nullable(),
  description: z
    .string()
    .trim()
    .max(500, 'Description cannot exceed 500 characters')
    .optional()
    .nullable(),
  isActive: z.boolean().default(true),
});

const skillSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Skill name is required')
    .max(100, 'Skill name cannot exceed 100 characters'),
  category: objectIdSchema,
  isActive: z.boolean().default(true),
});

module.exports = {
  rejectEmployerSchema,
  blockUserSchema,
  resolveReportSchema,
  categorySchema,
  skillSchema,
};
