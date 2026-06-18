import React, { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Search, Trash2, Eye, EyeOff, MapPin, Briefcase, RefreshCw } from 'lucide-react';
import adminApi from '../../api/adminApi';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'closed', label: 'Closed' },
  { value: 'draft', label: 'Draft' },
  { value: 'flagged', label: 'Flagged' },
];

const JOB_TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'full-time', label: 'Full-Time' },
  { value: 'part-time', label: 'Part-Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
];

const jobStatusVariant = (status) => {
  if (status === 'active') return 'success';
  if (status === 'closed') return 'default';
  if (status === 'flagged') return 'danger';
  if (status === 'draft') return 'warning';
  return 'default';
};

export const JobModeration = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedJob, setSelectedJob] = useState(null);
  const [modal, setModal] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getAllJobs({ search, status, type, page, limit: 10 });
      const d = res.data || {};
      setJobs(d.jobs || d || []);
      setTotalPages(d.totalPages || 1);
    } catch (err) {
      setError(err.message || 'Failed to load jobs.');
    } finally {
      setLoading(false);
    }
  }, [search, status, type, page]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const openModal = (job, type) => {
    setSelectedJob(job);
    setModal(type);
  };

  const handleStatusUpdate = async (newStatus) => {
    setActionLoading(true);
    try {
      await adminApi.updateJobStatus(selectedJob._id, newStatus);
      fetchJobs();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
      setModal('');
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await adminApi.deleteJob(selectedJob._id);
      fetchJobs();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
      setModal('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6 py-4"
    >
      <Helmet>
        <title>Job Moderation — Admin</title>
        <meta name="description" content="Moderate job listings, flag inappropriate content, and manage job statuses." />
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold font-display text-slate-900 dark:text-white">Job Moderation</h1>
          <p className="text-sm text-slate-500 dark:text-dark-text-muted mt-0.5">Review, flag, and manage all platform job listings.</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchJobs} className="flex items-center gap-2">
          <RefreshCw size={14} /> Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              id="job-search"
              placeholder="Search by title or company…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              leftIcon={<Search size={15} />}
            />
          </div>
          <Select
            id="job-status-filter"
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            options={STATUS_OPTIONS}
            className="sm:w-40"
          />
          <Select
            id="job-type-filter"
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(1); }}
            options={JOB_TYPE_OPTIONS}
            className="sm:w-40"
          />
        </div>
      </Card>

      {/* Job List */}
      {loading ? (
        <LoadingSkeleton type="card" count={5} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchJobs} />
      ) : jobs.length === 0 ? (
        <EmptyState title="No jobs found" description="Try adjusting your filters." icon={Briefcase} />
      ) : (
        <Card className="border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-left">
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Job</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Type</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Applicants</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Posted</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-border/40">
                {jobs.map((job) => (
                  <tr key={job._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white text-sm">{job.title}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin size={10} /> {job.location || 'Remote'}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="default" className="text-[10px]">{job.type || 'full-time'}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={jobStatusVariant(job.status)} className="text-[10px]">
                        {job.status || 'active'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300 font-semibold">
                      {job.applicantCount || 0}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {job.status === 'active' ? (
                          <button
                            onClick={() => openModal(job, 'close')}
                            className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1"
                          >
                            <EyeOff size={13} /> Close
                          </button>
                        ) : (
                          <button
                            onClick={() => openModal(job, 'reopen')}
                            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1"
                          >
                            <Eye size={13} /> Reopen
                          </button>
                        )}
                        <button
                          onClick={() => openModal(job, 'delete')}
                          className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1"
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}

      {/* Modals */}
      <Modal
        isOpen={modal === 'close' || modal === 'reopen'}
        onClose={() => setModal('')}
        title={modal === 'close' ? 'Close Job' : 'Reopen Job'}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to{' '}
            <span className="font-bold">{modal === 'close' ? 'close' : 'reopen'}</span>{' '}
            <span className="font-bold text-slate-900 dark:text-white">{selectedJob?.title}</span>?
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setModal('')}>Cancel</Button>
            <Button
              variant={modal === 'close' ? 'warning' : 'success'}
              onClick={() => handleStatusUpdate(modal === 'close' ? 'closed' : 'active')}
              disabled={actionLoading}
            >
              {actionLoading ? 'Processing…' : modal === 'close' ? 'Close Job' : 'Reopen Job'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={modal === 'delete'} onClose={() => setModal('')} title="Delete Job">
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Permanently delete <span className="font-bold text-slate-900 dark:text-white">{selectedJob?.title}</span>? This cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setModal('')}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} disabled={actionLoading}>
              {actionLoading ? 'Deleting…' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default JobModeration;
