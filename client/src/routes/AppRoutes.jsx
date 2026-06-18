import React, { useEffect, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../api/axiosClient';
import { loginSuccess, setInitialized } from '../store/authSlice';

// Layouts
import PublicLayout from '../components/layout/PublicLayout';
import DashboardLayout from '../components/layout/DashboardLayout';

// Route Guardians
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

// Loading Fallback Component
import LoadingSkeleton from '../components/common/LoadingSkeleton';

// Lazy-Loaded Public Pages
const Home = React.lazy(() => import('../pages/public/Home'));
const About = React.lazy(() => import('../pages/public/About'));
const Contact = React.lazy(() => import('../pages/public/Contact'));
const Jobs = React.lazy(() => import('../pages/public/Jobs'));
const JobDetail = React.lazy(() => import('../pages/public/JobDetail'));
const CompanyProfile = React.lazy(() => import('../pages/public/CompanyProfile'));
const Login = React.lazy(() => import('../pages/auth/Login'));
const Register = React.lazy(() => import('../pages/auth/Register'));
const ForgotPassword = React.lazy(() => import('../pages/auth/ForgotPassword'));
const ResetPassword = React.lazy(() => import('../pages/auth/ResetPassword'));
const VerifyEmail = React.lazy(() => import('../pages/auth/VerifyEmail'));
// Lazy-Loaded Candidate Pages
const CandidateDashboard = React.lazy(() => import('../pages/candidate/Dashboard'));
const CandidateProfile = React.lazy(() => import('../pages/candidate/Profile'));
const CandidateApplications = React.lazy(() => import('../pages/candidate/Applications'));
const CandidateSavedJobs = React.lazy(() => import('../pages/candidate/SavedJobs'));
const CandidateSettings = React.lazy(() => import('../pages/candidate/Settings'));

// Lazy-Loaded Employer Pages
const EmployerDashboard = React.lazy(() => import('../pages/employer/Dashboard'));
const EmployerCompany = React.lazy(() => import('../pages/employer/CompanyProfile'));
const PostJob = React.lazy(() => import('../pages/employer/PostJob'));
const EditJob = React.lazy(() => import('../pages/employer/EditJob'));
const EmployerJobs = React.lazy(() => import('../pages/employer/MyJobs'));
const JobApplicants = React.lazy(() => import('../pages/employer/Applicants'));
const EmployerSettings = React.lazy(() => import('../pages/employer/Settings'));

// Lazy-Loaded Admin Pages
const AdminDashboard = React.lazy(() => import('../pages/admin/Dashboard'));
const AdminUsers = React.lazy(() => import('../pages/admin/UserManagement'));
const AdminEmployers = React.lazy(() => import('../pages/admin/EmployerApprovals'));
const AdminJobs = React.lazy(() => import('../pages/admin/JobModeration'));
const AdminReports = React.lazy(() => import('../pages/admin/ReportsManagement'));
const AdminCategories = React.lazy(() => import('../pages/admin/CategoriesManagement'));
const AdminSkills = React.lazy(() => import('../pages/admin/SkillsManagement'));
const AdminSettings = React.lazy(() => import('../pages/admin/PlatformSettings'));

// Notifications
const NotificationCenter = React.lazy(() => import('../pages/notifications/NotificationCenter'));

const NotFound = () => <div className="text-center py-20"><h1 className="text-4xl font-extrabold mb-4 font-display text-slate-900 dark:text-white">404</h1><p className="text-slate-500 mb-6">Page not found.</p></div>;

export const AppRoutes = () => {
  const dispatch = useDispatch();
  const { initialized } = useSelector((state) => state.auth);

  // Auto-authenticate check on app mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const response = await axiosClient.get('/auth/me');
        const { user } = response.data;
        dispatch(loginSuccess({ user, accessToken: null }));
      } catch {
        // Ignored
      } finally {
        dispatch(setInitialized());
      }
    };
    initializeAuth();
  }, [dispatch]);

  if (!initialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-12">
          <LoadingSkeleton type="profile" count={1} />
        </div>
      }/*<Route path="/register" element={<Register />} />*/
    >
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
  <Route path="/" element={<Home />} />
  <Route path="/about" element={<About />} />
  <Route path="/contact" element={<Contact />} />
  <Route path="/jobs" element={<Jobs />} />
  <Route path="/jobs/:id" element={<JobDetail />} />
  <Route path="/companies/:slug" element={<CompanyProfile />} />

  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route path="/forgot-password" element={<ForgotPassword />} />
  <Route path="/reset-password/:token" element={<ResetPassword />} />
  <Route path="/verify-email/:token" element={<VerifyEmail />} />

  <Route path="/404" element={<NotFound />} />
</Route>

        {/* Protected Candidate Routes */}
        <Route
          path="/candidate"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['candidate']}>
                <DashboardLayout />
              </RoleRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<CandidateDashboard />} />
          <Route path="profile" element={<CandidateProfile />} />
          <Route path="applications" element={<CandidateApplications />} />
          <Route path="saved-jobs" element={<CandidateSavedJobs />} />
          <Route path="settings" element={<CandidateSettings />} />
        </Route>

        {/* Protected Employer Routes */}
        <Route
          path="/employer"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['employer']}>
                <DashboardLayout />
              </RoleRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<EmployerDashboard />} />
          <Route path="company" element={<EmployerCompany />} />
          <Route path="jobs/new" element={<PostJob />} />
          <Route path="jobs/:id/edit" element={<EditJob />} />
          <Route path="jobs" element={<EmployerJobs />} />
          <Route path="jobs/:id/applicants" element={<JobApplicants />} />
          <Route path="settings" element={<EmployerSettings />} />
        </Route>

        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['admin']}>
                <DashboardLayout />
              </RoleRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="employers" element={<AdminEmployers />} />
          <Route path="jobs" element={<AdminJobs />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="skills" element={<AdminSkills />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Protected Notifications Route (all roles) */}
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<NotificationCenter />} />
        </Route>

        {/* Fallback Catch */}
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
