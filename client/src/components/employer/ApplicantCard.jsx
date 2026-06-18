import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Phone,
  Calendar,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Briefcase,
  FileText,
  UserCheck,
  UserX,
  CalendarPlus,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import HiringPipeline from './HiringPipeline';

export const ApplicantCard = ({
  application,
  onStatusChange,
  onScheduleInterview,
  statusLoading = false,
}) => {
  const [expanded, setExpanded] = useState(false);
  const { candidate, candidateProfile = {}, status, matchScore = 0, matchingSkills = [], missingSkills = [], appliedAt, interview } = application;
  
  // Extract user details
  const user = candidate || {};
  const fullName = user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Anonymous Candidate';
  const initials = user.firstName ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : 'CA';

  const getMatchScoreColor = (score) => {
    if (score >= 70) return 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40';
    if (score >= 40) return 'text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/40';
    return 'text-rose-600 bg-rose-50 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/40';
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

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

  return (
    <Card className="p-5 border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900 text-left overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Left: Avatar & Profile summary */}
        <div className="flex gap-4 items-start min-w-0">
          <div className="h-12 w-12 rounded-full border border-slate-200 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center font-bold text-sm shrink-0">
            {user.avatar?.url ? (
              <img src={user.avatar.url} alt={fullName} className="h-full w-full object-cover rounded-full" />
            ) : (
              initials
            )}
          </div>

          <div className="space-y-1 min-w-0">
            <h4 className="font-bold text-base text-slate-900 dark:text-white truncate leading-tight">
              {fullName}
            </h4>
            <p className="text-xs text-slate-500 dark:text-dark-text-muted font-semibold truncate">
              {candidateProfile.headline || 'Job Seeker'}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-400 text-[11px] pt-0.5">
              {candidateProfile.phone && <span className="flex items-center gap-0.5"><Phone size={12} /> {candidateProfile.phone}</span>}
              <span className="flex items-center gap-0.5"><Mail size={12} /> {user.email}</span>
              <span className="flex items-center gap-0.5"><Clock size={12} /> Applied {formatDate(appliedAt)}</span>
            </div>
          </div>
        </div>

        {/* Right: Resume Score & Match score */}
        <div className="flex flex-wrap items-center gap-4 lg:justify-end shrink-0 pt-3 lg:pt-0 border-t border-slate-100 dark:border-dark-border/40 lg:border-0">
          {/* Match Score widget */}
          <div className={`p-2.5 rounded-xl border flex flex-col items-center justify-center min-w-20 ${getMatchScoreColor(matchScore)}`}>
            <span className="text-[9px] font-bold uppercase tracking-wider opacity-80">Match Score</span>
            <span className="text-lg font-extrabold flex items-center gap-0.5 mt-0.5 leading-none">
              <Sparkles size={14} className="shrink-0" /> {matchScore}%
            </span>
          </div>

          {/* Status Badge */}
          <div className="flex flex-col items-start lg:items-end">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1 leading-none">Current Status</span>
            <Badge variant={getStatusBadgeVariant(status)} className="capitalize font-bold py-1 px-2.5 text-xs">
              {status === 'reviewed' ? 'Under Review' : status === 'interview' ? 'Interviewing' : status}
            </Badge>
          </div>

          {/* Details toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-0.5 text-slate-500 dark:text-dark-text-muted hover:text-slate-800 dark:hover:text-white"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>
        </div>
      </div>

      {/* Skills Match Overview */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-dark-border/40 space-y-2 text-[11px]">
        {matchingSkills.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-wider mr-1">Matching Skills:</span>
            {matchingSkills.slice(0, 5).map((s) => (
              <span key={s} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-sm dark:bg-emerald-950/20 dark:text-emerald-400">
                {s}
              </span>
            ))}
            {matchingSkills.length > 5 && <span className="text-slate-400">+{matchingSkills.length - 5} more</span>}
          </div>
        )}

        {missingSkills.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[9px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wider mr-1">Missing Skills:</span>
            {missingSkills.slice(0, 5).map((s) => (
              <span key={s} className="px-2 py-0.5 bg-amber-50/50 text-amber-700 rounded-sm dark:bg-amber-950/20 dark:text-amber-400">
                {s}
              </span>
            ))}
            {missingSkills.length > 5 && <span className="text-slate-400">+{missingSkills.length - 5} more</span>}
          </div>
        )}
      </div>

      {/* Interview status details box */}
      {status === 'interview' && interview && (
        <div className="mt-4 p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/20 dark:border-indigo-950/30 dark:bg-indigo-950/10 text-xs text-slate-600 dark:text-slate-350 space-y-2">
          <div className="font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1">
            <Calendar size={13} /> Interview Session Scheduled
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <span className="text-slate-400 font-medium mr-1">Date:</span> 
              {formatDate(interview.scheduledDate)} at {interview.scheduledTime || 'TBD'}
            </div>
            <div className="capitalize">
              <span className="text-slate-400 font-medium mr-1">Type:</span> {interview.type}
            </div>
            {interview.meetingLink && (
              <div className="sm:col-span-2">
                <span className="text-slate-400 font-medium mr-1">Meeting Link:</span>
                <a href={interview.meetingLink.startsWith('http') ? interview.meetingLink : `https://${interview.meetingLink}`} target="_blank" rel="noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-0.5 font-bold">
                  Open Meeting Link <ExternalLink size={11} />
                </a>
              </div>
            )}
            {interview.notes && (
              <div className="sm:col-span-2 font-serif text-slate-500 dark:text-slate-400">
                &quot;{interview.notes}&quot;
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Action Buttons Row */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-dark-border/40 flex flex-wrap gap-2.5">
        {/* Shortlist/Reviewed button */}
        {status === 'applied' && (
          <Button
            size="xs"
            variant="outline"
            disabled={statusLoading}
            onClick={() => onStatusChange(application._id, 'reviewed')}
            className="flex items-center gap-1 hover:bg-slate-100"
          >
            Mark Reviewed
          </Button>
        )}

        {['applied', 'reviewed'].includes(status) && (
          <Button
            size="xs"
            variant="primary"
            disabled={statusLoading}
            onClick={() => onStatusChange(application._id, 'shortlisted')}
            className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700"
          >
            <UserCheck size={13} /> Shortlist
          </Button>
        )}

        {/* Schedule interview button */}
        {status === 'shortlisted' && (
          <Button
            size="xs"
            variant="primary"
            disabled={statusLoading}
            onClick={() => onScheduleInterview(application)}
            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700"
          >
            <CalendarPlus size={13} /> Schedule Interview
          </Button>
        )}

        {status === 'interview' && (
          <Button
            size="xs"
            variant="primary"
            disabled={statusLoading}
            onClick={() => onStatusChange(application._id, 'offered')}
            className="flex items-center gap-1 bg-violet-600 hover:bg-violet-700"
          >
            Make Job Offer
          </Button>
        )}

        {status === 'offered' && (
          <Button
            size="xs"
            variant="primary"
            disabled={statusLoading}
            onClick={() => onStatusChange(application._id, 'hired')}
            className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700"
          >
            Mark as Hired
          </Button>
        )}

        {/* Reject Button (Always available if not final status) */}
        {!['rejected', 'withdrawn', 'hired'].includes(status) && (
          <Button
            size="xs"
            variant="outline"
            disabled={statusLoading}
            onClick={() => onStatusChange(application._id, 'rejected')}
            className="flex items-center gap-1 border-rose-300 hover:bg-rose-50 text-rose-700 dark:border-rose-900/40 dark:hover:bg-rose-950/20"
          >
            <UserX size={13} /> Reject
          </Button>
        )}
      </div>

      {/* Expanded Pane: Full summary, experiences, education, certifications */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="pt-5 mt-5 border-t border-slate-100 dark:border-dark-border/40 space-y-5">
              {/* Hiring Pipeline Stage */}
              <HiringPipeline currentStatus={status} />
              
              {/* Resume download / cover letter */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 bg-slate-50 dark:bg-slate-950/35 border border-slate-100 dark:border-dark-border/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="text-primary-500 shrink-0" size={20} />
                  <div>
                    <span className="block text-xs font-bold text-slate-800 dark:text-white">Curriculum Vitae</span>
                    <span className="text-[10px] text-slate-400">Extracted match score {matchScore}%</span>
                  </div>
                </div>
                {application.resumeUrl ? (
                  <a href={application.resumeUrl} target="_blank" rel="noreferrer" className="px-3.5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 select-none">
                    Download Resume <ExternalLink size={12} />
                  </a>
                ) : (
                  <span className="text-xs italic text-slate-400">No file uploaded</span>
                )}
              </div>

              {application.coverLetter && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <MessageSquare size={12} /> Cover Letter Message
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50/50 p-3 rounded-lg border border-slate-100/50 dark:bg-slate-900/50 dark:border-dark-border/45 font-serif italic whitespace-pre-wrap">
                    &quot;{application.coverLetter}&quot;
                  </p>
                </div>
              )}

              {/* Bio Summary */}
              {candidateProfile.summary && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Professional Summary</span>
                  <p className="text-xs text-slate-600 dark:text-slate-350">
                    {candidateProfile.summary}
                  </p>
                </div>
              )}

              {/* Experience */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Briefcase size={12} /> Work Experience
                </span>
                {!candidateProfile.experience || candidateProfile.experience.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No experience history detailed.</p>
                ) : (
                  <div className="space-y-2 pl-3 border-l border-slate-200 dark:border-dark-border">
                    {candidateProfile.experience.map((exp, idx) => (
                      <div key={idx} className="text-xs relative">
                        <span className="absolute -left-[16px] top-1.5 h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-dark-border" />
                        <h5 className="font-bold text-slate-800 dark:text-white leading-tight">{exp.title}</h5>
                        <p className="text-[10px] font-medium text-slate-550 dark:text-dark-text-muted mt-0.5">{exp.company} {exp.location ? `• ${exp.location}` : ''}</p>
                        <p className="text-[9px] text-slate-400">
                          {new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} — {exp.current ? 'Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''}
                        </p>
                        {exp.description && <p className="text-slate-500 mt-1 pl-1 italic">{exp.description}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Education */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <BookOpen size={12} /> Education Background
                </span>
                {!candidateProfile.education || candidateProfile.education.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No education history detailed.</p>
                ) : (
                  <div className="space-y-2 pl-3 border-l border-slate-200 dark:border-dark-border">
                    {candidateProfile.education.map((edu, idx) => (
                      <div key={idx} className="text-xs relative">
                        <span className="absolute -left-[16px] top-1.5 h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-dark-border" />
                        <h5 className="font-bold text-slate-800 dark:text-white leading-tight">{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</h5>
                        <p className="text-[10px] font-medium text-slate-550 dark:text-dark-text-muted mt-0.5">{edu.institution} {edu.grade ? `• Grade: ${edu.grade}` : ''}</p>
                        <p className="text-[9px] text-slate-400">
                          {edu.startDate && new Date(edu.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} — {edu.endDate && new Date(edu.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default ApplicantCard;
