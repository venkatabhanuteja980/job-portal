import React, { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Search, Zap, RefreshCw } from 'lucide-react';
import adminApi from '../../api/adminApi';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';

const CATEGORY_OPTIONS = [
  { value: '', label: 'All Categories' },
  { value: 'technical', label: 'Technical' },
  { value: 'soft', label: 'Soft Skills' },
  { value: 'language', label: 'Language' },
  { value: 'tool', label: 'Tools & Software' },
];

export const SkillsManagement = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modal, setModal] = useState(''); // 'create' | 'edit' | 'delete'
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState({ name: '', category: 'technical', aliases: '' });
  const [formError, setFormError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSkills = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getSkills({ search, category, page, limit: 20 });
      const d = res.data || {};
      setSkills(d.skills || d || []);
      setTotalPages(d.totalPages || 1);
    } catch (err) {
      setError(err.message || 'Failed to load skills.');
    } finally {
      setLoading(false);
    }
  }, [search, category, page]);

  useEffect(() => { fetchSkills(); }, [fetchSkills]);

  const openCreate = () => {
    setFormData({ name: '', category: 'technical', aliases: '' });
    setFormError('');
    setModal('create');
  };

  const openEdit = (skill) => {
    setSelected(skill);
    setFormData({
      name: skill.name || '',
      category: skill.category || 'technical',
      aliases: Array.isArray(skill.aliases) ? skill.aliases.join(', ') : skill.aliases || '',
    });
    setFormError('');
    setModal('edit');
  };

  const openDelete = (skill) => {
    setSelected(skill);
    setModal('delete');
  };

  const handleSave = async () => {
    if (!formData.name.trim()) { setFormError('Skill name is required.'); return; }
    setActionLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        category: formData.category,
        aliases: formData.aliases ? formData.aliases.split(',').map((a) => a.trim()).filter(Boolean) : [],
      };
      if (modal === 'create') {
        await adminApi.createSkill(payload);
      } else {
        await adminApi.updateSkill(selected._id, payload);
      }
      fetchSkills();
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
      await adminApi.deleteSkill(selected._id);
      fetchSkills();
      setModal('');
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const categoryColor = (cat) => {
    const map = {
      technical: 'primary',
      soft: 'success',
      language: 'warning',
      tool: 'info',
    };
    return map[cat] || 'default';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6 py-4"
    >
      <Helmet>
        <title>Skills Management — Admin</title>
        <meta name="description" content="Manage platform skill tags used in job matching." />
      </Helmet>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold font-display text-slate-900 dark:text-white">Skills Management</h1>
          <p className="text-sm text-slate-500 dark:text-dark-text-muted mt-0.5">Manage skill tags used for job matching and candidate profiles.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchSkills} className="flex items-center gap-1">
            <RefreshCw size={14} />
          </Button>
          <Button variant="primary" size="sm" onClick={openCreate} className="flex items-center gap-2">
            <Plus size={14} /> Add Skill
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              id="skill-search"
              placeholder="Search skills…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              leftIcon={<Search size={15} />}
            />
          </div>
          <select
            id="skill-category-filter"
            className="rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900 text-sm px-3 py-2 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 sm:w-44"
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          >
            {CATEGORY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Skills Tag Cloud / Grid */}
      {loading ? (
        <LoadingSkeleton type="card" count={3} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchSkills} />
      ) : skills.length === 0 ? (
        <EmptyState title="No skills found" description="Add your first skill tag." icon={Zap} />
      ) : (
        <Card className="p-5 border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900">
          <div className="flex flex-wrap gap-3">
            {skills.map((skill) => (
              <div
                key={skill._id}
                className="group flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-800 hover:shadow-sm transition-shadow"
              >
                <Badge variant={categoryColor(skill.category)} className="text-[9px] px-1.5 py-0.5">
                  {skill.category || 'tech'}
                </Badge>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{skill.name}</span>
                {skill.jobCount > 0 && (
                  <span className="text-[10px] text-slate-400">({skill.jobCount})</span>
                )}
                <div className="hidden group-hover:flex items-center gap-1 ml-1">
                  <button
                    onClick={() => openEdit(skill)}
                    className="text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300"
                  >
                    <Pencil size={11} />
                  </button>
                  <button
                    onClick={() => openDelete(skill)}
                    className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-300"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modal === 'create' || modal === 'edit'}
        onClose={() => setModal('')}
        title={modal === 'create' ? 'Add Skill' : 'Edit Skill'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5" htmlFor="skill-name">
              Skill Name <span className="text-rose-500">*</span>
            </label>
            <Input
              id="skill-name"
              placeholder="e.g. React.js"
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5" htmlFor="skill-cat">
              Category
            </label>
            <select
              id="skill-cat"
              className="w-full rounded-lg border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-800 text-sm px-3 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={formData.category}
              onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
            >
              <option value="technical">Technical</option>
              <option value="soft">Soft Skills</option>
              <option value="language">Language</option>
              <option value="tool">Tools & Software</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5" htmlFor="skill-aliases">
              Aliases (comma-separated)
            </label>
            <Input
              id="skill-aliases"
              placeholder="e.g. ReactJS, React"
              value={formData.aliases}
              onChange={(e) => setFormData((p) => ({ ...p, aliases: e.target.value }))}
            />
            <p className="text-xs text-slate-400 mt-1">Used for matching variations of the skill name.</p>
          </div>

          {formError && <p className="text-xs text-rose-500">{formError}</p>}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setModal('')}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} disabled={actionLoading}>
              {actionLoading ? 'Saving…' : modal === 'create' ? 'Add Skill' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={modal === 'delete'} onClose={() => setModal('')} title="Delete Skill">
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Delete skill <span className="font-bold text-slate-900 dark:text-white">{selected?.name}</span>? This may affect job matching for existing profiles.
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

export default SkillsManagement;
