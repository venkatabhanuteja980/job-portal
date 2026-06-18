import React, { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Tag, RefreshCw, Layers } from 'lucide-react';
import adminApi from '../../api/adminApi';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';

export const CategoriesManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(''); // 'create' | 'edit' | 'delete'
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', icon: '' });
  const [formError, setFormError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getCategories();
      setCategories(res.data || res || []);
    } catch (err) {
      setError(err.message || 'Failed to load categories.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const openCreate = () => {
    setFormData({ name: '', description: '', icon: '' });
    setFormError('');
    setModal('create');
  };

  const openEdit = (cat) => {
    setSelected(cat);
    setFormData({ name: cat.name || '', description: cat.description || '', icon: cat.icon || '' });
    setFormError('');
    setModal('edit');
  };

  const openDelete = (cat) => {
    setSelected(cat);
    setModal('delete');
  };

  const handleSave = async () => {
    if (!formData.name.trim()) { setFormError('Category name is required.'); return; }
    setActionLoading(true);
    try {
      if (modal === 'create') {
        await adminApi.createCategory(formData);
      } else {
        await adminApi.updateCategory(selected._id, formData);
      }
      fetchCategories();
      setModal('');
    } catch (err) {
      setFormError(err.message || 'Save failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await adminApi.deleteCategory(selected._id);
      fetchCategories();
      setModal('');
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
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
        <title>Categories Management — Admin</title>
        <meta name="description" content="Create, edit, and delete job categories." />
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold font-display text-slate-900 dark:text-white">Categories</h1>
          <p className="text-sm text-slate-500 dark:text-dark-text-muted mt-0.5">Manage job categories used across the platform.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchCategories} className="flex items-center gap-2">
            <RefreshCw size={14} />
          </Button>
          <Button variant="primary" size="sm" onClick={openCreate} className="flex items-center gap-2">
            <Plus size={14} /> New Category
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900">
          <Layers size={16} className="text-indigo-500" />
          <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">{categories.length} categories</span>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <LoadingSkeleton type="card" count={6} />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchCategories} />
      ) : categories.length === 0 ? (
        <EmptyState
          title="No categories yet"
          description="Add your first job category to get started."
          icon={Tag}
          action={<Button variant="primary" size="sm" onClick={openCreate}><Plus size={14} className="mr-1" /> Add Category</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Card
              key={cat._id}
              className="p-5 border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900 group hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 flex items-center justify-center shrink-0 text-lg">
                    {cat.icon || <Tag size={18} className="text-indigo-500" />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">{cat.name}</h3>
                    {cat.jobCount !== undefined && (
                      <p className="text-xs text-slate-400 mt-0.5">{cat.jobCount} jobs</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={() => openEdit(cat)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => openDelete(cat)}
                    className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {cat.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 line-clamp-2">{cat.description}</p>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modal === 'create' || modal === 'edit'}
        onClose={() => setModal('')}
        title={modal === 'create' ? 'New Category' : 'Edit Category'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5" htmlFor="cat-name">
              Category Name <span className="text-rose-500">*</span>
            </label>
            <Input
              id="cat-name"
              placeholder="e.g. Software Engineering"
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5" htmlFor="cat-icon">
              Icon (emoji or text)
            </label>
            <Input
              id="cat-icon"
              placeholder="e.g. 💻"
              value={formData.icon}
              onChange={(e) => setFormData((p) => ({ ...p, icon: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5" htmlFor="cat-desc">
              Description
            </label>
            <textarea
              id="cat-desc"
              className="w-full rounded-lg border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-800 text-sm p-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              rows={3}
              placeholder="Short description of this category…"
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
            />
          </div>

          {formError && <p className="text-xs text-rose-500">{formError}</p>}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setModal('')}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} disabled={actionLoading}>
              {actionLoading ? 'Saving…' : modal === 'create' ? 'Create' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={modal === 'delete'} onClose={() => setModal('')} title="Delete Category">
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Delete <span className="font-bold text-slate-900 dark:text-white">{selected?.name}</span>? Jobs in this category may lose their classification.
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

export default CategoriesManagement;
