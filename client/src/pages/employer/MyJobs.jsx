import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Users, Eye, Calendar, ToggleLeft, ToggleRight, ArrowRight } from 'lucide-react';
import employerApi from '../../api/employerApi';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';

export const MyJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionId, setActionId] = useState(null); // ID of job undergoing state changes

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await employerApi.getMyJobs();
      // Response returns paginated jobs: { data: Array, pagination }
      // The API wrapper resolves response.data directly
      const list = response.data || [];
      setJobs(list);
    } catch (err) {
      setError(err.message || 'Failed to retrieve posted vacancies list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleToggleStatus = async (job, e) => {
    e.stopPropagation();
    setActionId(job._id);
    const newStatus = job.status === 'active' ? 'closed' : 'active';
    try {
      await employerApi.updateJobStatus(job._id, newStatus);
      // Update local state
      setJobs((prev) =>
        prev.map((j) => (j._id === job._id ? { ...j, status: newStatus } : j))
      );
    } catch (err) {
      alert(err.message || 'Failed to change job status.');
    } finally {
      setActionId(null);
    }
  };

  const handleDeleteJob = async (jobId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this job posting? This will remove all associated applications.')) {
      return;
    }
    setActionId(jobId);
    try {
      await employerApi.deleteJob(jobId);
      // Remove from local state
      setJobs((prev) => prev.filter((j) => j._id !== jobId));
    } catch (err) {
      alert(err.message || 'Failed to delete job posting.');
    } finally {
      setActionId(null);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'closed': return 'danger';
      case 'draft': return 'warning';
      case 'expired': return 'danger';
      default: return 'primary';
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="space-y-6 py-4">
        <LoadingSkeleton type="card" count={3} />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchJobs} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6 py-4 text-left max-w-4xl mx-auto"
    >
      <Helmet>
        <title>Manage Jobs | Employer Workspace</title>
      </Helmet>

      {/* Header title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight font-display text-slate-900 dark:text-white">
            My Job Postings
          </h1>
          <p className="text-sm text-slate-500 dark:text-dark-text-muted mt-1">
            Manage your published job listings, active status and review applicants.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/employer/jobs/new')}
          className="flex items-center gap-1 shrink-0"
        >
          <Plus size={16} /> Post a Job
        </Button>
      </div>

      {jobs.length === 0 ? (
        <EmptyState
          title="No job postings yet"
          description="Create and publish your first job listing to start receiving candidate applications."
          actionLabel="Post a Job"
          onAction={() => navigate('/employer/jobs/new')}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {jobs.map((job) => {
            const isPendingAction = actionId === job._id;
            
            return (
              <Card
                key={job._id}
                hoverable
                onClick={() => navigate(`/employer/jobs/${job._id}/applicants`)}
                className="p-5 border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left"
              >
                <div className="space-y-3 min-w-0">
                  {/* Job Title and status badge */}
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white truncate leading-tight">
                      {job.title}
                    </h3>
                    <Badge variant={getStatusBadgeVariant(job.status)} className="capitalize font-bold py-0.5 px-2 text-[10px]">
                      {job.status}
                    </Badge>
                  </div>

                  {/* Core Card metrics required by prompt (Views, Applicants, Status, Posted Date) */}
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-slate-400 dark:text-dark-text-muted text-xs">
                    <span className="flex items-center gap-1">
                      <Eye size={14} /> <span className="font-bold text-slate-600 dark:text-slate-350">{job.views || 0}</span> views
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={14} /> <span className="font-bold text-slate-600 dark:text-slate-350">{job.applicantCount || 0}</span> applicants
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} /> Posted {formatDate(job.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Right actions panel */}
                <div className="flex flex-wrap items-center gap-2.5 sm:justify-end shrink-0 pt-3 sm:pt-0 border-t border-slate-100 dark:border-dark-border/40 sm:border-0">
                  {/* Status toggle action */}
                  <Button
                    size="xs"
                    variant="outline"
                    disabled={isPendingAction}
                    onClick={(e) => handleToggleStatus(job, e)}
                    className="flex items-center gap-1 text-slate-600 dark:text-slate-350"
                  >
                    {job.status === 'active' ? (
                      <>
                        <ToggleRight size={15} className="text-emerald-500" /> Close Post
                      </>
                    ) : (
                      <>
                        <ToggleLeft size={15} className="text-slate-400" /> Reopen
                      </>
                    )}
                  </Button>

                  {/* Edit action */}
                  <Button
                    size="xs"
                    variant="outline"
                    disabled={isPendingAction}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/employer/jobs/${job._id}/edit`);
                    }}
                    className="p-1.5 hover:bg-slate-50 text-slate-600 dark:text-slate-350"
                  >
                    <Edit2 size={13} />
                  </Button>

                  {/* Delete action */}
                  <Button
                    size="xs"
                    variant="outline"
                    disabled={isPendingAction}
                    onClick={(e) => handleDeleteJob(job._id, e)}
                    className="p-1.5 border-rose-300 hover:bg-rose-50 text-rose-600 dark:border-rose-900/40 dark:hover:bg-rose-950/20"
                  >
                    <Trash2 size={13} />
                  </Button>

                  {/* View Applicants details */}
                  <Button
                    size="xs"
                    variant="primary"
                    onClick={() => navigate(`/employer/jobs/${job._id}/applicants`)}
                    className="flex items-center gap-1 font-bold text-xs"
                  >
                    Applicants <ArrowRight size={12} />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default MyJobs;
