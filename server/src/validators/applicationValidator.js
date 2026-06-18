const { z } = require('zod');
const { APPLICATION_STATUS, INTERVIEW_TYPES } = require('../utils/constants');

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

const applyJobSchema = z.object({
  jobId: objectIdSchema,
  coverLetter: z
    .string()
    .trim()
    .max(2000, 'Cover letter cannot exceed 2000 characters')
    .optional()
    .nullable(),
  resumeUrl: z
    .string()
    .trim()
    .url('Invalid resume URL')
    .optional()
    .nullable(),
});

const updateApplicationStatusSchema = z.object({
  status: z.enum(Object.values(APPLICATION_STATUS), {
    errorMap: () => ({ message: 'Invalid application status' }),
  }),
  note: z
    .string()
    .trim()
    .max(500, 'Note cannot exceed 500 characters')
    .optional()
    .nullable(),
});

const scheduleInterviewSchema = z.object({
  scheduledDate: z.preprocess((val) => new Date(val), z.date({ invalid_type_error: 'Invalid interview date' }))
    .refine((date) => date >= new Date(new Date().setHours(0, 0, 0, 0)), {
      message: 'Interview date cannot be in the past',
    }),
  scheduledTime: z
    .string()
    .trim()
    .min(1, 'Interview time is required')
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]\s?(AM|PM|am|pm)?$/, 'Invalid time format (use HH:MM or HH:MM AM/PM)'),
  type: z.enum(Object.values(INTERVIEW_TYPES), {
    errorMap: () => ({ message: 'Invalid interview type (must be phone, video, or onsite)' }),
  }),
  meetingLink: z
    .string()
    .trim()
    .url('Invalid meeting link URL')
    .or(z.string().length(0))
    .optional()
    .nullable(),
  location: z
    .string()
    .trim()
    .max(200, 'Location description cannot exceed 200 characters')
    .optional()
    .nullable(),
  notes: z
    .string()
    .trim()
    .max(1000, 'Interview notes cannot exceed 1000 characters')
    .optional()
    .nullable(),
}).refine((data) => data.type !== 'video' || (data.meetingLink && data.meetingLink.length > 0), {
  message: 'Meeting link is required for video interviews',
  path: ['meetingLink'],
}).refine((data) => data.type !== 'onsite' || (data.location && data.location.length > 0), {
  message: 'Location is required for onsite interviews',
  path: ['location'],
});

module.exports = {
  applyJobSchema,
  updateApplicationStatusSchema,
  scheduleInterviewSchema,
};
