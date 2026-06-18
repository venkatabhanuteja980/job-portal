import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, AlertCircle, Award, Calendar, RefreshCw } from 'lucide-react';

export const ApplicationTimeline = ({ timeline = [] }) => {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="text-center py-6 text-slate-500 dark:text-dark-text-muted text-sm">
        No history log available.
      </div>
    );
  }

  // Sort timeline chronologically (oldest first for reading top-to-bottom)
  const sortedTimeline = [...timeline].sort((a, b) => new Date(a.date) - new Date(b.date));

  const getStatusIcon = (status) => {
    switch (status) {
      case 'applied':
        return <Clock size={16} className="text-blue-500" />;
      case 'reviewed':
        return <RefreshCw size={16} className="text-amber-500" />;
      case 'shortlisted':
        return <CheckCircle2 size={16} className="text-emerald-500" />;
      case 'interview':
        return <Calendar size={16} className="text-indigo-500" />;
      case 'offered':
      case 'hired':
        return <Award size={16} className="text-violet-500" />;
      case 'rejected':
      case 'withdrawn':
        return <AlertCircle size={16} className="text-rose-500" />;
      default:
        return <Clock size={16} className="text-slate-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'applied':
        return 'border-blue-500 bg-blue-50 dark:bg-blue-950/20';
      case 'reviewed':
        return 'border-amber-500 bg-amber-50 dark:bg-amber-950/20';
      case 'shortlisted':
        return 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20';
      case 'interview':
        return 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20';
      case 'offered':
      case 'hired':
        return 'border-violet-500 bg-violet-50 dark:bg-violet-950/20';
      case 'rejected':
      case 'withdrawn':
        return 'border-rose-500 bg-rose-50 dark:bg-rose-950/20';
      default:
        return 'border-slate-500 bg-slate-50 dark:bg-slate-900';
    }
  };

  const formatStatusText = (status) => {
    switch (status) {
      case 'applied': return 'Application Submitted';
      case 'reviewed': return 'Application Under Review';
      case 'shortlisted': return 'Shortlisted for Interview';
      case 'interview': return 'Interview Scheduled';
      case 'offered': return 'Job Offer Extended';
      case 'hired': return 'Officially Hired';
      case 'rejected': return 'Application Rejected';
      case 'withdrawn': return 'Application Withdrawn';
      default: return status;
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="relative pl-6 border-l border-slate-200 dark:border-dark-border space-y-6 text-left my-4 ml-3">
      {sortedTimeline.map((step, idx) => {
        return (
          <motion.div
            key={step._id || idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.1 }}
            className="relative"
          >
            {/* Timeline Marker node icon */}
            <span
              className={`absolute -left-[35px] top-0.5 h-6.5 w-6.5 rounded-full border-2 flex items-center justify-center shrink-0 z-10 ${getStatusColor(
                step.status
              )}`}
            >
              {getStatusIcon(step.status)}
            </span>

            {/* Content box details */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5">
                <h4 className="text-sm font-bold text-slate-800 dark:text-white capitalize">
                  {formatStatusText(step.status)}
                </h4>
                <span className="text-[10px] font-medium text-slate-400 dark:text-dark-text-muted">
                  {formatDate(step.date)}
                </span>
              </div>
              
              {step.note && (
                <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-md mt-1 border border-slate-100 dark:border-dark-border/40">
                  {step.note}
                </p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ApplicationTimeline;
