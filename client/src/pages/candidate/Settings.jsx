import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Lock, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';
import authApi from '../../api/authApi';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export const Settings = () => {
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!passwords.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    if (!passwords.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwords.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await authApi.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });

      setSuccessMsg('Your password has been changed successfully.');
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update password. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6 py-4 text-left max-w-xl mx-auto"
    >
      <Helmet>
        <title>Account Settings | Candidate Settings</title>
        <meta name="description" content="Change password and manage account credentials." />
      </Helmet>

      <div>
        <h1 className="text-3xl font-extrabold tracking-tight font-display text-slate-900 dark:text-white">
          Account Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-dark-text-muted mt-1">
          Manage your account credentials and system security.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-250 rounded-xl text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/40 dark:text-emerald-400 text-sm font-semibold flex items-center gap-2">
          <CheckCircle size={18} /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-250 rounded-xl text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/40 dark:text-rose-400 text-sm font-semibold flex items-center gap-2">
          <XCircle size={18} /> {errorMsg}
        </div>
      )}

      <Card className="p-6 border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900 space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-dark-border/40 pb-3">
          <ShieldAlert className="text-slate-500" size={20} />
          <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">
            Change Password
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Current Password *"
            name="currentPassword"
            type="password"
            value={passwords.currentPassword}
            onChange={handleChange}
            error={errors.currentPassword}
            placeholder="••••••••"
            icon={<Lock size={16} />}
            required
          />

          <Input
            label="New Password *"
            name="newPassword"
            type="password"
            value={passwords.newPassword}
            onChange={handleChange}
            error={errors.newPassword}
            placeholder="Min 8 characters"
            icon={<Lock size={16} />}
            required
          />

          <Input
            label="Confirm New Password *"
            name="confirmPassword"
            type="password"
            value={passwords.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            placeholder="••••••••"
            icon={<Lock size={16} />}
            required
          />

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={loading}
              className="w-full sm:w-auto"
            >
              Update Password
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
};

export default Settings;
