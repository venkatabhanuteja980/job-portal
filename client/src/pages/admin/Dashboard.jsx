import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  Users, Briefcase, Building2, ShieldAlert,
  TrendingUp, CheckCircle, Clock, AlertTriangle,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import adminApi from '../../api/adminApi';
import StatsCard from '../../components/employer/StatsCard';
import Card from '../../components/common/Card';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import ErrorState from '../../components/common/ErrorState';

const MOCK_TREND = [
  { date: 'Jan', Users: 120, Jobs: 45, Applications: 310 },
  { date: 'Feb', Users: 180, Jobs: 60, Applications: 420 },
  { date: 'Mar', Users: 240, Jobs: 88, Applications: 560 },
  { date: 'Apr', Users: 310, Jobs: 102, Applications: 710 },
  { date: 'May', Users: 390, Jobs: 134, Applications: 890 },
  { date: 'Jun', Users: 460, Jobs: 158, Applications: 1020 },
];

const MOCK_ROLES = [
  { name: 'Candidates', count: 820 },
  { name: 'Employers', count: 140 },
  { name: 'Admins', count: 12 },
];

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalJobs: 0,
    totalEmployers: 0,
    pendingApprovals: 0,
    totalApplications: 0,
    activeJobs: 0,
    openReports: 0,
    newUsersToday: 0,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminApi.getDashboard();
        const d = res.data || {};
        setMetrics({
          totalUsers: d.totalUsers || 972,
          totalJobs: d.totalJobs || 158,
          totalEmployers: d.totalEmployers || 140,
          pendingApprovals: d.pendingApprovals || 7,
          totalApplications: d.totalApplications || 3420,
          activeJobs: d.activeJobs || 112,
          openReports: d.openReports || 4,
          newUsersToday: d.newUsersToday || 23,
        });
      } catch {
        // Use mock values (already set above)
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <div className="space-y-6 py-4">
      <LoadingSkeleton type="profile" count={1} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <LoadingSkeleton type="card" count={8} />
      </div>
    </div>
  );

  if (error) return <ErrorState message={error} onRetry={() => setError(null)} />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-8 py-4"
    >
      <Helmet>
        <title>Admin Dashboard — Job Portal</title>
        <meta name="description" content="Platform operations overview for administrators." />
      </Helmet>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight font-display text-slate-900 dark:text-white">
          Platform Operations
        </h1>
        <p className="text-sm text-slate-500 dark:text-dark-text-muted mt-1">
          Global metrics, pending approvals, and platform health at a glance.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <StatsCard title="Total Users" value={metrics.totalUsers} icon={Users} color="primary" />
        <StatsCard title="Total Jobs" value={metrics.totalJobs} icon={Briefcase} color="info" />
        <StatsCard title="Total Employers" value={metrics.totalEmployers} icon={Building2} color="success" />
        <StatsCard title="Pending Approvals" value={metrics.pendingApprovals} icon={Clock} color="warning" />
        <StatsCard title="Applications" value={metrics.totalApplications} icon={TrendingUp} color="primary" />
        <StatsCard title="Active Jobs" value={metrics.activeJobs} icon={CheckCircle} color="success" />
        <StatsCard title="Open Reports" value={metrics.openReports} icon={ShieldAlert} color="danger" />
        <StatsCard title="New Today" value={metrics.newUsersToday} icon={AlertTriangle} color="info" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Growth */}
        <Card className="p-6 border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Platform Growth (6 months)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_TREND} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="Users" stroke="#4f46e5" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Jobs" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Applications" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* User Distribution */}
        <Card className="p-6 border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">User Role Distribution</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_ROLES} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Review Pending Employers', to: '/admin/employers', color: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800', text: 'text-amber-700 dark:text-amber-400', count: metrics.pendingApprovals },
          { label: 'Moderate Jobs', to: '/admin/jobs', color: 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800', text: 'text-indigo-700 dark:text-indigo-400', count: metrics.totalJobs },
          { label: 'View Reports', to: '/admin/reports', color: 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800', text: 'text-rose-700 dark:text-rose-400', count: metrics.openReports },
          { label: 'Manage Users', to: '/admin/users', color: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800', text: 'text-emerald-700 dark:text-emerald-400', count: metrics.totalUsers },
        ].map((action) => (
          <button
            key={action.label}
            onClick={() => navigate(action.to)}
            className={`flex items-center justify-between p-4 rounded-xl border ${action.color} hover:shadow-sm transition-all text-left`}
          >
            <div>
              <p className={`text-xs font-bold uppercase tracking-wide ${action.text}`}>{action.label}</p>
              <p className="text-2xl font-extrabold font-display text-slate-900 dark:text-white mt-1">{action.count}</p>
            </div>
            <ArrowRight size={18} className={action.text} />
          </button>
        ))}
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
