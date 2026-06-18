import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { MapPin, Briefcase, Trash2, ArrowRight } from 'lucide-react';
import candidateApi from '../../api/candidateApi';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';

export const SavedJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  const fetchSavedJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await candidateApi.getSavedJobs();
      const list = response.data?.savedJobs || response.data || [];
      setJobs(list);
    } catch (err) {
      setError(err.message || 'Failed to retrieve saved jobs list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const handleRemove = async (jobId, e) => {
    e.stopPropagation(); // Avoid navigating to job page
    setRemovingId(jobId);
    try {
      await candidateApi.unsaveJob(jobId);
      // Update state locally
      setJobs((prev) => prev.filter((job) => job._id !== jobId));
    } catch (err) {
      alert(err.message || 'Failed to remove job bookmark.');
    } finally {
      setRemovingId(null);
    }
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="space-y-6 py-4">
        <LoadingSkeleton type="card" count={3} />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchSavedJobs} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6 py-4 text-left max-w-4xl mx-auto"
    >
      <Helmet>
        <title>Saved Jobs | Bookmarks</title>
        <meta name="description" content="View and manage your bookmarked job postings." />
      </Helmet>

      <div>
        <h1 className="text-3xl font-extrabold tracking-tight font-display text-slate-900 dark:text-white">
          Bookmarked Jobs
        </h1>
        <p className="text-sm text-slate-500 dark:text-dark-text-muted mt-1">
          Review and apply to vacancies you saved for later.
        </p>
      </div>

      {jobs.length === 0 ? (
        <EmptyState
          title="No bookmarked jobs"
          description="Browse vacancies and save jobs you are interested in."
          actionLabel="Find Jobs"
          onAction={() => navigate('/jobs')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {jobs.map((job) => {
            const company = job.company || {};
            const companyInitials = company.name ? company.name.substring(0, 2).toUpperCase() : 'CO';
            
            return (
              <Card
                key={job._id}
                hoverable
                onClick={() => navigate(`/jobs/${job._id}`)}
                className="p-5 cursor-pointer flex flex-col justify-between border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900"
              >
                <div className="space-y-4">
                  {/* Header: Logo and Delete */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-sm text-slate-500 shrink-0">
                      {company.logo?.url ? (
                        <img src={company.logo.url} alt={company.name} className="h-full w-full object-cover rounded-lg" />
                      ) : (
                        companyInitials
                      )}
                    </div>
                    
                    <button
                      onClick={(e) => handleRemove(job._id, e)}
                      disabled={removingId === job._id}
                      className="p-1.5 rounded-lg border border-slate-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-dark-border dark:hover:bg-red-950/20 text-slate-400 transition-colors shrink-0"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {/* Title */}
                  <div className="space-y-1">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white leading-tight truncate">
                      {job.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-dark-text-muted font-medium truncate">
                      {company.name || 'Company Profile'}
                    </p>
                  </div>

                  {/* Meta details */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-450 dark:text-dark-text-muted text-[11px]">
                    <span className="flex items-center gap-0.5"><MapPin size={12} /> {job.location}</span>
                    <span className="flex items-center gap-0.5 capitalize"><Briefcase size={12} /> {job.locationType}</span>
                  </div>
                </div>

                {/* Footer action buttons */}
                <div className="flex items-center justify-between pt-4 mt-5 border-t border-slate-100 dark:border-dark-border/40">
                  <Badge variant="primary" className="text-[10px] capitalize font-bold">
                    {job.jobType?.replace('-', ' ')}
                  </Badge>
                  <span className="text-[11px] font-bold text-primary-600 dark:text-primary-400 flex items-center hover:underline">
                    View & Apply <ArrowRight size={12} className="ml-0.5" />
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default SavedJobs;
