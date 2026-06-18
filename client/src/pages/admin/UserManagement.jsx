import React, { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Search, Trash2, ShieldAlert, ShieldCheck, RefreshCw } from 'lucide-react';
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
import Avatar from '../../components/common/Avatar';

const ROLE_OPTIONS = [
  { value: '', label: 'All Roles' },
  { value: 'candidate', label: 'Candidates' },
  { value: 'employer', label: 'Employers' },
  { value: 'admin', label: 'Admins' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'banned', label: 'Banned' },
];

const statusVariant = (status) => {
  if (status === 'active') return 'success';
  if (status === 'suspended') return 'warning';
  if (status === 'banned') return 'danger';
  return 'default';
};

export const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionModal, setActionModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getUsers({ search, role, status, page, limit: 12 });
      const d = res.data || {};
      setUsers(d.users || d || []);
      setTotalPages(d.totalPages || 1);
    } catch (err) {
      setError(err.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, [search, role, status, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleAction = (user, type) => {
    setSelectedUser(user);
    setActionType(type);
    setActionModal(true);
  };

  const confirmAction = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      if (actionType === 'delete') {
        await adminApi.deleteUser(selectedUser._id);
      } else {
        await adminApi.updateUserStatus(selectedUser._id, actionType);
      }
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Action failed.');
    } finally {
      setActionLoading(false);
      setActionModal(false);
      setSelectedUser(null);
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
        <title>User Management — Admin</title>
        <meta name="description" content="Manage platform users, roles, and account statuses." />
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold font-display text-slate-900 dark:text-white">User Management</h1>
          <p className="text-sm text-slate-500 dark:text-dark-text-muted mt-0.5">Search, filter, and moderate platform accounts.</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchUsers} className="flex items-center gap-2">
          <RefreshCw size={14} /> Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              id="user-search"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              leftIcon={<Search size={15} />}
            />
          </div>
          <Select
            id="role-filter"
            value={role}
            onChange={(e) => { setRole(e.target.value); setPage(1); }}
            options={ROLE_OPTIONS}
            className="sm:w-44"
          />
          <Select
            id="status-filter"
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            options={STATUS_OPTIONS}
            className="sm:w-44"
          />
        </div>
      </Card>

      {/* Table */}
      {loading ? (
        <LoadingSkeleton type="card" count={6} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchUsers} />
      ) : users.length === 0 ? (
        <EmptyState title="No users found" description="Adjust your filters to find users." />
      ) : (
        <Card className="border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-left">
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">User</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Role</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Joined</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-border/40">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={user.avatar?.url}
                          name={`${user.firstName} ${user.lastName}`}
                          size="sm"
                        />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white text-sm">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={user.role === 'admin' ? 'danger' : user.role === 'employer' ? 'primary' : 'default'} className="text-[10px]">
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant(user.status || 'active')} className="text-[10px]">
                        {user.status || 'active'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {user.status !== 'suspended' ? (
                          <button
                            onClick={() => handleAction(user, 'suspended')}
                            className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                          >
                            <ShieldAlert size={13} /> Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAction(user, 'active')}
                            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                          >
                            <ShieldCheck size={13} /> Restore
                          </button>
                        )}
                        <button
                          onClick={() => handleAction(user, 'delete')}
                          className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
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

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}

      {/* Action Confirm Modal */}
      <Modal
        isOpen={actionModal}
        onClose={() => setActionModal(false)}
        title={actionType === 'delete' ? 'Delete User' : actionType === 'suspended' ? 'Suspend User' : 'Restore User'}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to{' '}
            <span className="font-bold">
              {actionType === 'delete' ? 'permanently delete' : actionType === 'suspended' ? 'suspend' : 'restore'}
            </span>{' '}
            <span className="font-bold text-slate-900 dark:text-white">
              {selectedUser?.firstName} {selectedUser?.lastName}
            </span>?
            {actionType === 'delete' && ' This action cannot be undone.'}
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setActionModal(false)}>Cancel</Button>
            <Button
              variant={actionType === 'delete' ? 'danger' : actionType === 'suspended' ? 'warning' : 'success'}
              onClick={confirmAction}
              disabled={actionLoading}
            >
              {actionLoading ? 'Processing…' : 'Confirm'}
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default UserManagement;
