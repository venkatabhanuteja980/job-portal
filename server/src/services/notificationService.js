const Notification = require('../models/Notification');
const User = require('../models/User');
const EmailService = require('./emailService');
const ApiError = require('../utils/ApiError');

/**
 * Service to handle creation, retrieval, and management of in-app & email notifications.
 */
class NotificationService {
  /**
   * Creates an in-app notification and optionally triggers an email.
   * 
   * @param {object} params
   * @param {string} params.user - Recipient User ID
   * @param {string} params.title - Notification title
   * @param {string} params.message - Notification message body
   * @param {string} params.type - Enum type of notification
   * @param {string} [params.link] - Redirection URL path
   * @param {object} [params.metadata] - Extra metadata object
   * @param {boolean} [params.sendEmail=true] - Whether to send a matching email if applicable
   * @returns {Promise<object>} Created notification database object
   */
  static async createNotification({ user: userId, title, message, type, link, metadata, sendEmail = true }) {
    try {
      // 1. Create in-app notification in DB
      const notification = await Notification.create({
        user: userId,
        title,
        message,
        type,
        link,
        metadata,
      });

      // 2. Fetch user details for potential email delivery
      if (sendEmail) {
        // Send email in the background asynchronously
        User.findById(userId)
          .then(async (userObj) => {
            if (!userObj || userObj.isBlocked) return;

            const name = userObj.fullName;
            const email = userObj.email;

            // Trigger emails based on type
            if (type === 'interview_invite' && metadata && metadata.interview) {
              const { jobTitle, companyName, date, time, type: interviewType, meetingLink, location, notes } = metadata.interview;
              await EmailService.sendInterviewScheduledEmail({
                email,
                name,
                jobTitle,
                companyName,
                date,
                time,
                type: interviewType,
                link: meetingLink,
                location,
                notes,
              });
            } else if (type === 'application_update' && metadata && metadata.application) {
              const { jobTitle, companyName, status, note } = metadata.application;
              // Reject emails are optional or not sent in some systems, but status updates are sent
              await EmailService.sendApplicationStatusEmail(email, name, jobTitle, companyName, status, note);
            } else if (type === 'account' && metadata && metadata.suspension) {
              await EmailService.sendAccountSuspendedEmail(email, name, metadata.suspension.reason);
            } else if (type === 'system' || type === 'employer_alert' || type === 'job_alert') {
              // Standard notification email template fallback
              await EmailService.sendEmail({
                to: email,
                subject: title,
                html: EmailService._getEmailTemplate(title, `
                  <h2>Hello ${name},</h2>
                  <p>${message}</p>
                  ${link ? `<div style="text-align: center;"><a href="${process.env.CLIENT_URL || 'http://localhost:5173'}${link}" class="button" target="_blank">View Details</a></div>` : ''}
                `),
              });
            }
          })
          .catch((err) => {
            console.error(`Background email delivery failure for notification ${notification._id}:`, err.message);
          });
      }

      return notification;
    } catch (error) {
      console.error('Failed to create notification:', error.message);
      throw ApiError.internal(`Failed to create notification: ${error.message}`);
    }
  }

  /**
   * Fetches paginated list of notifications for a user.
   */
  static async getUserNotifications(userId, { page = 1, limit = 20, isRead } = {}) {
    const filter = { user: userId };
    if (isRead !== undefined) {
      filter.isRead = isRead;
    }

    try {
      const skip = (page - 1) * limit;
      const notifications = await Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Notification.countDocuments(filter);

      return {
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw ApiError.internal(`Failed to fetch notifications: ${error.message}`);
    }
  }

  /**
   * Marks a notification as read.
   */
  static async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOne({ _id: notificationId, user: userId });
      if (!notification) {
        throw ApiError.notFound('Notification not found');
      }

      await notification.markAsRead();
      return notification;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.internal(`Failed to mark notification as read: ${error.message}`);
    }
  }

  /**
   * Marks all unread notifications for a user as read.
   */
  static async markAllAsRead(userId) {
    try {
      await Notification.updateMany(
        { user: userId, isRead: false },
        { $set: { isRead: true, readAt: new Date() } }
      );
      return { success: true, message: 'All notifications marked as read' };
    } catch (error) {
      throw ApiError.internal(`Failed to mark all notifications as read: ${error.message}`);
    }
  }

  /**
   * Gets unread notification count.
   */
  static async getUnreadCount(userId) {
    try {
      const count = await Notification.countDocuments({ user: userId, isRead: false });
      return { unreadCount: count };
    } catch (error) {
      throw ApiError.internal(`Failed to get unread count: ${error.message}`);
    }
  }

  /**
   * Deletes a specific notification.
   */
  static async deleteNotification(notificationId, userId) {
    try {
      const result = await Notification.deleteOne({ _id: notificationId, user: userId });
      if (result.deletedCount === 0) {
        throw ApiError.notFound('Notification not found or access denied');
      }
      return { success: true, message: 'Notification deleted successfully' };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.internal(`Failed to delete notification: ${error.message}`);
    }
  }
}

module.exports = NotificationService;
