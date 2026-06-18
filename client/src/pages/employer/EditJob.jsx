import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { AlertTriangle, ChevronLeft } from 'lucide-react';
import employerApi from '../../api/employerApi';
import jobApi from '../../api/jobApi';
import JobForm from '../../components/employer/JobForm';
import Card from '../../components/common/Card';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

export const EditJob = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobData = async () => {
      setFetching(true);
      try {
        const response = await jobApi.getJobDetails(id);
        // Response contains job: Object
        setJob(response.data?.job || response.data || null);
      } catch (err) {
        setError(err.message || 'Failed to retrieve job details.');
      } finally {
        setFetching(false);
      }
    };
    fetchJobData();
  }, [id]);

  const handleFormSubmit = async (jobData) => {
    setSubmitting(true);
    setError(null);
    try {
      await employerApi.updateJob(id, jobData);
      navigate('/employer/jobs');
    } catch (err) {
      setError(err.message || 'Failed to update job posting.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  if (fetching) {
    return (
      <div className="space-y-6 py-4">
        <LoadingSkeleton type="profile" count={1} />
        <LoadingSkeleton type="card" count={1} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6 py-4 text-left max-w-3xl mx-auto"
    >
      <Helmet>
        <title>Edit Job Posting | Employer Panel</title>
      </Helmet>

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/employer/jobs')}
          className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 dark:border-dark-border dark:hover:bg-slate-800 text-slate-505 hover:text-slate-700 dark:hover:text-white shrink-0 cursor-pointer"
        >
          <ChevronLeft size={16} />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight font-display text-slate-900 dark:text-white">
            Modify Job Posting
          </h1>
          <p className="text-sm text-slate-500 mt-1 dark:text-dark-text-muted">
            Edit target coordinates or description details.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/40 dark:text-rose-450 text-sm font-semibold flex items-center gap-2">
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      {job && (
        <Card className="p-6 border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900">
          <JobForm initialData={job} onSubmit={handleFormSubmit} loading={submitting} />
        </Card>
      )}
    </motion.div>
  );
};

export default EditJob;
