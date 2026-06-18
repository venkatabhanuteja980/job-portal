import React, { useState, useEffect, useRef } from 'react';
import { Building2, Globe, Mail, Phone, MapPin, Calendar, DollarSign, CheckCircle2, AlertCircle } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';
import Select from '../common/Select';
import employerApi from '../../api/employerApi';

export const CompanyForm = ({ initialData = null, onSubmit, loading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    email: '',
    phone: '',
    industry: '',
    description: '',
    headquarters: '',
    locationsInput: '',
    size: '1-10',
    foundedYear: '',
    revenue: '',
    techStackInput: '',
    benefitsInput: '',
    socialLinks: {
      linkedin: '',
      twitter: '',
      facebook: '',
      instagram: '',
    },
  });

  const [logoPreview, setLogoPreview] = useState('');
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState(null);
  const [errors, setErrors] = useState({});
  const [logoSuccess, setLogoSuccess] = useState('');
  const [logoError, setLogoError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        website: initialData.website || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        industry: initialData.industry || '',
        description: initialData.description || '',
        headquarters: initialData.headquarters || '',
        locationsInput: initialData.locations ? initialData.locations.join(', ') : '',
        size: initialData.size || '1-10',
        foundedYear: initialData.foundedYear || '',
        revenue: initialData.revenue || '',
        techStackInput: initialData.techStack ? initialData.techStack.join(', ') : '',
        benefitsInput: initialData.benefits ? initialData.benefits.join(', ') : '',
        socialLinks: {
          linkedin: initialData.socialLinks?.linkedin || '',
          twitter: initialData.socialLinks?.twitter || '',
          facebook: initialData.socialLinks?.facebook || '',
          instagram: initialData.socialLinks?.instagram || '',
        },
      });

      if (initialData.logo?.url) {
        setLogoUrl(initialData.logo);
        setLogoPreview(initialData.logo.url);
      }
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSocialChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [name]: value,
      },
    }));
  };

  const handleLogoFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        setLogoError('Logo image size must be under 2MB.');
        return;
      }
      
      setLogoPreview(URL.createObjectURL(file));
      setLogoError('');
      setLogoSuccess('');

      // Auto-upload logo when selected
      setLogoUploading(true);
      try {
        const logoFormData = new FormData();
        logoFormData.append('logo', file);
        const response = await employerApi.uploadLogo(logoFormData);
        
        // Response contains logo: { url, publicId }
        const uploadedLogo = response.data?.logo || response.data || {};
        setLogoUrl(uploadedLogo);
        setLogoSuccess('Logo uploaded successfully!');
        setTimeout(() => setLogoSuccess(''), 3000);
      } catch (err) {
        setLogoError(err.message || 'Failed to upload logo.');
      } finally {
        setLogoUploading(false);
      }
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Company Name is required';
    if (!formData.industry.trim()) newErrors.industry = 'Industry is required';
    if (!formData.headquarters.trim()) newErrors.headquarters = 'Headquarters address is required';
    if (!formData.description.trim()) newErrors.description = 'Company description is required';

    if (formData.foundedYear && (parseInt(formData.foundedYear) < 1800 || parseInt(formData.foundedYear) > new Date().getFullYear())) {
      newErrors.foundedYear = 'Please enter a valid founded year';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Process inputs into lists
    const locations = formData.locationsInput
      ? formData.locationsInput.split(',').map((x) => x.trim()).filter(Boolean)
      : [];

    const techStack = formData.techStackInput
      ? formData.techStackInput.split(',').map((x) => x.trim()).filter(Boolean)
      : [];

    const benefits = formData.benefitsInput
      ? formData.benefitsInput.split(',').map((x) => x.trim()).filter(Boolean)
      : [];

    const submissionData = {
      name: formData.name,
      website: formData.website,
      email: formData.email,
      phone: formData.phone,
      industry: formData.industry,
      description: formData.description,
      headquarters: formData.headquarters,
      locations,
      size: formData.size,
      foundedYear: formData.foundedYear ? parseInt(formData.foundedYear, 10) : undefined,
      revenue: formData.revenue,
      techStack,
      benefits,
      socialLinks: formData.socialLinks,
    };

    if (logoUrl) {
      submissionData.logo = logoUrl;
    }

    onSubmit(submissionData);
  };

  const companySizes = [
    { value: '1-10', label: '1 - 10 employees' },
    { value: '11-50', label: '11 - 50 employees' },
    { value: '51-200', label: '51 - 200 employees' },
    { value: '201-500', label: '201 - 500 employees' },
    { value: '501-1000', label: '501 - 1000 employees' },
    { value: '1001-5000', label: '1001 - 5000 employees' },
    { value: '5000+', label: '5000+ employees' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-left">
      {/* Section 1: Logo & Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 flex flex-col items-center justify-center p-6 border border-slate-200 dark:border-dark-border bg-slate-50/50 dark:bg-slate-950/20 rounded-xl text-center">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Company Logo</label>
          
          <div className="relative h-28 w-28 rounded-xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-dark-border flex items-center justify-center mb-4 group shrink-0">
            {logoPreview ? (
              <img src={logoPreview} alt="Company Logo" className="h-full w-full object-contain" />
            ) : (
              <Building2 size={36} className="text-slate-350" />
            )}
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer text-xs font-bold"
            >
              Upload Logo
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleLogoFileChange}
            accept="image/*"
            className="hidden"
          />

          <p className="text-[10px] text-slate-400">Accepts PNG, JPG (Max 2MB)</p>
          
          {logoUploading && <span className="text-xs text-primary-600 dark:text-primary-400 font-bold mt-2 animate-pulse">Uploading Logo...</span>}
          {logoSuccess && <span className="text-xs text-emerald-600 font-bold mt-2 flex items-center gap-0.5"><CheckCircle2 size={12} /> {logoSuccess}</span>}
          {logoError && <span className="text-xs text-rose-500 font-bold mt-2 flex items-center gap-0.5"><AlertCircle size={12} /> {logoError}</span>}
        </div>

        <div className="md:col-span-2 space-y-4">
          <Input
            label="Company Name *"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="e.g. Acme Corporation"
            icon={<Building2 size={16} />}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Website URL"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="e.g. https://acme.com"
              icon={<Globe size={16} />}
            />

            <Input
              label="Contact Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. hr@acme.com"
              icon={<Mail size={16} />}
            />
          </div>
        </div>
      </div>

      {/* Section 2: Details */}
      <div className="p-6 border border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900 rounded-xl space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-dark-text-muted border-b border-slate-100 dark:border-dark-border/40 pb-2 mb-2">
          Company Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <Input
              label="Industry *"
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              error={errors.industry}
              placeholder="e.g. Information Technology, Financial Services"
              required
            />
          </div>

          <Select
            label="Company Size"
            name="size"
            value={formData.size}
            onChange={handleChange}
            options={companySizes}
          />

          <Input
            label="Founded Year"
            name="foundedYear"
            type="number"
            value={formData.foundedYear}
            onChange={handleChange}
            error={errors.foundedYear}
            placeholder="e.g. 2015"
            icon={<Calendar size={16} />}
          />

          <Input
            label="Annual Revenue"
            name="revenue"
            value={formData.revenue}
            onChange={handleChange}
            placeholder="e.g. $10M - $50M"
            icon={<DollarSign size={16} />}
          />

          <Input
            label="Contact Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="e.g. +1 555-123-4567"
            icon={<Phone size={16} />}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-dark-text-muted">
            Company Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your company culture, mission, and focus..."
            rows={5}
            className={`w-full p-2.5 text-sm bg-white border rounded-lg text-slate-900 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-600 focus:border-primary-600 ${
              errors.description
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                : 'border-slate-350 dark:border-dark-border'
            }`}
          />
          {errors.description && <p className="text-[10px] text-red-500 font-semibold">{errors.description}</p>}
        </div>
      </div>

      {/* Section 3: Headquarters & Locations */}
      <div className="p-6 border border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900 rounded-xl space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-dark-text-muted border-b border-slate-100 dark:border-dark-border/40 pb-2 mb-2">
          Headquarters & Office Locations
        </h3>

        <div className="grid grid-cols-1 gap-4">
          <Input
            label="Headquarters Address *"
            name="headquarters"
            value={formData.headquarters}
            onChange={handleChange}
            error={errors.headquarters}
            placeholder="e.g. San Francisco, CA, USA"
            icon={<MapPin size={16} />}
            required
          />

          <Input
            label="Office Locations (Comma separated)"
            name="locationsInput"
            value={formData.locationsInput}
            onChange={handleChange}
            placeholder="e.g. New York, London, Bangalore, Tokyo"
            icon={<MapPin size={16} />}
          />
        </div>
      </div>

      {/* Section 4: Tech Stack & Benefits */}
      <div className="p-6 border border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900 rounded-xl space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-dark-text-muted border-b border-slate-100 dark:border-dark-border/40 pb-2 mb-2">
          Technology & Benefits
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Tech Stack (Comma separated)"
            name="techStackInput"
            value={formData.techStackInput}
            onChange={handleChange}
            placeholder="e.g. React, Node.js, MongoDB, Kubernetes"
          />

          <Input
            label="Company Benefits (Comma separated)"
            name="benefitsInput"
            value={formData.benefitsInput}
            onChange={handleChange}
            placeholder="e.g. Remote work, Health insurance, Unlimited PTO"
          />
        </div>
      </div>

      {/* Section 5: Social Links */}
      <div className="p-6 border border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900 rounded-xl space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-dark-text-muted border-b border-slate-100 dark:border-dark-border/40 pb-2 mb-2">
          Social Links
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="LinkedIn Page"
            name="linkedin"
            value={formData.socialLinks.linkedin}
            onChange={handleSocialChange}
            placeholder="https://linkedin.com/company/acme"
          />
          <Input
            label="Twitter / X Page"
            name="twitter"
            value={formData.socialLinks.twitter}
            onChange={handleSocialChange}
            placeholder="https://x.com/acme"
          />
          <Input
            label="Facebook Page"
            name="facebook"
            value={formData.socialLinks.facebook}
            onChange={handleSocialChange}
            placeholder="https://facebook.com/acme"
          />
          <Input
            label="Instagram Page"
            name="instagram"
            value={formData.socialLinks.instagram}
            onChange={handleSocialChange}
            placeholder="https://instagram.com/acme"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-2 flex justify-end">
        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={loading}
          className="w-full sm:w-auto"
        >
          {initialData ? 'Update Company Profile' : 'Create Company Profile'}
        </Button>
      </div>
    </form>
  );
};

export default CompanyForm;
