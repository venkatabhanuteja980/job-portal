import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { AlertTriangle, ChevronLeft } from 'lucide-react';
import employerApi from '../../api/employerApi';
import JobForm from '../../components/employer/JobForm';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

export const PostJob = () => {
  const navigate = useNavigate();
  const [hasCompany, setHasCompany] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkCompanyLink = async () => {
      setLoadingProfile(true);
      try {
        const response = await employerApi.getCompany();
        const comp = response.data?.company || response.data || null;
        setHasCompany(!!comp);
      } catch {
        setHasCompany(false);
      } finally {
        setLoadingProfile(false);
      }
    };
    checkCompanyLink();
  }, []);

  const handleFormSubmit = async (jobData) => {
    setSubmitting(true);
    setError(null);
    try {
      await employerApi.createJob(jobData);
      // Success, redirect
      navigate('/employer/jobs');
    } catch (err) {
      setError(err.message || 'Failed to publish job posting. Please try again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingProfile) {
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
        <title>Post a New Job | Employer Panel</title>
      </Helmet>

      {/* Header navigations */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/employer/jobs')}
          className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 dark:border-dark-border dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-white shrink-0 cursor-pointer"
        >
          <ChevronLeft size={16} />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight font-display text-slate-900 dark:text-white">
            Post a Job Opening
          </h1>
          <p className="text-sm text-slate-500 mt-1 dark:text-dark-text-muted">
            Publish a new vacancy to hire candidates.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/40 dark:text-rose-450 text-sm font-semibold flex items-center gap-2">
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      {!hasCompany ? (
        /* Prompt to create company first */
        <Card className="p-8 text-center border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900 space-y-4 flex flex-col items-center">
          <div className="p-4 bg-amber-50 rounded-full text-amber-600 dark:bg-amber-950/20 dark:text-amber-400">
            <AlertTriangle size={36} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
            Company Profile Required
          </h3>
          <p className="text-xs text-slate-500 max-w-sm dark:text-dark-text-muted">
            You must link or configure a Company Profile details page before you can publish vacancies.
          </p>
          <Button variant="primary" size="sm" onClick={() => navigate('/employer/company')}>
            Configure Company Profile
          </Button>
        </Card>
      ) : (
        /* Create Job Form */
        <Card className="p-6 border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900">
          <JobForm onSubmit={handleFormSubmit} loading={submitting} />
        </Card>
      )}
    </motion.div>
  );
};

export default PostJob;
