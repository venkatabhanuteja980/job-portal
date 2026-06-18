import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ChevronLeft, RefreshCw } from 'lucide-react';
import employerApi from '../../api/employerApi';
import jobApi from '../../api/jobApi';
import ApplicantCard from '../../components/employer/ApplicantCard';
import ApplicantFilters from '../../components/employer/ApplicantFilters';
import InterviewScheduler from '../../components/employer/InterviewScheduler';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';

export const Applicants = () => {
  const navigate = useNavigate();
  const { id: jobId } = useParams(); // Retrieves jobId from route param ':id'
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters state
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [minMatchScore, setMinMatchScore] = useState(0);
  const [sortBy, setSortBy] = useState('matchScore-desc');

  // Interview modal state
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [schedulerLoading, setSchedulerLoading] = useState(false);

  const loadJobAndApplicants = async () => {
    setLoading(true);
    setError(null);
    try {
      const [jobRes, appsRes] = await Promise.all([
        jobApi.getJobDetails(jobId),
        employerApi.getJobApplicants(jobId),
      ]);
      setJob(jobRes.data?.job || jobRes.data || null);
      setApplicants(appsRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to retrieve job applicants.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobAndApplicants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const handleStatusChange = async (applicationId, newStatus) => {
    setStatusLoading(true);
    try {
      await employerApi.updateApplicationStatus(applicationId, newStatus);
      // Reload candidates
      const appsRes = await employerApi.getJobApplicants(jobId);
      setApplicants(appsRes.data || []);
    } catch (err) {
      alert(err.message || 'Failed to update candidate status.');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleOpenScheduler = (application) => {
    setSelectedApplication(application);
    setIsSchedulerOpen(true);
  };

  const handleScheduleSubmit = async (applicationId, interviewData) => {
    setSchedulerLoading(true);
    try {
      // 1. Save scheduled interview meeting coordinates
      await employerApi.scheduleInterview(applicationId, interviewData);
      // 2. Transition candidate application status to 'interview'
      await employerApi.updateApplicationStatus(applicationId, 'interview', 'Interview scheduled');
      
      setIsSchedulerOpen(false);
      setSelectedApplication(null);

      // Reload
      const appsRes = await employerApi.getJobApplicants(jobId);
      setApplicants(appsRes.data || []);
    } catch (err) {
      alert(err.message || 'Failed to schedule interview.');
    } finally {
      setSchedulerLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatus('all');
    setMinMatchScore(0);
    setSortBy('matchScore-desc');
  };

  // Filter and Sort Applicants
  const filteredApplicants = applicants
    .filter((app) => {
      const cand = app.candidate || {};
      const profile = app.candidateProfile || {};
      const fullName = `${cand.firstName || ''} ${cand.lastName || ''}`.toLowerCase();
      
      const matchesSearch =
        fullName.includes(search.toLowerCase()) ||
        profile.headline?.toLowerCase().includes(search.toLowerCase()) ||
        (profile.skills && profile.skills.some(s => s.name?.toLowerCase().includes(search.toLowerCase()))) ||
        (app.matchingSkills && app.matchingSkills.some(s => s.toLowerCase().includes(search.toLowerCase())));

      if (!matchesSearch) return false;

      // Match Score slider filter
      if (app.matchScore < minMatchScore) return false;

      // Status dropdown filter
      if (status !== 'all' && app.status !== status) return false;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'matchScore-desc') return b.matchScore - a.matchScore;
      if (sortBy === 'matchScore-asc') return a.matchScore - b.matchScore;
      if (sortBy === 'appliedAt-desc') return new Date(b.appliedAt) - new Date(a.appliedAt);
      if (sortBy === 'appliedAt-asc') return new Date(a.appliedAt) - new Date(b.appliedAt);
      return 0;
    });

  if (loading && !job) {
    return (
      <div className="space-y-6 py-4">
        <LoadingSkeleton type="profile" count={1} />
        <LoadingSkeleton type="table" count={1} />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadJobAndApplicants} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6 py-4 text-left max-w-4xl mx-auto"
    >
      <Helmet>
        <title>Job Applicants | Hiring Workspace</title>
      </Helmet>

      {/* Header navigations */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/employer/jobs')}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 dark:border-dark-border dark:hover:bg-slate-800 text-slate-505 hover:text-slate-700 dark:hover:text-white shrink-0 cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight font-display text-slate-900 dark:text-white leading-tight">
              Review Applicants
            </h1>
            <p className="text-sm text-slate-500 mt-1 dark:text-dark-text-muted">
              Role: <span className="font-bold text-slate-700 dark:text-white">{job?.title || 'Job Listing'}</span>
            </p>
          </div>
        </div>

        <button
          onClick={loadJobAndApplicants}
          className="p-2 rounded-lg border border-slate-250 hover:bg-slate-50 dark:border-dark-border dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-white shrink-0 cursor-pointer"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Filters */}
      <ApplicantFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        minMatchScore={minMatchScore}
        onMinMatchScoreChange={setMinMatchScore}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        onReset={handleResetFilters}
      />

      {/* Applicants List */}
      <div className="space-y-4">
        {filteredApplicants.length === 0 ? (
          <EmptyState
            title="No applicants match criteria"
            description={
              search || status !== 'all' || minMatchScore > 0
                ? 'Try resetting the filters or widening your search parameters.'
                : 'No candidates have applied to this vacancy yet.'
            }
          />
        ) : (
          filteredApplicants.map((app) => (
            <ApplicantCard
              key={app._id}
              application={app}
              onStatusChange={handleStatusChange}
              onScheduleInterview={handleOpenScheduler}
              statusLoading={statusLoading}
            />
          ))
        )}
      </div>

      {/* Scheduler modal overlay */}
      <InterviewScheduler
        isOpen={isSchedulerOpen}
        onClose={() => {
          setIsSchedulerOpen(false);
          setSelectedApplication(null);
        }}
        onSubmit={handleScheduleSubmit}
        application={selectedApplication}
        loading={schedulerLoading}
      />
    </motion.div>
  );
};

export default Applicants;
