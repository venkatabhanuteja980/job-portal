import React, { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Building2, Globe, RefreshCw, Search } from 'lucide-react';
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

const FILTER_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'all', label: 'All Employers' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

export const EmployerApprovals = () => {
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState(null);
  const [modal, setModal] = useState(''); // 'approve' | 'reject'
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchEmployers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fn = filter === 'pending' ? adminApi.getPendingEmployers : adminApi.getAllEmployers;
      const res = await fn({ search, page, limit: 10, status: filter !== 'pending' && filter !== 'all' ? filter : undefined });
      const d = res.data || {};
      setEmployers(d.employers || d || []);
      setTotalPages(d.totalPages || 1);
    } catch (err) {
      setError(err.message || 'Failed to load employers.');
    } finally {
      setLoading(false);
    }
  }, [filter, search, page]);

  useEffect(() => { fetchEmployers(); }, [fetchEmployers]);

  const openModal = (employer, type) => {
    setSelected(employer);
    setModal(type);
    setRejectReason('');
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await adminApi.approveEmployer(selected._id);
      fetchEmployers();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
      setModal('');
    }
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      await adminApi.rejectEmployer(selected._id, rejectReason);
      fetchEmployers();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
      setModal('');
    }
  };

  const approvalBadge = (status) => {
    if (status === 'approved') return 'success';
    if (status === 'rejected') return 'danger';
    return 'warning';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6 py-4"
    >
      <Helmet>
        <title>Employer Approvals — Admin</title>
        <meta name="description" content="Review and approve employer registrations." />
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold font-display text-slate-900 dark:text-white">Employer Approvals</h1>
          <p className="text-sm text-slate-500 dark:text-dark-text-muted mt-0.5">Review pending employer registration requests.</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchEmployers} className="flex items-center gap-2">
          <RefreshCw size={14} /> Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              id="employer-search"
              placeholder="Search by company name or email…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              leftIcon={<Search size={15} />}
            />
          </div>
          <Select
            id="employer-filter"
            value={filter}
            onChange={(e) => { setFilter(e.target.value); setPage(1); }}
            options={FILTER_OPTIONS}
            className="sm:w-44"
          />
        </div>
      </Card>

      {/* Cards */}
      {loading ? (
        <LoadingSkeleton type="card" count={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchEmployers} />
      ) : employers.length === 0 ? (
        <EmptyState
          title="No employer requests"
          description={filter === 'pending' ? 'All pending requests have been reviewed.' : 'No employers match your search.'}
          icon={Building2}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {employers.map((emp) => {
            const company = emp.company || {};
            const approvalStatus = emp.approvalStatus || 'pending';
            return (
              <Card
                key={emp._id}
                className="p-5 border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900 space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {company.logo?.url ? (
                      <img src={company.logo.url} alt={company.name} className="h-12 w-12 rounded-xl object-cover border border-slate-200 dark:border-dark-border shrink-0" />
                    ) : (
                      <div className="h-12 w-12 rounded-xl bg-indigo-100 dark:bg-indigo-950/30 flex items-center justify-center shrink-0">
                        <Building2 size={22} className="text-indigo-500" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                        {company.name || `${emp.firstName} ${emp.lastName}`}
                      </h3>
                      <p className="text-xs text-slate-400 truncate">{emp.email}</p>
                    </div>
                  </div>
                  <Badge variant={approvalBadge(approvalStatus)} className="text-[10px] shrink-0">
                    {approvalStatus}
                  </Badge>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400">
                  {company.industry && (
                    <div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Industry: </span>
                      {company.industry}
                    </div>
                  )}
                  {company.size && (
                    <div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Size: </span>
                      {company.size}
                    </div>
                  )}
                  {company.website && (
                    <div className="col-span-2 flex items-center gap-1">
                      <Globe size={11} />
                      <a href={company.website} target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline truncate">
                        {company.website}
                      </a>
                    </div>
                  )}
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Registered: </span>
                    {emp.createdAt ? new Date(emp.createdAt).toLocaleDateString() : '—'}
                  </div>
                </div>

                {/* Description */}
                {company.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{company.description}</p>
                )}

                {/* Actions */}
                {approvalStatus === 'pending' && (
                  <div className="flex gap-3 pt-1">
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => openModal(emp, 'approve')}
                      className="flex-1 flex items-center justify-center gap-1"
                    >
                      <CheckCircle size={14} /> Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => openModal(emp, 'reject')}
                      className="flex-1 flex items-center justify-center gap-1"
                    >
                      <XCircle size={14} /> Reject
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}

      {/* Approve Modal */}
      <Modal isOpen={modal === 'approve'} onClose={() => setModal('')} title="Approve Employer">
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Approve <span className="font-bold text-slate-900 dark:text-white">{selected?.company?.name || selected?.email}</span>? They will be notified and can start posting jobs immediately.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setModal('')}>Cancel</Button>
            <Button variant="success" onClick={handleApprove} disabled={actionLoading}>
              {actionLoading ? 'Approving…' : 'Approve'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal isOpen={modal === 'reject'} onClose={() => setModal('')} title="Reject Employer">
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Reject <span className="font-bold text-slate-900 dark:text-white">{selected?.company?.name || selected?.email}</span>? Provide a reason:
          </p>
          <textarea
            className="w-full rounded-lg border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-800 text-sm p-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            rows={3}
            placeholder="Reason for rejection…"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setModal('')}>Cancel</Button>
            <Button variant="danger" onClick={handleReject} disabled={actionLoading || !rejectReason.trim()}>
              {actionLoading ? 'Rejecting…' : 'Reject'}
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default EmployerApprovals;
