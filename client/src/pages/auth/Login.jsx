import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight } from 'lucide-react';
import authApi from '../../api/authApi';
import { loginStart, loginSuccess, loginFailure } from '../../store/authSlice';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [formErrors, setFormErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      errs.password = 'Password is required';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    setFormErrors({});
    dispatch(loginStart());

    try {
      const response = await authApi.login(formData);
      const { accessToken, user } = response.data;
      
      // Update Redux Store
      dispatch(loginSuccess({ accessToken, user }));
      
      // Determine redirection path based on user role
      const originPath = location.state?.from || `/candidate/dashboard`;
      if (user.role === 'admin') {
        navigate(location.state?.from || '/admin/dashboard', { replace: true });
      } else if (user.role === 'employer') {
        navigate(location.state?.from || '/employer/dashboard', { replace: true });
      } else {
        navigate(originPath, { replace: true });
      }
    } catch (err) {
      dispatch(loginFailure(err.message || 'Login failed. Invalid credentials.'));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-md mx-auto py-12 text-left"
    >
      <Helmet>
        <title>Sign In - JobPortal</title>
        <meta name="description" content="Sign in to your candidate or employer account on JobPortal." />
      </Helmet>

      <Card title="Welcome Back" subtitle="Access your personalized job panel dashboard" className="border-slate-200 shadow-lg">
        {error && (
          <div className="mb-4 p-3.5 rounded-lg bg-red-50 text-red-700 border border-red-200 flex items-start gap-2.5 dark:bg-red-950/20 dark:border-red-900 text-xs">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={formErrors.email}
            placeholder="name@example.com"
          />

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-dark-text-muted">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-primary-600 hover:text-primary-750 dark:text-primary-400 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={formErrors.password}
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
            className="w-full py-2.5 font-bold shadow-md shadow-primary-600/10"
          >
            Sign In
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col items-center justify-between gap-2 text-xs text-slate-500 dark:border-dark-border dark:text-dark-text-muted">
          <p>
            New to JobPortal?{' '}
            <Link
              to="/register"
              className="font-bold text-primary-600 hover:underline dark:text-primary-400 inline-flex items-center gap-0.5"
            >
              Join now <ArrowRight size={12} />
            </Link>
          </p>
        </div>
      </Card>
    </motion.div>
  );
};

export default Login;
