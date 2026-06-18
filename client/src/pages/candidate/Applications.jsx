import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Search, RefreshCw } from 'lucide-react';
import candidateApi from '../../api/candidateApi';
import ApplicationCard from '../../components/candidate/ApplicationCard';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';

export const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtering and Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [withdrawingId, setWithdrawingId] = useState(null);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await candidateApi.getMyApplications();
      // Inspect if data is in response.data or response.data.applications
      const list = response.data || [];
      setApplications(list);
    } catch (err) {
      setError(err.message || 'Failed to retrieve job applications history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleWithdraw = async (applicationId) => {
    if (!window.confirm('Are you sure you want to withdraw this application? This action cannot be undone.')) {
      return;
    }
    
    setWithdrawingId(applicationId);
    try {
      await candidateApi.withdrawApplication(applicationId);
      // Reload applications to get the new status and updated timeline
      await fetchApplications();
    } catch (err) {
      alert(err.message || 'Failed to withdraw application.');
    } finally {
      setWithdrawingId(null);
    }
  };

  const statusTabs = [
    { value: 'all', label: 'All Applications' },
    { value: 'applied', label: 'Applied' },
    { value: 'reviewed', label: 'Under Review' },
    { value: 'shortlisted', label: 'Shortlisted' },
    { value: 'interview', label: 'Interview' },
    { value: 'offered', label: 'Offered/Hired' }, // Will match both offered and hired statuses
    { value: 'rejected', label: 'Rejected' },
    { value: 'withdrawn', label: 'Withdrawn' },
  ];

  // Filter application list based on search term and status tab selection
  const filteredApplications = applications.filter((app) => {
    const job = app.job || {};
    const company = job.company || {};
    
    const matchesSearch =
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.name?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedStatus === 'all') return true;
    if (selectedStatus === 'offered') {
      return app.status === 'offered' || app.status === 'hired';
    }
    return app.status === selectedStatus;
  });

  if (loading && applications.length === 0) {
    return (
      <div className="space-y-6 py-4">
        <LoadingSkeleton type="table" count={1} />
        <LoadingSkeleton type="card" count={2} />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchApplications} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6 py-4 text-left max-w-4xl mx-auto"
    >
      <Helmet>
        <title>My Applications | Candidate Tracker</title>
        <meta name="description" content="View and track your submitted job applications and interview schedules." />
      </Helmet>

      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight font-display text-slate-900 dark:text-white">
          Applications Tracker
        </h1>
        <p className="text-sm text-slate-500 dark:text-dark-text-muted mt-1">
          Monitor your status progress from submission to hire.
        </p>
      </div>

      {/* Search and Filters Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by job title or company name..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-350 dark:bg-slate-950 dark:border-dark-border rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-600 focus:border-primary-600"
          />
        </div>
        
        {/* Force refetch button */}
        <button
          onClick={fetchApplications}
          className="px-3.5 py-2 rounded-lg border border-slate-300 dark:border-dark-border hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-white flex items-center justify-center gap-1.5 text-xs font-bold shrink-0 cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh History
        </button>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex overflow-x-auto pb-1 gap-2 border-b border-slate-250 dark:border-dark-border/40 scrollbar-none">
        {statusTabs.map((tab) => {
          const isActive = selectedStatus === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setSelectedStatus(tab.value)}
              className={`px-4 py-2 border-b-2 font-display text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                  : 'border-transparent text-slate-450 hover:text-slate-700 dark:text-slate-450 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Applications list */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <EmptyState
            title="No applications found"
            description={
              searchTerm || selectedStatus !== 'all'
                ? 'Try adjusting your search criteria or status filter.'
                : 'You have not applied to any job openings yet.'
            }
          />
        ) : (
          filteredApplications.map((app) => (
            <ApplicationCard
              key={app._id}
              application={app}
              onWithdraw={handleWithdraw}
              isWithdrawing={withdrawingId === app._id}
            />
          ))
        )}
      </div>
    </motion.div>
  );
};

export default Applications;
