const NotificationService = require('../services/notificationService');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Controller for managing User Notifications.
 */
class NotificationController {
  /**
   * Get paginated notifications for the logged in user.
   */
  static getNotifications = async (req, res, next) => {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      
      let isRead;
      if (req.query.isRead === 'true') isRead = true;
      if (req.query.isRead === 'false') isRead = false;

      const result = await NotificationService.getUserNotifications(req.user._id, {
        page,
        limit,
        isRead,
      });

      return ApiResponse.paginated(res, 'Notifications retrieved successfully', result.notifications, {
        page,
        limit,
        total: result.pagination.total,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Mark a specific notification as read.
   */
  static markRead = async (req, res, next) => {
    try {
      const { id } = req.params;
      const notification = await NotificationService.markAsRead(id, req.user._id);

      return ApiResponse.success(res, { notification }, 'Notification marked as read');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Mark all unread notifications of the user as read.
   */
  static markAllRead = async (req, res, next) => {
    try {
      const result = await NotificationService.markAllAsRead(req.user._id);

      return ApiResponse.success(res, null, result.message);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete a specific notification.
   */
  static deleteNotification = async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await NotificationService.deleteNotification(id, req.user._id);

      return ApiResponse.success(res, null, result.message);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get total count of unread notifications.
   */
  static getUnreadCount = async (req, res, next) => {
    try {
      const result = await NotificationService.getUnreadCount(req.user._id);

      return ApiResponse.success(res, { unreadCount: result.unreadCount }, 'Unread count fetched');
    } catch (error) {
      next(error);
    }
  };
}

module.exports = NotificationController;
