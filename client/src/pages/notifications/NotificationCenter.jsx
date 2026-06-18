import React, { useEffect, useCallback, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  Bell, CheckCheck, Trash2, Briefcase,
  UserCheck, Star, Info, AlertTriangle, Filter
} from 'lucide-react';
import notificationApi from '../../api/notificationApi';
import {
  setNotifications,
  appendNotifications,
  markRead,
  markAllRead,
  removeNotification,
  clearReadItems,
  setLoading,
} from '../../store/notificationSlice';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';

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

const TYPE_LABEL = {
  application: 'Application',
  interview: 'Interview',
  job_match: 'Job Match',
  system: 'System',
  alert: 'Alert',
};

const TYPE_FILTER_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'application', label: 'Applications' },
  { value: 'interview', label: 'Interviews' },
  { value: 'job_match', label: 'Job Matches' },
  { value: 'system', label: 'System' },
  { value: 'alert', label: 'Alerts' },
];

const READ_FILTER_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'read', label: 'Read' },
];

const timeAgo = (dateStr) => {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  return new Date(dateStr).toLocaleDateString();
};

export const NotificationCenter = () => {
  const dispatch = useDispatch();
  const { items, loading, hasMore, page, unreadCount } = useSelector((s) => s.notifications);
  const [typeFilter, setTypeFilter] = useState('');
  const [readFilter, setReadFilter] = useState('');
  const [loadingMore, setLoadingMore] = useState(false);

  const filteredItems = items.filter((n) => {
    if (typeFilter && n.type !== typeFilter) return false;
    if (readFilter === 'unread' && n.isRead) return false;
    if (readFilter === 'read' && !n.isRead) return false;
    return true;
  });

  const fetchPage = useCallback(async (pageNum = 1, append = false) => {
    dispatch(setLoading(true));
    try {
      const res = await notificationApi.getNotifications({ page: pageNum, limit: 20 });
      const d = res.data || {};
      if (append) {
        dispatch(appendNotifications({
          notifications: d.notifications || [],
          hasMore: d.hasMore ?? false,
        }));
      } else {
        dispatch(setNotifications({
          notifications: d.notifications || [],
          unreadCount: d.unreadCount ?? 0,
          hasMore: d.hasMore ?? false,
        }));
      }
    } catch {
      // Silent
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  useEffect(() => { fetchPage(1, false); }, [fetchPage]);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    await fetchPage(page, true);
    setLoadingMore(false);
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
    const readIds = items.filter((n) => n.isRead).map((n) => n._id);
    dispatch(clearReadItems());
    try { await notificationApi.clearRead(readIds); } catch { /* silent */ }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6 py-4 max-w-2xl"
    >
      <Helmet>
        <title>Notifications — Job Portal</title>
        <meta name="description" content="Your notification inbox for applications, interviews, and job matches." />
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold font-display text-slate-900 dark:text-white flex items-center gap-2">
            <Bell size={22} className="text-indigo-500" /> Notifications
            {unreadCount > 0 && (
              <span className="text-xs font-black bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-500 dark:text-dark-text-muted mt-0.5">
            Stay updated on your applications, interview invitations, and job matches.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAll} className="flex items-center gap-1.5">
              <CheckCheck size={14} /> Mark all read
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleClearRead} className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/20">
            <Trash2 size={14} /> Clear read
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-3.5 border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <Filter size={15} className="text-slate-400 shrink-0 hidden sm:block" />
          <Select
            id="notif-type-filter"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            options={TYPE_FILTER_OPTIONS}
            className="sm:w-48"
          />
          <Select
            id="notif-read-filter"
            value={readFilter}
            onChange={(e) => setReadFilter(e.target.value)}
            options={READ_FILTER_OPTIONS}
            className="sm:w-36"
          />
          <span className="text-xs text-slate-400 ml-auto">
            {filteredItems.length} notification{filteredItems.length !== 1 ? 's' : ''}
          </span>
        </div>
      </Card>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          <LoadingSkeleton type="card" count={5} />
        </div>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          title="No notifications"
          description={readFilter === 'unread' ? 'You have no unread notifications.' : 'No notifications match your filter.'}
          icon={Bell}
        />
      ) : (
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {filteredItems.map((notif) => {
              const Icon = TYPE_ICONS[notif.type] || Info;
              const colorClass = TYPE_COLORS[notif.type] || TYPE_COLORS.system;
              return (
                <motion.div
                  key={notif._id}
                  layout
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card
                    className={`p-4 border group transition-colors relative
                      ${!notif.isRead
                        ? 'bg-indigo-50/50 dark:bg-indigo-950/10 border-indigo-100 dark:border-indigo-900/40'
                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-dark-border/40'
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
                        <Icon size={18} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {notif.type && (
                            <Badge variant="default" className="text-[9px] px-1.5 py-0.5">
                              {TYPE_LABEL[notif.type] || notif.type}
                            </Badge>
                          )}
                          {!notif.isRead && (
                            <span className="h-2 w-2 rounded-full bg-indigo-500 inline-block" />
                          )}
                          <span className="text-[10px] text-slate-400 ml-auto">
                            {notif.createdAt ? timeAgo(notif.createdAt) : ''}
                          </span>
                        </div>

                        <p className={`text-sm leading-snug ${!notif.isRead ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                          {notif.title || notif.message}
                        </p>

                        {notif.body && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {notif.body}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notif.isRead && (
                          <button
                            onClick={() => handleRead(notif._id)}
                            title="Mark as read"
                            className="p-1.5 rounded-lg text-indigo-500 hover:bg-indigo-100 dark:hover:bg-indigo-950/30 transition-colors"
                          >
                            <CheckCheck size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notif._id)}
                          title="Delete"
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Load More */}
          {hasMore && !typeFilter && !readFilter && (
            <div className="pt-2 text-center">
              <Button variant="outline" size="sm" onClick={handleLoadMore} disabled={loadingMore}>
                {loadingMore ? 'Loading…' : 'Load More'}
              </Button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default NotificationCenter;
