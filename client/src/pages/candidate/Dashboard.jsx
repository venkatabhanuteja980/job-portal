import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Bookmark,
  Calendar,
  UserCheck,
  ArrowRight,
  Sparkles,
  MapPin,
  ChevronRight
} from 'lucide-react';
import candidateApi from '../../api/candidateApi';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import ErrorState from '../../components/common/ErrorState';
import ProfileCompletionBar from '../../components/candidate/ProfileCompletionBar';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [dashRes, profRes] = await Promise.all([
          candidateApi.getDashboard(),
          candidateApi.getProfile()
        ]);
        setData(dashRes.data);
        setProfile(profRes.data?.profile || profRes.data);
      } catch (err) {
        setError(err.message || 'Failed to retrieve dashboard analytics.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 py-4">
        <LoadingSkeleton type="profile" count={1} />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <LoadingSkeleton type="card" count={4} />
        </div>
        <LoadingSkeleton type="table" count={1} />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => navigate(0)} />;
  }

  const { metrics = {}, recentApplications = [], recommendations = [], profileCompletion = 0 } = data || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-8 py-4 text-left"
    >
      <Helmet>
        <title>Dashboard | Candidate Panel</title>
        <meta name="description" content="View application metrics, recommended jobs, and profile strength." />
      </Helmet>

      {/* Header banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight font-display text-slate-900 dark:text-white">
            Welcome Back!
          </h1>
          <p className="text-sm text-slate-500 dark:text-dark-text-muted mt-1">
            Track your job applications and check new matching career opportunities.
          </p>
        </div>
      </div>

      {/* Grid of Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card: Applications Submitted */}
        <Card className="p-5 border-slate-200 dark:border-dark-border flex items-center gap-4 bg-white dark:bg-slate-900">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400">
            <Briefcase size={22} />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white leading-none">
              {metrics.totalApplications || 0}
            </p>
            <p className="text-xs font-semibold text-slate-400 dark:text-dark-text-muted uppercase tracking-wider mt-1">
              Applications
            </p>
          </div>
        </Card>

        {/* Card: Saved Jobs */}
        <Card
          onClick={() => navigate('/candidate/saved-jobs')}
          className="p-5 border-slate-200 dark:border-dark-border flex items-center gap-4 bg-white dark:bg-slate-900 cursor-pointer hover:border-primary-500/40"
        >
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400">
            <Bookmark size={22} />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white leading-none">
              {metrics.savedJobsCount || 0}
            </p>
            <p className="text-xs font-semibold text-slate-400 dark:text-dark-text-muted uppercase tracking-wider mt-1">
              Saved Jobs
            </p>
          </div>
        </Card>

        {/* Card: Interviews Scheduled */}
        <Card
          onClick={() => navigate('/candidate/applications')}
          className="p-5 border-slate-200 dark:border-dark-border flex items-center gap-4 bg-white dark:bg-slate-900 cursor-pointer hover:border-primary-500/40"
        >
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400">
            <Calendar size={22} />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white leading-none">
              {metrics.activeInterviews || 0}
            </p>
            <p className="text-xs font-semibold text-slate-400 dark:text-dark-text-muted uppercase tracking-wider mt-1">
              Interviews
            </p>
          </div>
        </Card>

        {/* Card: Profile Completion */}
        <Card
          onClick={() => navigate('/candidate/profile')}
          className="p-5 border-slate-200 dark:border-dark-border flex items-center gap-4 bg-white dark:bg-slate-900 cursor-pointer hover:border-primary-500/40"
        >
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">
            <UserCheck size={22} />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white leading-none">
              {profileCompletion}%
            </p>
            <p className="text-xs font-semibold text-slate-400 dark:text-dark-text-muted uppercase tracking-wider mt-1">
              Completion
            </p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left pane: Recent Applications */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                Recent Job Applications
              </h2>
              {recentApplications.length > 0 && (
                <button
                  onClick={() => navigate('/candidate/applications')}
                  className="text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center gap-0.5 hover:underline"
                >
                  View All <ArrowRight size={14} />
                </button>
              )}
            </div>

            {recentApplications.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-slate-500 dark:text-dark-text-muted">
                  You haven&apos;t submitted any job applications yet.
                </p>
                <button
                  onClick={() => navigate('/jobs')}
                  className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline mt-2 inline-block"
                >
                  Find jobs and apply
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-dark-border/40">
                {recentApplications.map((app) => {
                  const job = app.job || {};
                  const company = job.company || {};
                  const companyInitials = company.name ? company.name.substring(0, 2).toUpperCase() : 'CO';
                  
                  return (
                    <div key={app._id} className="py-4 first:pt-0 last:pb-0 flex justify-between items-center gap-4">
                      <div className="flex gap-3 items-center min-w-0">
                        <div className="h-10 w-10 rounded-lg bg-slate-150 dark:bg-slate-800 text-slate-500 flex items-center justify-center font-bold text-xs shrink-0">
                          {company.logo?.url ? (
                            <img src={company.logo.url} alt={company.name} className="h-full w-full object-cover rounded-lg" />
                          ) : (
                            companyInitials
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {job.title || 'Unknown Role'}
                          </h4>
                          <p className="text-xs text-slate-400 dark:text-dark-text-muted truncate mt-0.5">
                            {company.name || 'Company Details'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <Badge
                          variant={
                            app.status === 'applied'
                              ? 'primary'
                              : app.status === 'interview'
                              ? 'info'
                              : ['shortlisted', 'offered', 'hired'].includes(app.status)
                              ? 'success'
                              : 'danger'
                          }
                          className="text-[10px] uppercase font-bold px-2 py-0.5"
                        >
                          {app.status}
                        </Badge>
                        <button
                          onClick={() => navigate('/candidate/applications')}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* AI Recommended Jobs Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white font-display flex items-center gap-1.5">
                <Sparkles size={18} className="text-primary-600 animate-pulse" /> Recommended For You
              </h2>
              <button
                onClick={() => navigate('/jobs')}
                className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline"
              >
                Browse All Jobs
              </button>
            </div>

            {recommendations.length === 0 ? (
              <Card className="p-6 text-center border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900">
                <p className="text-sm text-slate-500 dark:text-dark-text-muted">
                  Add more details to your profile to get personalized job suggestions.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {recommendations.slice(0, 2).map((rec) => {
                  const job = rec.job || rec;
                  const score = rec.matchScore || 0;
                  const matchingSkills = rec.matchingSkills || [];
                  const missingSkills = rec.missingSkills || [];
                  const companyInitials = job.company?.name ? job.company.name.substring(0, 2).toUpperCase() : 'CO';

                  return (
                    <Card
                      key={job._id}
                      hoverable
                      onClick={() => navigate(`/jobs/${job._id}`)}
                      className="p-5 cursor-pointer flex flex-col justify-between border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900 text-left"
                    >
                      <div className="space-y-4">
                        <div className="flex justify-between items-start gap-4">
                          <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-sm text-slate-500 shrink-0">
                            {job.company?.logo?.url ? (
                              <img src={job.company.logo.url} alt={job.company.name} className="h-full w-full object-cover rounded-lg" />
                            ) : (
                              companyInitials
                            )}
                          </div>
                          
                          {/* Score Badge */}
                          <Badge
                            variant={score >= 70 ? 'success' : score >= 40 ? 'warning' : 'danger'}
                            className="text-[9px] font-bold"
                          >
                            {score}% Match
                          </Badge>
                        </div>

                        <div className="space-y-1">
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight truncate">
                            {job.title}
                          </h3>
                          <p className="text-xs text-slate-400 dark:text-dark-text-muted font-medium truncate">
                            {job.company?.name}
                          </p>
                        </div>

                        {/* Location / jobType */}
                        <div className="flex items-center gap-x-2 text-[10px] text-slate-400 dark:text-dark-text-muted">
                          <span className="flex items-center gap-0.5"><MapPin size={10} /> {job.location}</span>
                          <span>•</span>
                          <span className="capitalize">{job.jobType.replace('-', ' ')}</span>
                        </div>

                        {/* Skills breakdown required by dashboard enhancements */}
                        <div className="pt-3 border-t border-slate-100 dark:border-dark-border/40 space-y-1.5 text-[10px]">
                          {matchingSkills.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1">
                              <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-wider mr-1">Matching:</span>
                              {matchingSkills.slice(0, 2).map((s) => (
                                <span key={s} className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-sm dark:bg-emerald-950/20 dark:text-emerald-400">
                                  {s}
                                </span>
                              ))}
                              {matchingSkills.length > 2 && <span className="text-slate-400">+{matchingSkills.length - 2}</span>}
                            </div>
                          )}

                          {missingSkills.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1">
                              <span className="text-[8px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wider mr-1">Missing:</span>
                              {missingSkills.slice(0, 2).map((s) => (
                                <span key={s} className="px-1.5 py-0.5 bg-amber-50/50 text-amber-700 rounded-sm dark:bg-amber-950/20 dark:text-amber-400">
                                  {s}
                                </span>
                              ))}
                              {missingSkills.length > 2 && <span className="text-slate-400">+{missingSkills.length - 2}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right pane: Profile Strength Completion Checklist */}
        <div className="space-y-6">
          <Card className="p-6 border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900">
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-display mb-4">
              Profile Summary
            </h2>
            <ProfileCompletionBar percentage={profileCompletion} profile={profile} />
            
            <div className="pt-6 border-t border-slate-100 dark:border-dark-border/40 mt-6 text-center">
              <button
                onClick={() => navigate('/candidate/profile')}
                className="w-full py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-bold rounded-lg dark:bg-primary-950/20 dark:text-primary-400 transition-colors"
              >
                Edit Profile Information
              </button>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
