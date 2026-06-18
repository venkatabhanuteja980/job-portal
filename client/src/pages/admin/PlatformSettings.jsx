import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Save, Globe, Mail, Shield, Bell, Database, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import adminApi from '../../api/adminApi';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import ErrorState from '../../components/common/ErrorState';

const SettingSection = ({ icon: Icon, title, description, children }) => (
  <Card className="p-6 border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900 space-y-5">
    <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-dark-border/40">
      <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 flex items-center justify-center">
        <Icon size={18} className="text-indigo-500" />
      </div>
      <div>
        <h3 className="font-bold text-slate-900 dark:text-white text-sm">{title}</h3>
        {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
      </div>
    </div>
    {children}
  </Card>
);

const ToggleSwitch = ({ id, label, description, checked, onChange }) => (
  <div className="flex items-start justify-between gap-4 py-2">
    <div className="flex-1">
      <label htmlFor={id} className="text-sm font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">{label}</label>
      {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
    </div>
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${checked ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
    >
      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  </div>
);

const DEFAULT_SETTINGS = {
  platformName: 'Job Portal',
  platformUrl: 'https://jobportal.com',
  supportEmail: 'support@jobportal.com',
  maxJobsPerEmployer: 50,
  requireEmailVerification: true,
  requireEmployerApproval: true,
  allowGuestJobSearch: true,
  maintenanceMode: false,
  emailNotificationsEnabled: true,
  autoRejectUnverifiedJobs: false,
  maxApplicationsPerCandidate: 100,
  jobExpiryDays: 30,
};

export const PlatformSettings = () => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminApi.getSettings();
        setSettings({ ...DEFAULT_SETTINGS, ...(res.data || {}) });
      } catch {
        // Use defaults
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await adminApi.updateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const update = (key, value) => setSettings((prev) => ({ ...prev, [key]: value }));

  if (loading) return <LoadingSkeleton type="profile" count={1} />;
  if (error) return <ErrorState message={error} onRetry={() => setError(null)} />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6 py-4 max-w-3xl"
    >
      <Helmet>
        <title>Platform Settings — Admin</title>
        <meta name="description" content="Configure global platform settings and feature flags." />
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold font-display text-slate-900 dark:text-white">Platform Settings</h1>
          <p className="text-sm text-slate-500 dark:text-dark-text-muted mt-0.5">Global configuration and feature flags for the platform.</p>
        </div>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2"
        >
          {saved ? <CheckCircle size={16} /> : saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
          {saved ? 'Saved!' : saving ? 'Saving…' : 'Save Changes'}
        </Button>
      </div>

      {saved && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-sm font-semibold">
          <CheckCircle size={16} /> Settings saved successfully.
        </div>
      )}

      {/* General */}
      <SettingSection icon={Globe} title="General" description="Basic platform identity settings.">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5" htmlFor="platform-name">
              Platform Name
            </label>
            <Input
              id="platform-name"
              value={settings.platformName}
              onChange={(e) => update('platformName', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5" htmlFor="platform-url">
              Platform URL
            </label>
            <Input
              id="platform-url"
              value={settings.platformUrl}
              onChange={(e) => update('platformUrl', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5" htmlFor="support-email">
              Support Email
            </label>
            <Input
              id="support-email"
              type="email"
              value={settings.supportEmail}
              onChange={(e) => update('supportEmail', e.target.value)}
              leftIcon={<Mail size={14} />}
            />
          </div>
        </div>
      </SettingSection>

      {/* Security */}
      <SettingSection icon={Shield} title="Security & Access" description="Control user verification and access policies.">
        <div className="divide-y divide-slate-100 dark:divide-dark-border/40">
          <ToggleSwitch
            id="require-email-verification"
            label="Require Email Verification"
            description="Users must verify their email before accessing the platform."
            checked={settings.requireEmailVerification}
            onChange={(v) => update('requireEmailVerification', v)}
          />
          <ToggleSwitch
            id="require-employer-approval"
            label="Require Employer Approval"
            description="New employer accounts require admin review before posting jobs."
            checked={settings.requireEmployerApproval}
            onChange={(v) => update('requireEmployerApproval', v)}
          />
          <ToggleSwitch
            id="allow-guest-search"
            label="Allow Guest Job Search"
            description="Visitors can browse jobs without logging in."
            checked={settings.allowGuestJobSearch}
            onChange={(v) => update('allowGuestJobSearch', v)}
          />
          <ToggleSwitch
            id="maintenance-mode"
            label="Maintenance Mode"
            description="Take the platform offline for maintenance. Only admins can access."
            checked={settings.maintenanceMode}
            onChange={(v) => update('maintenanceMode', v)}
          />
        </div>
        {settings.maintenanceMode && (
          <div className="flex items-center gap-2 px-3 py-2.5 mt-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs font-semibold">
            <AlertTriangle size={14} /> Maintenance mode is active. The platform is offline for regular users.
          </div>
        )}
      </SettingSection>

      {/* Notifications */}
      <SettingSection icon={Bell} title="Notifications" description="Control platform-wide notification behaviour.">
        <div className="divide-y divide-slate-100 dark:divide-dark-border/40">
          <ToggleSwitch
            id="email-notifications"
            label="Email Notifications"
            description="Send automated emails for applications, approvals, and alerts."
            checked={settings.emailNotificationsEnabled}
            onChange={(v) => update('emailNotificationsEnabled', v)}
          />
          <ToggleSwitch
            id="auto-reject-unverified"
            label="Auto-reject Unverified Job Posts"
            description="Automatically reject jobs from unverified employer accounts."
            checked={settings.autoRejectUnverifiedJobs}
            onChange={(v) => update('autoRejectUnverifiedJobs', v)}
          />
        </div>
      </SettingSection>

      {/* Limits */}
      <SettingSection icon={Database} title="Platform Limits" description="Configure posting and application limits.">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5" htmlFor="max-jobs">
              Max Jobs / Employer
            </label>
            <Input
              id="max-jobs"
              type="number"
              min={1}
              max={500}
              value={settings.maxJobsPerEmployer}
              onChange={(e) => update('maxJobsPerEmployer', Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5" htmlFor="max-apps">
              Max Applications / Candidate
            </label>
            <Input
              id="max-apps"
              type="number"
              min={1}
              max={500}
              value={settings.maxApplicationsPerCandidate}
              onChange={(e) => update('maxApplicationsPerCandidate', Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5" htmlFor="job-expiry">
              Job Expiry (days)
            </label>
            <Input
              id="job-expiry"
              type="number"
              min={1}
              max={365}
              value={settings.jobExpiryDays}
              onChange={(e) => update('jobExpiryDays', Number(e.target.value))}
            />
          </div>
        </div>
      </SettingSection>
    </motion.div>
  );
};

export default PlatformSettings;
