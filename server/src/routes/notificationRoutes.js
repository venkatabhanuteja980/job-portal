const express = require('express');
const NotificationController = require('../controllers/notificationController');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { getNotificationsQuerySchema } = require('../validators/notificationValidator');

const router = express.Router();

// All notification routes require authenticated session
router.use(authenticate);

// Get user notifications (paginated)
router.get('/', validate(getNotificationsQuerySchema, 'query'), NotificationController.getNotifications);

// Mark all unread notifications as read
router.patch('/read-all', NotificationController.markAllRead);

// Get total count of unread notifications
router.get('/unread-count', NotificationController.getUnreadCount);

// Mark specific notification as read
router.patch('/:id/read', NotificationController.markRead);

// Delete specific notification
router.delete('/:id', NotificationController.deleteNotification);

module.exports = router;
