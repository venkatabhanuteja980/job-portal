import React, { useState, useEffect } from 'react';
import { Briefcase, MapPin, DollarSign, Calendar, Award } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';
import Select from '../common/Select';
import SkillsSelector from '../candidate/SkillsSelector';
import publicApi from '../../api/publicApi';

export const JobForm = ({ initialData = null, onSubmit, loading = false }) => {
  const [categories, setCategories] = useState([]);
  const [fetchingCats, setFetchingCats] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    jobType: 'full-time',
    location: '',
    locationType: 'onsite',
    experienceLevel: 'entry',
    experienceMin: 0,
    experienceMax: '',
    salaryMin: '',
    salaryMax: '',
    salaryCurrency: 'INR',
    salaryIsNegotiable: false,
    salaryIsConfidential: false,
    educationRequired: '',
    openings: 1,
    deadline: '',
    description: '',
    requirementsInput: '',
    responsibilitiesInput: '',
    skills: [], // Array of Skill objects
    customSkills: [], // Array of strings
    benefitsInput: '',
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

  // Fetch categories on mount
  useEffect(() => {
    const fetchCats = async () => {
      setFetchingCats(true);
      try {
        const response = await publicApi.getCategories();
        setCategories(response.data || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setFetchingCats(false);
      }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        category: typeof initialData.category === 'object' ? initialData.category?._id : initialData.category || '',
        jobType: initialData.jobType || 'full-time',
        location: initialData.location || '',
        locationType: initialData.locationType || 'onsite',
        experienceLevel: initialData.experienceLevel || 'entry',
        experienceMin: initialData.experienceRequired?.min ?? 0,
        experienceMax: initialData.experienceRequired?.max ?? '',
        salaryMin: initialData.salary?.min ?? '',
        salaryMax: initialData.salary?.max ?? '',
        salaryCurrency: initialData.salary?.currency || 'INR',
        salaryIsNegotiable: !!initialData.salary?.isNegotiable,
        salaryIsConfidential: !!initialData.salary?.isConfidential,
        educationRequired: initialData.educationRequired || '',
        openings: initialData.openings || 1,
        deadline: formatDateForInput(initialData.deadline),
        description: initialData.description || '',
        requirementsInput: initialData.requirements ? initialData.requirements.join('\n') : '',
        responsibilitiesInput: initialData.responsibilities ? initialData.responsibilities.join('\n') : '',
        skills: initialData.skills || [],
        customSkills: initialData.customSkills || [],
        benefitsInput: initialData.benefits ? initialData.benefits.join(', ') : '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSkillsChange = (skills, customSkills) => {
    setFormData((prev) => ({
      ...prev,
      skills,
      customSkills,
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Job Title is required';
    if (!formData.category) newErrors.category = 'Job Category is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.description.trim()) newErrors.description = 'Job description is required';

    if (formData.salaryMin && formData.salaryMax) {
      if (parseFloat(formData.salaryMin) > parseFloat(formData.salaryMax)) {
        newErrors.salaryMax = 'Max salary must be greater than or equal to min salary';
      }
    }

    if (formData.experienceMin && formData.experienceMax) {
      if (parseInt(formData.experienceMin) > parseInt(formData.experienceMax)) {
        newErrors.experienceMax = 'Max experience must be greater than or equal to min experience';
      }
    }

    if (formData.deadline) {
      const selected = new Date(formData.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) {
        newErrors.deadline = 'Deadline date cannot be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Split requirements & responsibilities by newline
    const requirements = formData.requirementsInput
      ? formData.requirementsInput.split('\n').map((x) => x.trim()).filter(Boolean)
      : [];

    const responsibilities = formData.responsibilitiesInput
      ? formData.responsibilitiesInput.split('\n').map((x) => x.trim()).filter(Boolean)
      : [];

    const benefits = formData.benefitsInput
      ? formData.benefitsInput.split(',').map((x) => x.trim()).filter(Boolean)
      : [];

    const skillsIds = formData.skills.map((s) => typeof s === 'object' ? s._id : s);

    const submissionData = {
      title: formData.title,
      category: formData.category,
      jobType: formData.jobType,
      location: formData.location,
      locationType: formData.locationType,
      experienceLevel: formData.experienceLevel,
      experienceRequired: {
        min: formData.experienceMin ? parseInt(formData.experienceMin, 10) : 0,
        max: formData.experienceMax ? parseInt(formData.experienceMax, 10) : undefined,
      },
      salary: {
        min: formData.salaryMin ? parseFloat(formData.salaryMin) : undefined,
        max: formData.salaryMax ? parseFloat(formData.salaryMax) : undefined,
        currency: formData.salaryCurrency,
        isNegotiable: formData.salaryIsNegotiable,
        isConfidential: formData.salaryIsConfidential,
      },
      educationRequired: formData.educationRequired,
      openings: parseInt(formData.openings, 10) || 1,
      deadline: formData.deadline || undefined,
      description: formData.description,
      requirements,
      responsibilities,
      skills: skillsIds,
      customSkills: formData.customSkills,
      benefits,
    };

    onSubmit(submissionData);
  };

  const jobTypes = [
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'internship', label: 'Internship' },
    { value: 'freelance', label: 'Freelance' },
  ];

  const locationTypes = [
    { value: 'onsite', label: 'Onsite' },
    { value: 'remote', label: 'Remote' },
    { value: 'hybrid', label: 'Hybrid' },
  ];

  const expLevels = [
    { value: 'entry', label: 'Entry Level' },
    { value: 'mid', label: 'Mid Level' },
    { value: 'senior', label: 'Senior Level' },
    { value: 'lead', label: 'Lead' },
    { value: 'executive', label: 'Executive' },
  ];

  const currencies = [
    { value: 'INR', label: 'INR (₹)' },
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'GBP', label: 'GBP (£)' },
  ];

  const categoryOptions = [
    { value: '', label: 'Select a category...' },
    ...categories.map((c) => ({ value: c._id, label: c.name })),
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-left">
      {/* Block 1: Role Overview */}
      <div className="p-6 border border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900 rounded-xl space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-dark-text-muted border-b border-slate-100 dark:border-dark-border/40 pb-2 mb-2">
          Role Details
        </h3>

        <Input
          label="Job Title *"
          name="title"
          value={formData.title}
          onChange={handleChange}
          error={errors.title}
          placeholder="e.g. Senior Fullstack Engineer"
          icon={<Briefcase size={16} />}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Job Category *"
            name="category"
            value={formData.category}
            onChange={handleChange}
            options={categoryOptions}
            error={errors.category}
            required
            disabled={fetchingCats}
          />

          <Select
            label="Job Type *"
            name="jobType"
            value={formData.jobType}
            onChange={handleChange}
            options={jobTypes}
            required
          />

          <Select
            label="Location Type *"
            name="locationType"
            value={formData.locationType}
            onChange={handleChange}
            options={locationTypes}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <Input
              label="Location / City *"
              name="location"
              value={formData.location}
              onChange={handleChange}
              error={errors.location}
              placeholder="e.g. Bangalore, India (or Remote)"
              icon={<MapPin size={16} />}
              required
            />
          </div>

          <Input
            label="Openings Count"
            name="openings"
            type="number"
            value={formData.openings}
            onChange={handleChange}
            placeholder="1"
            min="1"
          />
        </div>
      </div>

      {/* Block 2: Qualifications & Experience */}
      <div className="p-6 border border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900 rounded-xl space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-dark-text-muted border-b border-slate-100 dark:border-dark-border/40 pb-2 mb-2">
          Qualifications & Experience
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Experience Level"
            name="experienceLevel"
            value={formData.experienceLevel}
            onChange={handleChange}
            options={expLevels}
          />

          <Input
            label="Min Experience (Years)"
            name="experienceMin"
            type="number"
            value={formData.experienceMin}
            onChange={handleChange}
            placeholder="0"
            min="0"
          />

          <Input
            label="Max Experience (Years)"
            name="experienceMax"
            type="number"
            value={formData.experienceMax}
            onChange={handleChange}
            error={errors.experienceMax}
            placeholder="e.g. 5"
            min="0"
          />
        </div>

        <Input
          label="Education Required"
          name="educationRequired"
          value={formData.educationRequired}
          onChange={handleChange}
          placeholder="e.g. Bachelor's Degree in Computer Science, or equivalent experience"
          icon={<Award size={16} />}
        />
      </div>

      {/* Block 3: Salary details */}
      <div className="p-6 border border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900 rounded-xl space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-dark-text-muted border-b border-slate-100 dark:border-dark-border/40 pb-2 mb-2">
          Salary & Compensation
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Select
            label="Currency"
            name="salaryCurrency"
            value={formData.salaryCurrency}
            onChange={handleChange}
            options={currencies}
            disabled={formData.salaryIsConfidential}
          />

          <Input
            label="Min Salary"
            name="salaryMin"
            type="number"
            value={formData.salaryMin}
            onChange={handleChange}
            placeholder="e.g. 800000"
            icon={<DollarSign size={16} />}
            disabled={formData.salaryIsConfidential}
          />

          <Input
            label="Max Salary"
            name="salaryMax"
            type="number"
            value={formData.salaryMax}
            onChange={handleChange}
            error={errors.salaryMax}
            placeholder="e.g. 1500000"
            icon={<DollarSign size={16} />}
            disabled={formData.salaryIsConfidential}
          />

          <Input
            label="Application Deadline"
            name="deadline"
            type="date"
            value={formData.deadline}
            onChange={handleChange}
            error={errors.deadline}
            icon={<Calendar size={16} />}
          />
        </div>

        <div className="flex flex-wrap gap-6 items-center pt-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="sal_nego"
              name="salaryIsNegotiable"
              checked={formData.salaryIsNegotiable}
              onChange={handleChange}
              disabled={formData.salaryIsConfidential}
              className="h-4 w-4 rounded border-slate-350 dark:border-dark-border text-primary-600 focus:ring-primary-500 cursor-pointer"
            />
            <label htmlFor="sal_nego" className="text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
              Salary is Negotiable
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="sal_conf"
              name="salaryIsConfidential"
              checked={formData.salaryIsConfidential}
              onChange={handleChange}
              className="h-4 w-4 rounded border-slate-350 dark:border-dark-border text-primary-600 focus:ring-primary-500 cursor-pointer"
            />
            <label htmlFor="sal_conf" className="text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
              Keep Salary Confidential (Display as &quot;Not Disclosed&quot;)
            </label>
          </div>
        </div>
      </div>

      {/* Block 4: Job description & text list requirements */}
      <div className="p-6 border border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900 rounded-xl space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-dark-text-muted border-b border-slate-100 dark:border-dark-border/40 pb-2 mb-2">
          Job Description & Specific Requirements
        </h3>

        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-dark-text-muted">
            Role Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Write a clear job description outlining day-to-day work, core systems etc..."
            rows={6}
            className={`w-full p-2.5 text-sm bg-white border rounded-lg text-slate-900 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-600 focus:border-primary-600 ${
              errors.description
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                : 'border-slate-350 dark:border-dark-border'
            }`}
          />
          {errors.description && <p className="text-[10px] text-red-500 font-semibold">{errors.description}</p>}
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-dark-text-muted">
            Key Requirements (One per line)
          </label>
          <textarea
            name="requirementsInput"
            value={formData.requirementsInput}
            onChange={handleChange}
            placeholder="e.g. 3+ years experience with React
Strong understanding of Node.js and REST APIs"
            rows={4}
            className="w-full p-2.5 text-sm bg-white border border-slate-350 dark:bg-slate-950 dark:border-dark-border rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-600 focus:border-primary-600"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-dark-text-muted">
            Responsibilities (One per line)
          </label>
          <textarea
            name="responsibilitiesInput"
            value={formData.responsibilitiesInput}
            onChange={handleChange}
            placeholder="e.g. Design, build, and maintain frontend pages
Collaborate with backend developers to link APIs"
            rows={4}
            className="w-full p-2.5 text-sm bg-white border border-slate-350 dark:bg-slate-950 dark:border-dark-border rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-600 focus:border-primary-600"
          />
        </div>

        <Input
          label="Benefits (Comma separated)"
          name="benefitsInput"
          value={formData.benefitsInput}
          onChange={handleChange}
          placeholder="e.g. Stock options, Hybrid layout, Medical benefits"
        />
      </div>

      {/* Block 5: Skills Tags */}
      <div className="p-6 border border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900 rounded-xl">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-dark-text-muted border-b border-slate-100 dark:border-dark-border/40 pb-2 mb-4">
          Target Skills tags
        </h3>
        <SkillsSelector
          selectedSkills={formData.skills}
          customSkills={formData.customSkills}
          onChange={handleSkillsChange}
        />
      </div>

      {/* Form Submission */}
      <div className="pt-2 flex justify-end">
        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={loading}
          className="w-full sm:w-auto"
        >
          {initialData ? 'Update Job Posting' : 'Publish Job Posting'}
        </Button>
      </div>
    </form>
  );
};

export default JobForm;
