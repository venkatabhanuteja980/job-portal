import React, { useState, useEffect } from 'react';
import { Calendar, GraduationCap, BookOpen, Award } from 'lucide-react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';

export const EducationForm = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
}) => {
  const [formData, setFormData] = useState({
    institution: '',
    degree: '',
    fieldOfStudy: '',
    startDate: '',
    endDate: '',
    grade: '',
    description: '',
  });

  const [errors, setErrors] = useState({});

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
          institution: initialData.institution || '',
          degree: initialData.degree || '',
          fieldOfStudy: initialData.fieldOfStudy || '',
          startDate: formatDateForInput(initialData.startDate),
          endDate: formatDateForInput(initialData.endDate),
          grade: initialData.grade || '',
          description: initialData.description || '',
        });
      } else {
        setFormData({
          institution: '',
          degree: '',
          fieldOfStudy: '',
          startDate: '',
          endDate: '',
          grade: '',
          description: '',
        });
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.institution.trim()) newErrors.institution = 'Institution is required';
    if (!formData.degree.trim()) newErrors.degree = 'Degree is required';

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) > new Date(formData.endDate)) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Education Record' : 'Add Education Record'}
      size="md"
    >
      <form onSubmit={handleFormSubmit} className="space-y-4 text-left">
        <Input
          label="Institution / School *"
          name="institution"
          value={formData.institution}
          onChange={handleChange}
          error={errors.institution}
          placeholder="e.g. Stanford University"
          icon={<GraduationCap size={16} />}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Degree / Certificate *"
            name="degree"
            value={formData.degree}
            onChange={handleChange}
            error={errors.degree}
            placeholder="e.g. Bachelor of Science"
            icon={<Award size={16} />}
            required
          />

          <Input
            label="Field of Study"
            name="fieldOfStudy"
            value={formData.fieldOfStudy}
            onChange={handleChange}
            error={errors.fieldOfStudy}
            placeholder="e.g. Computer Science"
            icon={<BookOpen size={16} />}
          />
        </div>

        {/* Date fields row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Start Date"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleChange}
            error={errors.startDate}
            icon={<Calendar size={16} />}
          />

          <Input
            label="End Date (or Expected)"
            name="endDate"
            type="date"
            value={formData.endDate}
            onChange={handleChange}
            error={errors.endDate}
            icon={<Calendar size={16} />}
          />
        </div>

        <Input
          label="Grade / GPA"
          name="grade"
          value={formData.grade}
          onChange={handleChange}
          error={errors.grade}
          placeholder="e.g. CGPA 9.2 or 3.8 / 4.0"
        />

        {/* Description Textarea */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-dark-text-muted">
            Activities & Notes
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe key coursework, honors, societies, or extra-curricular activities..."
            rows={3}
            className="w-full p-2.5 text-sm bg-white border border-slate-350 rounded-lg text-slate-900 dark:bg-slate-950 dark:border-dark-border dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-600 focus:border-primary-600"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-dark-border">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm">
            {initialData ? 'Save Changes' : 'Add Education'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EducationForm;
