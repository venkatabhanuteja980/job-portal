import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Users,
  Calendar,
  UserCheck,
  Award,
  ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
  FunnelChart,
  Funnel,
  LabelList
} from 'recharts';
import employerApi from '../../api/employerApi';
import StatsCard from '../../components/employer/StatsCard';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import ErrorState from '../../components/common/ErrorState';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Stats & Charts data
  const [metrics, setMetrics] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplicants: 0,
    shortlisted: 0,
    interviews: 0,
    hires: 0,
  });

  const [recentApplicants, setRecentApplicants] = useState([]);
  const [barChartData, setBarChartData] = useState([]);
  const [pieChartData, setPieChartData] = useState([]);
  const [lineChartData, setLineChartData] = useState([]);
  const [funnelData, setFunnelData] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [dashRes, jobsRes] = await Promise.all([
          employerApi.getDashboard(),
          employerApi.getMyJobs()
        ]);

        const dashData = dashRes.data || {};
        const jobsList = jobsRes.data || [];
        
        // Fetch applicants across all jobs in parallel to calculate advanced stats
        const allApplications = [];
        await Promise.all(
          jobsList.map(async (job) => {
            try {
              const appRes = await employerApi.getJobApplicants(job._id);
              const apps = appRes.data || [];
              allApplications.push(...apps);
            } catch {
              // Ignore individual job applicants fetch failure
            }
          })
        );

        // Calculate metrics from aggregated applications
        const shortlistedCount = allApplications.filter(app => app.status === 'shortlisted').length;
        const interviewsCount = allApplications.filter(app => app.status === 'interview').length;
        const hiresCount = allApplications.filter(app => app.status === 'hired').length;

        setMetrics({
          totalJobs: dashData.metrics?.totalJobs || jobsList.length || 0,
          activeJobs: dashData.metrics?.activeJobs || jobsList.filter(j => j.status === 'active').length || 0,
          totalApplicants: dashData.metrics?.totalApplicants || allApplications.length || 0,
          shortlisted: shortlistedCount,
          interviews: interviewsCount,
          hires: hiresCount,
        });

        setRecentApplicants(dashData.recentApplicants || allApplications.slice(0, 5) || []);

        // 1. Applications per Job (Bar Chart)
        const barData = jobsList.slice(0, 8).map(job => ({
          name: job.title.length > 15 ? `${job.title.substring(0, 15)}...` : job.title,
          Applicants: job.applicantCount || 0,
          Views: job.views || 0,
        }));
        setBarChartData(barData);

        // 2. Status Distribution (Pie Chart)
        const statusMap = {
          applied: 0,
          reviewed: 0,
          shortlisted: 0,
          interview: 0,
          offered: 0,
          hired: 0,
          rejected: 0,
          withdrawn: 0,
        };

        allApplications.forEach(app => {
          if (statusMap[app.status] !== undefined) {
            statusMap[app.status]++;
          } else {
            statusMap.applied++;
          }
        });

        const pieData = Object.keys(statusMap)
          .map(key => {
            let label = key;
            if (key === 'reviewed') label = 'Under Review';
            if (key === 'interview') label = 'Interviewing';
            return {
              name: label.toUpperCase(),
              value: statusMap[key],
            };
          })
          .filter(item => item.value > 0);
        setPieChartData(pieData);

        // 3. Applications Trend (Line Chart)
        const trendMap = {};
        allApplications.forEach(app => {
          const date = new Date(app.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          trendMap[date] = (trendMap[date] || 0) + 1;
        });

        const lineData = Object.keys(trendMap)
          .map(date => ({
            date,
            Applications: trendMap[date],
          }))
          // Sort trend by date
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(-7); // Last 7 days with applications
        setLineChartData(lineData);

        // 4. Hiring Funnel (Funnel Chart)
        // Applied -> Under Review -> Shortlisted -> Interview -> Offered -> Hired
        const funnelStages = [
          { value: allApplications.length, name: 'Applied', fill: '#4f46e5' },
          { value: allApplications.filter(app => ['reviewed', 'shortlisted', 'interview', 'offered', 'hired'].includes(app.status)).length, name: 'Under Review', fill: '#eab308' },
          { value: allApplications.filter(app => ['shortlisted', 'interview', 'offered', 'hired'].includes(app.status)).length, name: 'Shortlisted', fill: '#10b981' },
          { value: allApplications.filter(app => ['interview', 'offered', 'hired'].includes(app.status)).length, name: 'Interview', fill: '#6366f1' },
          { value: allApplications.filter(app => ['offered', 'hired'].includes(app.status)).length, name: 'Offered', fill: '#8b5cf6' },
          { value: hiresCount, name: 'Hired', fill: '#059669' },
        ];
        setFunnelData(funnelStages.filter(stage => stage.value > 0 || stage.name === 'Applied'));
      } catch (err) {
        setError(err.message || 'Failed to retrieve employer analytics.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const COLORS = ['#4f46e5', '#3b82f6', '#eab308', '#10b981', '#6366f1', '#8b5cf6', '#ef4444', '#64748b'];

  if (loading) {
    return (
      <div className="space-y-6 py-4">
        <LoadingSkeleton type="profile" count={1} />
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <LoadingSkeleton type="card" count={6} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LoadingSkeleton type="card" count={2} />
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => navigate(0)} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-8 py-4 text-left"
    >
      <Helmet>
        <title>Employer Analytics Dashboard</title>
        <meta name="description" content="Overview of hiring metrics, candidate funnel progress, and posting statistics." />
      </Helmet>

      {/* Header banner */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight font-display text-slate-900 dark:text-white">
          Recruitment Dashboard
        </h1>
        <p className="text-sm text-slate-500 dark:text-dark-text-muted mt-1">
          Monitor your postings, track candidate status distribution, and analyze the hiring pipeline.
        </p>
      </div>

      {/* Analytics Widgets (6 stats cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        <StatsCard
          title="Total Jobs"
          value={metrics.totalJobs}
          icon={Briefcase}
          color="info"
        />
        <StatsCard
          title="Active Jobs"
          value={metrics.activeJobs}
          icon={Briefcase}
          color="success"
        />
        <StatsCard
          title="Total Applicants"
          value={metrics.totalApplicants}
          icon={Users}
          color="primary"
        />
        <StatsCard
          title="Shortlisted"
          value={metrics.shortlisted}
          icon={UserCheck}
          color="warning"
        />
        <StatsCard
          title="Interviews Set"
          value={metrics.interviews}
          icon={Calendar}
          color="info"
        />
        <StatsCard
          title="Hires Made"
          value={metrics.hires}
          icon={Award}
          color="success"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Applications per Job (Bar Chart) */}
        <Card className="p-6 border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900 text-left space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Applications & Views per Job
          </h3>
          <div className="h-72 w-full">
            {barChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">No job postings data.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Applicants" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Views" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Chart 2: Applicant Status Distribution (Pie Chart) */}
        <Card className="p-6 border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900 text-left space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Applicant Status Distribution
          </h3>
          <div className="h-72 w-full flex flex-col sm:flex-row items-center justify-center gap-4">
            {pieChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">No applications data.</div>
            ) : (
              <>
                <div className="h-full w-full sm:w-3/5">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Custom Legend */}
                <div className="flex flex-col gap-2 text-xs w-full sm:w-2/5 max-h-60 overflow-y-auto">
                  {pieChartData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="truncate text-slate-700 dark:text-slate-350 font-medium">{entry.name} ({entry.value})</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Chart 3: Applications Trend (Line Chart) */}
        <Card className="p-6 border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900 text-left space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Recent Applications Trend
          </h3>
          <div className="h-72 w-full">
            {lineChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">No trend data.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  <Line type="monotone" dataKey="Applications" stroke="#4f46e5" strokeWidth={3} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Chart 4: Hiring Funnel (Funnel Chart) */}
        <Card className="p-6 border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900 text-left space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Hiring Funnel Progression
          </h3>
          <div className="h-72 w-full">
            {funnelData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">No funnel data.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <FunnelChart>
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  <Funnel dataKey="value" data={funnelData} isAnimationActive>
                    <LabelList position="right" fill="#94a3b8" stroke="none" dataKey="name" fontStyle="bold" fontSize={10} />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6 border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900 text-left">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-dark-border/40 pb-4 mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
            Recent Job Applications
          </h3>
          {metrics.totalApplicants > 0 && (
            <button
              onClick={() => navigate('/employer/jobs')}
              className="text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center gap-0.5 hover:underline"
            >
              Manage Job Postings <ChevronRight size={14} />
            </button>
          )}
        </div>

        {recentApplicants.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs italic">
            No applicant activity recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-dark-border/40">
            {recentApplicants.map((app) => {
              const cand = app.candidate || {};
              const job = app.job || {};
              const initials = cand.firstName ? `${cand.firstName[0]}${cand.lastName[0]}`.toUpperCase() : 'CA';

              return (
                <div
                  key={app._id}
                  className="py-3.5 first:pt-0 last:pb-0 flex justify-between items-center gap-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/25 px-2 rounded-lg transition-colors"
                  onClick={() => navigate(`/employer/jobs/${job._id}/applicants`)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-505 flex items-center justify-center font-bold text-xs shrink-0">
                      {cand.avatar?.url ? (
                        <img src={cand.avatar.url} alt={cand.firstName} className="h-full w-full object-cover rounded-full" />
                      ) : (
                        initials
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {cand.firstName} {cand.lastName}
                      </h4>
                      <p className="text-xs text-slate-400 dark:text-dark-text-muted truncate mt-0.5">
                        Applied for <span className="font-bold text-slate-500 dark:text-slate-350">{job.title || 'Unknown Role'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant={app.status === 'hired' ? 'success' : app.status === 'rejected' ? 'danger' : 'primary'} className="text-[9px] uppercase font-bold px-2 py-0.5">
                      {app.status === 'reviewed' ? 'reviewed' : app.status}
                    </Badge>
                    <ChevronRight size={14} className="text-slate-400" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default Dashboard;
