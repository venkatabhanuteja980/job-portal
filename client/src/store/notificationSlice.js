import { createSlice } from '@reduxjs/toolkit';

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    unreadCount: 0,
    loading: false,
    hasMore: true,
    page: 1,
  },
  reducers: {
    setNotifications(state, action) {
      state.items = action.payload.notifications;
      state.unreadCount = action.payload.unreadCount ?? state.unreadCount;
      state.hasMore = action.payload.hasMore ?? false;
    },

    prependNotification(state, action) {
      state.items.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },

    markRead(state, action) {
      const notif = state.items.find((n) => n._id === action.payload);
      if (notif && !notif.isRead) {
        notif.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },

    markAllRead(state) {
      state.items.forEach((n) => { n.isRead = true; });
      state.unreadCount = 0;
    },

    removeNotification(state, action) {
      const idx = state.items.findIndex((n) => n._id === action.payload);
      if (idx !== -1) {
        if (!state.items[idx].isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.items.splice(idx, 1);
      }
    },

    clearReadItems(state) {
      state.items = state.items.filter((n) => !n.isRead);
    },

    setUnreadCount(state, action) {
      state.unreadCount = action.payload;
    },

    setLoading(state, action) {
      state.loading = action.payload;
    },

    appendNotifications(state, action) {
      state.items.push(...action.payload.notifications);
      state.hasMore = action.payload.hasMore ?? false;
      state.page += 1;
    },

    resetNotifications(state) {
      state.items = [];
      state.page = 1;
      state.hasMore = true;
    },
  },
});

export const {
  setNotifications,
  prependNotification,
  markRead,
  markAllRead,
  removeNotification,
  clearReadItems,
  setUnreadCount,
  setLoading,
  appendNotifications,
  resetNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
