import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { MapPin, Briefcase, Calendar, Sparkles, CheckCircle, FileText, ArrowLeft } from 'lucide-react';
import jobApi from '../../api/jobApi';
import axiosClient from '../../api/axiosClient';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import ErrorState from '../../components/common/ErrorState';

export const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // States
  const [job, setJob] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Apply Modal states
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  useEffect(() => {
    const fetchJobData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await jobApi.getJobDetails(id);
        const jobData = response.data;
        setJob(jobData);

        // If user is candidate, verify if they already applied and calculate match score
        if (isAuthenticated && user?.role === 'candidate') {
          // Check application status
          try {
            const appsResponse = await axiosClient.get('/applications/my-applications');
            const userApps = appsResponse.data.data || [];
            const matchingApp = userApps.find((app) => {
              const jobId = app.job?._id || app.job;
              return jobId?.toString() === id;
            });
            if (matchingApp) {
              setHasApplied(true);
              setMatchData({
                matchScore: matchingApp.matchScore,
                matchingSkills: matchingApp.matchingSkills,
                missingSkills: matchingApp.missingSkills,
              });
            } else {
              // Calculate real-time match details using backend engine
              const matchRes = await axiosClient.post('/applications', { jobId: id, dryRun: true });
              setMatchData(matchRes.data.data);
            }
          } catch {
            // Safe to ignore, fallback
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to retrieve job details.');
      } finally {
        setLoading(false);
      }
    };
    fetchJobData();
  }, [id, isAuthenticated, user]);

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/jobs/${id}` } });
      return;
    }
    setApplyModalOpen(true);
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await jobApi.applyForJob({
        jobId: id,
        coverLetter,
      });
      setApplySuccess(true);
      setHasApplied(true);
      // Close apply modal after short delay
      setTimeout(() => {
        setApplyModalOpen(false);
        setApplySuccess(false);
      }, 2000);
    } catch (err) {
      alert(err.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  const getPostedTime = (dateStr) => {
    const date = new Date(dateStr);
    const diff = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return '1 day ago';
    return `${diff} days ago`;
  };

  if (loading) return <LoadingSkeleton type="profile" className="py-12" />;
  if (error) return <ErrorState message={error} onRetry={() => navigate('/jobs')} className="py-12" />;
  if (!job) return <ErrorState message="Job posting not found." className="py-12" />;

  const companyLogoInitials = job.company?.name ? job.company.name.substring(0, 2).toUpperCase() : 'CO';
  const companySlug = job.company?.slug || '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-8 py-4 text-left max-w-5xl mx-auto"
    >
      <Helmet>
        <title>{`${job.title} at ${job.company?.name || 'Company'} - JobPortal`}</title>
        <meta name="description" content={job.description.substring(0, 150)} />
        <meta property="og:title" content={`${job.title} at ${job.company?.name || 'Company'}`} />
        <meta property="og:description" content={job.description.substring(0, 150)} />
        <meta property="og:url" content={window.location.href} />
      </Helmet>

      {/* Back button link */}
      <div>
        <Link to="/jobs" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-dark-text-muted dark:hover:text-white">
          <ArrowLeft size={16} /> Back to Search
        </Link>
      </div>

      {/* Hero Header panel card */}
      <Card className="p-6 border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex gap-4 items-start">
            <div className="h-16 w-16 rounded-xl bg-slate-100 flex items-center justify-center font-bold font-display text-lg text-slate-500 shrink-0 dark:bg-slate-800 dark:text-slate-400">
              {job.company?.name ? companyLogoInitials : 'CO'}
            </div>
            <div className="space-y-1.5">
              <h1 className="text-2xl font-extrabold font-display text-slate-900 dark:text-white">
                {job.title}
              </h1>
              <p className="text-base font-semibold text-primary-600 dark:text-primary-400">
                {companySlug ? (
                  <Link to={`/companies/${companySlug}`} className="hover:underline">
                    {job.company?.name}
                  </Link>
                ) : (
                  job.company?.name || 'Company Profile'
                )}
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 dark:text-dark-text-muted">
                <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
                <span className="flex items-center gap-1 capitalize"><Briefcase size={14} /> {job.locationType}</span>
                <span className="flex items-center gap-1"><Calendar size={14} /> Posted {getPostedTime(job.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
            <Badge variant="primary" className="text-sm py-1 px-3 self-start sm:self-center">
              {job.jobType.replace('-', ' ')}
            </Badge>

            {user?.role !== 'employer' && user?.role !== 'admin' && (
              <Button
                variant={hasApplied ? 'secondary' : 'primary'}
                onClick={handleApplyClick}
                disabled={hasApplied}
                className="w-full sm:w-auto px-6 py-2.5 shadow-md shadow-primary-600/10"
              >
                {hasApplied ? 'Applied' : 'Apply Now'}
              </Button>
            )}
            
            {user?.role === 'employer' && (
              <p className="text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg font-semibold dark:bg-amber-950/20 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                Logged in as Employer
              </p>
            )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Job specifications and descriptions */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Job Description" className="border-slate-200">
            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
              {job.description}
            </p>
          </Card>

          {job.requirements && job.requirements.length > 0 && (
            <Card title="Requirements" className="border-slate-200">
              <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700 dark:text-slate-300">
                {job.requirements.map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>
            </Card>
          )}

          {job.responsibilities && job.responsibilities.length > 0 && (
            <Card title="Responsibilities" className="border-slate-200">
              <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700 dark:text-slate-300">
                {job.responsibilities.map((resp, idx) => (
                  <li key={idx}>{resp}</li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        {/* Right Side: Quick specifications, Match Score */}
        <div className="lg:col-span-1 space-y-6">
          {/* Match Score Info (only for authenticated Candidate users) */}
          {isAuthenticated && user?.role === 'candidate' && matchData && (
            <Card className="border-primary-200 bg-primary-50/10 dark:border-primary-850/30">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold font-display text-slate-900 dark:text-white flex items-center gap-1.5 text-sm">
                    <Sparkles size={16} className="text-primary-600" /> Match compatibility
                  </h3>
                  <Badge variant={matchData.matchScore >= 70 ? 'success' : matchData.matchScore >= 40 ? 'warning' : 'danger'}>
                    {matchData.matchScore}%
                  </Badge>
                </div>
                
                {/* Score Progress Bar */}
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden dark:bg-slate-800">
                  <div
                    className={`h-full rounded-full ${
                      matchData.matchScore >= 70
                        ? 'bg-emerald-600'
                        : matchData.matchScore >= 40
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${matchData.matchScore}%` }}
                  />
                </div>

                {/* Skills analysis */}
                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-dark-border text-xs">
                  {matchData.matchingSkills && matchData.matchingSkills.length > 0 && (
                    <div className="space-y-1">
                      <p className="font-bold text-slate-700 dark:text-slate-300">Matching Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {matchData.matchingSkills.map((sk) => (
                          <span key={sk} className="px-2 py-0.5 bg-emerald-100/50 text-emerald-800 rounded-sm dark:bg-emerald-950/20 dark:text-emerald-400">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {matchData.missingSkills && matchData.missingSkills.length > 0 && (
                    <div className="space-y-1">
                      <p className="font-bold text-slate-700 dark:text-slate-300">Missing Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {matchData.missingSkills.map((sk) => (
                          <span key={sk} className="px-2 py-0.5 bg-red-100/40 text-red-800 rounded-sm dark:bg-red-950/20 dark:text-red-400">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Quick Stats list Card */}
          <Card className="p-5 border-slate-200">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-4">Quick Summary</h3>
            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-dark-text-muted">Salary Range</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {job.salary && !job.salary.isConfidential ? (
                    `${job.salary.min?.toLocaleString()} - ${job.salary.max?.toLocaleString()} ${job.salary.currency}`
                  ) : (
                    'Confidential'
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-dark-text-muted">Experience Level</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">{job.experienceLevel}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-dark-text-muted">Total Openings</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{job.openings} vacancies</span>
              </div>
              {job.deadline && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-dark-text-muted">Apply Before</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    {new Date(job.deadline).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Apply Form Modal overlay */}
      <Modal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        title={`Apply for ${job.title}`}
      >
        {applySuccess ? (
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
            <CheckCircle size={44} className="text-emerald-600 animate-bounce" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Application Submitted</h3>
            <p className="text-xs text-slate-500 dark:text-dark-text-muted max-w-xs">
              Your application was sent successfully. The employer has been notified.
            </p>
          </div>
        ) : (
          <form onSubmit={handleApplySubmit} className="space-y-5 text-left">
            <div className="p-3 bg-primary-50 rounded-lg border border-primary-200 flex items-start gap-2.5 dark:bg-primary-950/20 dark:border-primary-900">
              <FileText size={18} className="text-primary-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Attached Resume</p>
                <p className="text-[11px] text-slate-500 dark:text-dark-text-muted mt-0.5">
                  We will automatically attach the latest resume uploaded on your profile.
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-dark-text-muted">
                Cover Letter (Optional)
              </label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={5}
                placeholder="Explain why your experience fits this position..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white dark:border-dark-border dark:bg-slate-850 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setApplyModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={submitting}>
                Submit Application
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </motion.div>
  );
};

export default JobDetail;
