import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import authApi from '../../api/authApi';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email address is required');
      return;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await authApi.forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to dispatch password recovery email.');
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
        <title>Forgot Password - JobPortal</title>
        <meta name="description" content="Recover your JobPortal account password." />
      </Helmet>

      <Card title="Reset Password" subtitle="Request a password recovery link to your email" className="border-slate-200 shadow-lg">
        {success ? (
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
            <CheckCircle2 size={48} className="text-emerald-600" />
            <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">Email Sent</h3>
            <p className="text-sm text-slate-500 max-w-xs dark:text-dark-text-muted">
              We have dispatched a password recovery token link to <span className="font-bold text-slate-700 dark:text-slate-300">{email}</span>. Please check your inbox.
            </p>
            <Link to="/login" className="w-full">
              <Button variant="outline" className="w-full mt-4">
                Return to Login
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
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              placeholder="name@example.com"
            />

            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
              className="w-full py-2.5 font-bold shadow-md shadow-primary-600/10"
            >
              Send Reset Link
            </Button>
          </form>
        )}

        {!success && (
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center text-xs dark:border-dark-border">
            <Link
              to="/login"
              className="font-semibold text-slate-500 hover:text-slate-800 dark:text-dark-text-muted dark:hover:text-white inline-flex items-center gap-1.5"
            >
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default ForgotPassword;
