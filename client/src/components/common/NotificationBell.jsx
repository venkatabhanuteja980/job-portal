import React, { useEffect, useCallback, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck, Trash2, X, Briefcase, UserCheck, Star, Info, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import notificationApi from '../../api/notificationApi';
import {
  setNotifications,
  markRead,
  markAllRead,
  removeNotification,
  clearReadItems,
  setUnreadCount,
} from '../../store/notificationSlice';

// ── Notification Type Icons ────────────────────────────────────────────────
const TYPE_ICONS = {
  application: Briefcase,
  interview: UserCheck,
  job_match: Star,
  system: Info,
  alert: AlertTriangle,
};

const TYPE_COLORS = {
  application: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20',
  interview: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20',
  job_match: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20',
  system: 'text-slate-500 bg-slate-100 dark:bg-slate-800',
  alert: 'text-rose-500 bg-rose-50 dark:bg-rose-950/20',
};

const NotificationItem = ({ notif, onRead, onDelete }) => {
  const Icon = TYPE_ICONS[notif.type] || Info;
  const colorClass = TYPE_COLORS[notif.type] || TYPE_COLORS.system;
  const timeAgo = (dateStr) => {
    const diff = (Date.now() - new Date(dateStr)) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`flex items-start gap-3 px-4 py-3.5 rounded-xl border transition-colors cursor-default group
        ${!notif.isRead
          ? 'bg-indigo-50/60 dark:bg-indigo-950/10 border-indigo-100 dark:border-indigo-900/40'
          : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-dark-border/40'
        }`}
    >
      {/* Icon */}
      <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
        <Icon size={17} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-0.5">
        <p className={`text-sm leading-snug ${!notif.isRead ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
          {notif.title || notif.message}
        </p>
        {notif.body && (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{notif.body}</p>
        )}
        <p className="text-[10px] text-slate-400 pt-0.5">
          {notif.createdAt ? timeAgo(notif.createdAt) : ''}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {!notif.isRead && (
          <button
            onClick={() => onRead(notif._id)}
            title="Mark as read"
            className="p-1 rounded-lg text-indigo-500 hover:bg-indigo-100 dark:hover:bg-indigo-950/30 transition-colors"
          >
            <Check size={13} />
          </button>
        )}
        <button
          onClick={() => onDelete(notif._id)}
          title="Delete"
          className="p-1 rounded-lg text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-500 transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Unread dot */}
      {!notif.isRead && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-indigo-500 shrink-0" />
      )}
    </motion.div>
  );
};

// ── Notification Bell (used in Navbar) ────────────────────────────────────
export const NotificationBell = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, unreadCount, loading } = useSelector((s) => s.notifications);
  const { user } = useSelector((s) => s.auth);
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const POLL_INTERVAL = 60_000; // 1 min polling

  const fetchUnread = useCallback(async () => {
    if (!user) return;
    try {
      const res = await notificationApi.getUnreadCount();
      dispatch(setUnreadCount(res.data?.count ?? 0));
    } catch {
      // Silent
    }
  }, [dispatch, user]);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await notificationApi.getNotifications({ limit: 15, page: 1 });
      const d = res.data || {};
      dispatch(setNotifications({
        notifications: d.notifications || [],
        unreadCount: d.unreadCount ?? unreadCount,
        hasMore: d.hasMore ?? false,
      }));
    } catch {
      // Silent
    }
  }, [dispatch, user, unreadCount]);

  // Poll unread count every minute
  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  // Click outside to close
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => {
    setOpen((prev) => {
      if (!prev) fetchNotifications();
      return !prev;
    });
  };

  const handleRead = async (id) => {
    dispatch(markRead(id));
    try { await notificationApi.markAsRead(id); } catch { /* silent */ }
  };

  const handleMarkAll = async () => {
    dispatch(markAllRead());
    try { await notificationApi.markAllAsRead(); } catch { /* silent */ }
  };

  const handleDelete = async (id) => {
    dispatch(removeNotification(id));
    try { await notificationApi.deleteNotification(id); } catch { /* silent */ }
  };

  const handleClearRead = async () => {
    // Collect IDs of read items before clearing them from state
    const readIds = items.filter((n) => n.isRead).map((n) => n._id);
    dispatch(clearReadItems());
    try { await notificationApi.clearRead(readIds); } catch { /* silent */ }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        id="notification-bell"
        aria-label="Notifications"
        onClick={handleOpen}
        className={`relative flex items-center justify-center h-9 w-9 rounded-xl transition-colors
          ${open
            ? 'bg-indigo-100 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400'
            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'
          }`}
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <motion.span
            key={unreadCount}
            initial={{ scale: 0.6 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center leading-none"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-11 z-50 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-dark-border overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-dark-border/40">
              <div className="flex items-center gap-2">
                <Bell size={15} className="text-indigo-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-black bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAll}
                    title="Mark all read"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <CheckCheck size={14} />
                  </button>
                )}
                <button
                  onClick={handleClearRead}
                  title="Clear read"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-[400px] overflow-y-auto overscroll-contain p-2 space-y-1.5">
              {loading ? (
                <div className="flex items-center justify-center py-8 text-slate-400 text-xs">Loading…</div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <Bell size={28} className="text-slate-200 dark:text-slate-700" />
                  <p className="text-xs text-slate-400">You are all caught up!</p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {items.map((n) => (
                    <NotificationItem
                      key={n._id}
                      notif={n}
                      onRead={handleRead}
                      onDelete={handleDelete}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-slate-100 dark:border-dark-border/40">
              <button
                onClick={() => { setOpen(false); navigate('/notifications'); }}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                View all notifications →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
