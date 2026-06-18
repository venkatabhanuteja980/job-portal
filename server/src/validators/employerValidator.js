const { z } = require('zod');
const { COMPANY_SIZES } = require('../utils/constants');

const updateEmployerProfileSchema = z.object({
  phone: z
    .string()
    .trim()
    .max(15, 'Phone number cannot exceed 15 characters')
    .optional()
    .nullable(),
  designation: z
    .string()
    .trim()
    .max(100, 'Designation cannot exceed 100 characters')
    .optional()
    .nullable(),
  department: z
    .string()
    .trim()
    .max(100, 'Department cannot exceed 100 characters')
    .optional()
    .nullable(),
});

const companySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Company name is required')
    .max(200, 'Company name cannot exceed 200 characters'),
  website: z
    .string()
    .trim()
    .url('Invalid website URL')
    .or(z.string().length(0))
    .optional()
    .nullable(),
  email: z
    .string()
    .trim()
    .email('Please provide a valid email')
    .or(z.string().length(0))
    .optional()
    .nullable(),
  phone: z
    .string()
    .trim()
    .max(15, 'Phone number cannot exceed 15 characters')
    .optional()
    .nullable(),
  industry: z
    .string()
    .trim()
    .min(1, 'Industry is required'),
  description: z
    .string()
    .trim()
    .max(3000, 'Description cannot exceed 3000 characters')
    .optional()
    .nullable(),
  headquarters: z
    .string()
    .trim()
    .min(1, 'Headquarters location is required'),
  locations: z
    .array(z.string().trim())
    .min(1, 'At least one location is required'),
  size: z.enum(COMPANY_SIZES, {
    errorMap: () => ({ message: 'Invalid company size range' }),
  }),
  foundedYear: z
    .number()
    .int('Founded year must be an integer')
    .min(1700, 'Founded year must be after 1700')
    .max(new Date().getFullYear(), 'Founded year cannot be in the future')
    .optional()
    .nullable(),
  revenue: z
    .string()
    .trim()
    .optional()
    .nullable(),
  techStack: z
    .array(z.string().trim())
    .optional()
    .default([]),
  benefits: z
    .array(z.string().trim())
    .optional()
    .default([]),
  culture: z
    .string()
    .trim()
    .max(2000, 'Culture description cannot exceed 2000 characters')
    .optional()
    .nullable(),
  socialLinks: z
    .object({
      linkedin: z.string().url('Invalid LinkedIn URL').or(z.string().length(0)).optional().nullable(),
      twitter: z.string().url('Invalid Twitter URL').or(z.string().length(0)).optional().nullable(),
      facebook: z.string().url('Invalid Facebook URL').or(z.string().length(0)).optional().nullable(),
      instagram: z.string().url('Invalid Instagram URL').or(z.string().length(0)).optional().nullable(),
    })
    .optional(),
});

module.exports = {
  updateEmployerProfileSchema,
  companySchema,
};
