import React, { useState, useEffect } from 'react';
import { Calendar, Building2, MapPin, Briefcase } from 'lucide-react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';

export const ExperienceForm = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
  });

  const [errors, setErrors] = useState({});

  // Helper to format date strings for input[type="date"]
  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          title: initialData.title || '',
          company: initialData.company || '',
          location: initialData.location || '',
          startDate: formatDateForInput(initialData.startDate),
          endDate: formatDateForInput(initialData.endDate),
          current: !!initialData.current,
          description: initialData.description || '',
        });
      } else {
        setFormData({
          title: '',
          company: '',
          location: '',
          startDate: '',
          endDate: '',
          current: false,
          description: '',
        });
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error for field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Job title is required';
    if (!formData.company.trim()) newErrors.company = 'Company name is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    
    if (!formData.current && !formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate && !formData.current) {
      if (new Date(formData.startDate) > new Date(formData.endDate)) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description cannot exceed 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const submissionData = { ...formData };
    if (submissionData.current) {
      submissionData.endDate = null; // Clear if currently working there
    }

    onSubmit(submissionData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Work Experience' : 'Add Work Experience'}
      size="md"
    >
      <form onSubmit={handleFormSubmit} className="space-y-4 text-left">
        <Input
          label="Job Title *"
          name="title"
          value={formData.title}
          onChange={handleChange}
          error={errors.title}
          placeholder="e.g. Senior Software Engineer"
          icon={<Briefcase size={16} />}
          required
        />

        <Input
          label="Company *"
          name="company"
          value={formData.company}
          onChange={handleChange}
          error={errors.company}
          placeholder="e.g. Acme Corp"
          icon={<Building2 size={16} />}
          required
        />

        <Input
          label="Location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          error={errors.location}
          placeholder="e.g. Bangalore, India (or Remote)"
          icon={<MapPin size={16} />}
        />

        {/* Date fields row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Start Date *"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleChange}
            error={errors.startDate}
            icon={<Calendar size={16} />}
            required
          />

          <Input
            label="End Date"
            name="endDate"
            type="date"
            value={formData.current ? '' : formData.endDate}
            onChange={handleChange}
            error={errors.endDate}
            disabled={formData.current}
            icon={<Calendar size={16} />}
          />
        </div>

        {/* Currently checkbox */}
        <div className="flex items-center gap-2 py-1">
          <input
            type="checkbox"
            id="current_exp"
            name="current"
            checked={formData.current}
            onChange={handleChange}
            className="h-4 w-4 rounded border-slate-300 dark:border-dark-border text-primary-600 focus:ring-primary-500 cursor-pointer"
          />
          <label htmlFor="current_exp" className="text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer selection:bg-transparent">
            I currently work in this role
          </label>
        </div>

        {/* Description Textarea */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-dark-text-muted">
            Role Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your achievements, tasks, and technologies used..."
            rows={4}
            className={`w-full p-2.5 text-sm bg-white border rounded-lg text-slate-900 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-600 focus:border-primary-600 ${
              errors.description
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                : 'border-slate-350 dark:border-dark-border'
            }`}
          />
          <div className="flex justify-between items-center text-[10px] text-slate-400">
            <span>{errors.description || 'Describe your responsibilities'}</span>
            <span className={formData.description.length > 1000 ? 'text-red-500 font-bold' : ''}>
              {formData.description.length} / 1000
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-dark-border">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm">
            {initialData ? 'Save Changes' : 'Add Experience'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ExperienceForm;
