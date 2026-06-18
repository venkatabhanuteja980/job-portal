import React, { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ShieldAlert, CheckCircle, XCircle, Search, RefreshCw, Flag } from 'lucide-react';
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

const TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'job', label: 'Job Reports' },
  { value: 'user', label: 'User Reports' },
  { value: 'employer', label: 'Employer Reports' },
  { value: 'content', label: 'Content Reports' },
];

const STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'dismissed', label: 'Dismissed' },
  { value: '', label: 'All' },
];

const reportStatusVariant = (status) => {
  if (status === 'open') return 'danger';
  if (status === 'resolved') return 'success';
  if (status === 'dismissed') return 'default';
  return 'warning';
};

export const ReportsManagement = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('open');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState(null);
  const [modal, setModal] = useState('');
  const [resolution, setResolution] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getReports({ search, type, status, page, limit: 10 });
      const d = res.data || {};
      setReports(d.reports || d || []);
      setTotalPages(d.totalPages || 1);
    } catch (err) {
      setError(err.message || 'Failed to load reports.');
    } finally {
      setLoading(false);
    }
  }, [search, type, status, page]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const openModal = (report, action) => {
    setSelected(report);
    setModal(action);
    setResolution('');
  };

  const handleResolve = async () => {
    setActionLoading(true);
    try {
      await adminApi.resolveReport(selected._id, resolution);
      fetchReports();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
      setModal('');
    }
  };

  const handleDismiss = async () => {
    setActionLoading(true);
    try {
      await adminApi.dismissReport(selected._id);
      fetchReports();
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
        <title>Reports Management — Admin</title>
        <meta name="description" content="Review and resolve user-submitted platform reports." />
      </Helmet>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold font-display text-slate-900 dark:text-white">Reports Management</h1>
          <p className="text-sm text-slate-500 dark:text-dark-text-muted mt-0.5">Review and resolve user-submitted platform reports.</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchReports} className="flex items-center gap-2">
          <RefreshCw size={14} /> Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              id="reports-search"
              placeholder="Search reports…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              leftIcon={<Search size={15} />}
            />
          </div>
          <Select
            id="report-type-filter"
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(1); }}
            options={TYPE_OPTIONS}
            className="sm:w-44"
          />
          <Select
            id="report-status-filter"
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            options={STATUS_OPTIONS}
            className="sm:w-40"
          />
        </div>
      </Card>

      {/* Reports */}
      {loading ? (
        <LoadingSkeleton type="card" count={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchReports} />
      ) : reports.length === 0 ? (
        <EmptyState title="No reports found" description="No pending reports match your criteria." icon={Flag} />
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <Card
              key={report._id}
              className="p-5 border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                {/* Icon */}
                <div className="h-10 w-10 rounded-xl bg-rose-50 dark:bg-rose-950/20 flex items-center justify-center shrink-0">
                  <ShieldAlert size={20} className="text-rose-500" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={reportStatusVariant(report.status)} className="text-[10px]">
                      {report.status || 'open'}
                    </Badge>
                    {report.type && (
                      <Badge variant="default" className="text-[10px]">{report.type}</Badge>
                    )}
                    <span className="text-xs text-slate-400">
                      {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : '—'}
                    </span>
                  </div>

                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                    {report.subject || 'Report Submitted'}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {report.description || report.reason || 'No description provided.'}
                  </p>

                  {report.reporter && (
                    <p className="text-xs text-slate-400">
                      Reported by:{' '}
                      <span className="font-semibold text-slate-600 dark:text-slate-300">
                        {report.reporter.firstName} {report.reporter.lastName}
                      </span>
                    </p>
                  )}
                </div>

                {/* Actions */}
                {report.status === 'open' && (
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => openModal(report, 'resolve')}
                      className="flex items-center gap-1"
                    >
                      <CheckCircle size={13} /> Resolve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openModal(report, 'dismiss')}
                      className="flex items-center gap-1"
                    >
                      <XCircle size={13} /> Dismiss
                    </Button>
                  </div>
                )}
              </div>

              {/* Resolution note */}
              {report.resolution && (
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-dark-border/40">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold">Resolution:</span> {report.resolution}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}

      {/* Resolve Modal */}
      <Modal isOpen={modal === 'resolve'} onClose={() => setModal('')} title="Resolve Report">
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">Add a resolution note (optional):</p>
          <textarea
            className="w-full rounded-lg border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-800 text-sm p-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            rows={3}
            placeholder="Describe the action taken…"
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setModal('')}>Cancel</Button>
            <Button variant="success" onClick={handleResolve} disabled={actionLoading}>
              {actionLoading ? 'Resolving…' : 'Mark Resolved'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Dismiss Modal */}
      <Modal isOpen={modal === 'dismiss'} onClose={() => setModal('')} title="Dismiss Report">
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Dismiss this report? It will be marked as dismissed and no further action will be taken.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setModal('')}>Cancel</Button>
            <Button variant="warning" onClick={handleDismiss} disabled={actionLoading}>
              {actionLoading ? 'Dismissing…' : 'Dismiss'}
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default ReportsManagement;
