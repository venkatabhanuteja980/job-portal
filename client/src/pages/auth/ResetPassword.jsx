import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import authApi from '../../api/authApi';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export const ResetPassword = () => {
  const { token } = useParams();

  // States
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const errs = {};
    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 8) {
      errs.password = 'Password must be at least 8 characters';
    }
    if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
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
    setError('');
    setLoading(true);

    try {
      await authApi.resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to update password. Reset token may have expired.');
    } finally {
      setLoading(false);
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
        <title>Reset Password - JobPortal</title>
        <meta name="description" content="Update your JobPortal account password." />
      </Helmet>

      <Card title="Update Password" subtitle="Choose a new secure password for your account" className="border-slate-200 shadow-lg">
        {success ? (
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
            <CheckCircle2 size={48} className="text-emerald-600" />
            <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">Password Updated</h3>
            <p className="text-sm text-slate-500 max-w-xs dark:text-dark-text-muted">
              Your password has been successfully updated. You can now sign in with your new password.
            </p>
            <Link to="/login" className="w-full">
              <Button variant="primary" className="w-full mt-4">
                Sign In
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-700 border border-red-200 flex items-start gap-2.5 dark:bg-red-950/20 dark:border-red-900 text-xs">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <Input
              label="New Password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (formErrors.password) setFormErrors((prev) => ({ ...prev, password: '' }));
              }}
              error={formErrors.password}
              placeholder="••••••••"
            />

            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (formErrors.confirmPassword) setFormErrors((prev) => ({ ...prev, confirmPassword: '' }));
              }}
              error={formErrors.confirmPassword}
              placeholder="••••••••"
            />

            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
              className="w-full py-2.5 font-bold shadow-md shadow-primary-600/10"
            >
              Update Password
            </Button>
          </form>
        )}
      </Card>
    </motion.div>
  );
};

export default ResetPassword;
