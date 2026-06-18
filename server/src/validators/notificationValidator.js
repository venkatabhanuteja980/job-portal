const { z } = require('zod');
const { NOTIFICATION_TYPES } = require('../utils/constants');

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

const createNotificationSchema = z.object({
  user: objectIdSchema,
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(200, 'Title cannot exceed 200 characters'),
  message: z
    .string()
    .trim()
    .min(1, 'Message is required')
    .max(500, 'Message cannot exceed 500 characters'),
  type: z.enum(Object.values(NOTIFICATION_TYPES), {
    errorMap: () => ({ message: 'Invalid notification type' }),
  }),
  link: z
    .string()
    .trim()
    .max(255, 'Redirect link cannot exceed 255 characters')
    .optional()
    .nullable(),
  metadata: z
    .record(z.any())
    .optional(),
});

const getNotificationsQuerySchema = z.object({
  page: z.preprocess((val) => (val ? parseInt(val, 10) : 1), z.number().int().min(1).default(1)),
  limit: z.preprocess((val) => (val ? parseInt(val, 10) : 20), z.number().int().min(1).max(100).default(20)),
  isRead: z.preprocess((val) => {
    if (val === 'true') return true;
    if (val === 'false') return false;
    return undefined;
  }, z.boolean().optional()),
});

module.exports = {
  createNotificationSchema,
  getNotificationsQuerySchema,
};
