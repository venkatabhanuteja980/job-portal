import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  MapPin,
  Briefcase,
  Clock,
  ChevronDown,
  ChevronUp,
  XCircle,
  ExternalLink,
  Video,
  Phone,
  User
} from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import ApplicationTimeline from './ApplicationTimeline';

export const ApplicationCard = ({ application, onWithdraw, isWithdrawing }) => {
  const [showTimeline, setShowTimeline] = useState(false);
  const { job, status, matchScore, appliedAt, timeline, interview } = application;
  const company = job?.company || {};
  const companyInitials = company.name ? company.name.substring(0, 2).toUpperCase() : 'CO';

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'applied': return 'primary';
      case 'reviewed': return 'warning';
      case 'shortlisted': return 'success';
      case 'interview': return 'info';
      case 'offered': return 'success';
      case 'hired': return 'success';
      case 'rejected': return 'danger';
      case 'withdrawn': return 'danger';
      default: return 'primary';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'applied': return 'Applied';
      case 'reviewed': return 'Under Review';
      case 'shortlisted': return 'Shortlisted';
      case 'interview': return 'Interviewing';
      case 'offered': return 'Offered';
      case 'hired': return 'Hired';
      case 'rejected': return 'Rejected';
      case 'withdrawn': return 'Withdrawn';
      default: return status;
    }
  };

  // Withdraw is allowed if status is not final (hired, rejected, withdrawn, offered)
  const isWithdrawable = !['hired', 'rejected', 'withdrawn', 'offered'].includes(status);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card className="p-5 border-slate-200 dark:border-dark-border text-left overflow-hidden bg-white dark:bg-slate-900">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Job and Company details */}
        <div className="flex gap-4 items-start">
          <div className="h-12 w-12 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center font-bold font-display text-sm shrink-0 border border-slate-200/50 dark:border-dark-border/40">
            {company.logo?.url ? (
              <img src={company.logo.url} alt={company.name} className="h-full w-full object-cover rounded-lg" />
            ) : (
              companyInitials
            )}
          </div>
          
          <div className="space-y-1">
            <h3 className="font-bold text-base text-slate-900 dark:text-white leading-tight">
              {job?.title || 'Unknown Role'}
            </h3>
            <p className="text-xs font-semibold text-slate-500 dark:text-dark-text-muted">
              {company.name || 'Company Profile'}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-400 dark:text-dark-text-muted text-[11px] pt-1">
              <span className="flex items-center gap-0.5"><MapPin size={12} /> {job?.location || 'Remote'}</span>
              <span className="flex items-center gap-0.5 capitalize"><Briefcase size={12} /> {job?.locationType || 'onsite'}</span>
              <span className="flex items-center gap-0.5"><Clock size={12} /> Applied on {formatDate(appliedAt)}</span>
            </div>
          </div>
        </div>

        {/* Status badges and actions */}
        <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t border-slate-100 dark:border-dark-border/40 md:border-0">
          {matchScore !== undefined && (
            <div className="text-right">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Match Score</span>
              <span className={`text-xs font-extrabold ${matchScore >= 70 ? 'text-emerald-500' : matchScore >= 40 ? 'text-amber-500' : 'text-rose-500'}`}>
                {matchScore}%
              </span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Badge variant={getStatusBadgeVariant(status)} className="text-xs py-1 px-2.5 font-bold">
              {getStatusLabel(status)}
            </Badge>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTimeline(!showTimeline)}
              className="flex items-center gap-1 text-slate-500 dark:text-dark-text-muted hover:text-slate-700 dark:hover:text-white"
            >
              {showTimeline ? (
                <>Hide Timeline <ChevronUp size={14} /></>
              ) : (
                <>Show Timeline <ChevronDown size={14} /></>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Render interview scheduled details if applicable */}
      {status === 'interview' && interview && (
        <div className="mt-4 p-4 rounded-xl border border-indigo-100 bg-indigo-50/30 dark:border-indigo-950/40 dark:bg-indigo-950/10 space-y-3">
          <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400 font-bold text-xs">
            <Calendar size={14} /> Interview Scheduled
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-350">
            <div>
              <span className="font-semibold block text-slate-400">Date & Time</span>
              <span>
                {formatDate(interview.scheduledDate)} at {interview.scheduledTime || 'TBD'}
              </span>
            </div>
            <div>
              <span className="font-semibold block text-slate-400">Format</span>
              <span className="flex items-center gap-1 capitalize">
                {interview.type === 'phone' && <Phone size={12} />}
                {interview.type === 'video' && <Video size={12} />}
                {interview.type === 'onsite' && <User size={12} />}
                {interview.type || 'standard'}
              </span>
            </div>
            {interview.meetingLink && (
              <div className="md:col-span-2">
                <span className="font-semibold block text-slate-400">Meeting Link</span>
                <a
                  href={interview.meetingLink.startsWith('http') ? interview.meetingLink : `https://${interview.meetingLink}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 dark:text-primary-400 font-bold hover:underline flex items-center gap-1 mt-0.5"
                >
                  Join Meeting <ExternalLink size={12} />
                </a>
              </div>
            )}
            {interview.notes && (
              <div className="md:col-span-2">
                <span className="font-semibold block text-slate-400">Instructions</span>
                <p className="mt-0.5 italic text-slate-500 dark:text-slate-400">{interview.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Expandable Timeline and Actions */}
      <AnimatePresence>
        {showTimeline && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="pt-5 mt-5 border-t border-slate-100 dark:border-dark-border/40">
              <ApplicationTimeline timeline={timeline} />
              
              {isWithdrawable && (
                <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-dark-border/40 mt-4">
                  <Button
                    variant="danger"
                    size="sm"
                    loading={isWithdrawing}
                    onClick={() => onWithdraw(application._id)}
                    className="flex items-center gap-1.5"
                  >
                    <XCircle size={14} /> Withdraw Application
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default ApplicationCard;
