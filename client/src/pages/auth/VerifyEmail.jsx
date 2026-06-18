import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import authApi from '../../api/authApi';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

export const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. No token provided.');
      return;
    }

    const verify = async () => {
      try {
        await authApi.verifyEmail(token);
        setStatus('success');
        setMessage('Your email has been verified successfully. You can now sign in.');
      } catch (err) {
        setStatus('error');
        setMessage(
          err.message ||
            'Verification failed. Your link may have expired or already been used.'
        );
      }
    };

    verify();
  }, [token]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-md mx-auto py-16 text-center"
    >
      <Helmet>
        <title>Email Verification — JobPortal</title>
        <meta name="description" content="Verify your JobPortal email address." />
      </Helmet>

      <Card className="p-8 border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900 shadow-lg space-y-6">
        {/* Loading */}
        {status === 'loading' && (
          <>
            <div className="flex justify-center">
              <Loader2 size={48} className="text-indigo-500 animate-spin" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold font-display text-slate-900 dark:text-white">
                Verifying your email…
              </h1>
              <p className="text-sm text-slate-500 dark:text-dark-text-muted mt-2">
                Please wait while we confirm your email address.
              </p>
            </div>
          </>
        )}

        {/* Success */}
        {status === 'success' && (
          <>
            <div className="flex justify-center">
              <CheckCircle2 size={52} className="text-emerald-500" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold font-display text-slate-900 dark:text-white">
                Email Verified!
              </h1>
              <p className="text-sm text-slate-500 dark:text-dark-text-muted mt-2">
                {message}
              </p>
            </div>
            <Button
              variant="primary"
              className="w-full"
              onClick={() => navigate('/login', { replace: true })}
            >
              Go to Sign In
            </Button>
          </>
        )}

        {/* Error */}
        {status === 'error' && (
          <>
            <div className="flex justify-center">
              <XCircle size={52} className="text-rose-500" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold font-display text-slate-900 dark:text-white">
                Verification Failed
              </h1>
              <p className="text-sm text-slate-500 dark:text-dark-text-muted mt-2">
                {message}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => navigate('/login')}
              >
                Go to Sign In
              </Button>
              <p className="text-xs text-slate-400">
                Need a new link?{' '}
                <Link
                  to="/register"
                  className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                >
                  Re-register
                </Link>{' '}
                or contact{' '}
                <a
                  href="mailto:support@jobportal.com"
                  className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                >
                  support
                </a>
                .
              </p>
            </div>
          </>
        )}
      </Card>
    </motion.div>
  );
};

export default VerifyEmail;
