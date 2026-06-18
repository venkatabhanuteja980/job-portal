import axiosClient from './axiosClient';

export const notificationApi = {
  // Backend: GET /notifications  (paginated)
  getNotifications: async (params = {}) => {
    const response = await axiosClient.get('/notifications', { params });
    return response.data;
  },

  // Backend: GET /notifications/unread-count
  getUnreadCount: async () => {
    const response = await axiosClient.get('/notifications/unread-count');
    return response.data;
  },

  // Backend: PATCH /notifications/:id/read
  markAsRead: async (id) => {
    const response = await axiosClient.patch(`/notifications/${id}/read`);
    return response.data;
  },

  // Backend: PATCH /notifications/read-all
  markAllAsRead: async () => {
    const response = await axiosClient.patch('/notifications/read-all');
    return response.data;
  },

  // Backend: DELETE /notifications/:id
  deleteNotification: async (id) => {
    const response = await axiosClient.delete(`/notifications/${id}`);
    return response.data;
  },

  // NOTE: No bulk DELETE /notifications/clear-read endpoint exists on backend.
  // This is handled client-side only via Redux clearReadItems action.
  // Individual read notifications are deleted one-by-one via deleteNotification.
  clearRead: async (readIds = []) => {
    if (!readIds.length) return;
    // Fire-and-forget individual deletes in parallel
    await Promise.allSettled(
      readIds.map((id) => axiosClient.delete(`/notifications/${id}`))
    );
  },
};

export default notificationApi;
