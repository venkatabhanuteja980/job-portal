import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  Building2,
  Globe,
  MapPin,
  Edit2,
  ExternalLink,
  Laptop,
  Heart,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  CheckCircle,
  XCircle
} from 'lucide-react';
import employerApi from '../../api/employerApi';
import CompanyForm from '../../components/employer/CompanyForm';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

export const CompanyProfile = () => {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Edit mode toggle
  const [isEditing, setIsEditing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchCompanyDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await employerApi.getCompany();
      // Response returns company: Object or null
      setCompany(response.data?.company || response.data || null);
    } catch (err) {
      setError(err.message || 'Failed to retrieve company profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyDetails();
  }, []);

  const handleFormSubmit = async (data) => {
    setActionLoading(true);
    setError(null);
    setSuccessMsg('');
    try {
      if (company) {
        // Edit existing company profile
        const response = await employerApi.updateCompany(data);
        setCompany(response.data?.company || response.data || null);
        setSuccessMsg('Company profile updated successfully!');
      } else {
        // Create new company profile
        const response = await employerApi.createCompany(data);
        setCompany(response.data?.company || response.data || null);
        setSuccessMsg('Company profile created successfully!');
      }
      setIsEditing(false);
      // Refresh
      fetchCompanyDetails();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to save company profile information.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !company) {
    return (
      <div className="space-y-6 py-4">
        <LoadingSkeleton type="profile" count={1} />
        <LoadingSkeleton type="card" count={2} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6 py-4 text-left max-w-4xl mx-auto"
    >
      <Helmet>
        <title>Company Profile Management</title>
        <meta name="description" content="View and update your company details, logo, social links, and offices." />
      </Helmet>

      {/* Title Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight font-display text-slate-900 dark:text-white">
            Company Profile
          </h1>
          <p className="text-sm text-slate-500 dark:text-dark-text-muted mt-1">
            Manage your public facing brand, benefits, and office coordinates.
          </p>
        </div>

        {company && !isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1 shrink-0"
          >
            <Edit2 size={14} /> Edit Company Details
          </Button>
        )}
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-250 rounded-xl text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/40 dark:text-emerald-400 text-sm font-semibold flex items-center gap-2">
          <CheckCircle size={18} /> {successMsg}
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-250 rounded-xl text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/40 dark:text-rose-400 text-sm font-semibold flex items-center gap-2">
          <XCircle size={18} /> {error}
        </div>
      )}

      {/* Editing View */}
      {isEditing || !company ? (
        <Card className="p-6 border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-dark-border/40 pb-3 mb-6">
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">
              {company ? 'Edit Company Information' : 'Create Company Workspace'}
            </h2>
            {company && (
              <Button size="xs" variant="ghost" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            )}
          </div>
          
          <CompanyForm
            initialData={company}
            onSubmit={handleFormSubmit}
            loading={actionLoading}
          />
        </Card>
      ) : (
        /* Normal Display View */
        <div className="space-y-6">
          {/* Header Card */}
          <Card className="p-6 border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            <div className="h-24 w-24 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-dark-border/40 flex items-center justify-center shrink-0 overflow-hidden">
              {company.logo?.url ? (
                <img src={company.logo.url} alt={company.name} className="h-full w-full object-contain" />
              ) : (
                <Building2 size={36} className="text-slate-350" />
              )}
            </div>
            
            <div className="space-y-2 text-left min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display leading-tight truncate">
                  {company.name}
                </h2>
                {company.isVerified && (
                  <Badge variant="success" className="text-[9px] uppercase font-bold py-0.5 px-2">Verified</Badge>
                )}
              </div>

              <p className="text-xs font-semibold text-slate-500 dark:text-dark-text-muted capitalize">
                {company.industry} • {company.size?.replace('-', ' - ')} employees
              </p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-400 text-xs pt-1">
                {company.headquarters && <span className="flex items-center gap-0.5"><MapPin size={13} /> HQ: {company.headquarters}</span>}
                {company.website && (
                  <a href={company.website} target="_blank" rel="noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-0.5">
                    <Globe size={13} /> Visit Website <ExternalLink size={11} />
                  </a>
                )}
              </div>
            </div>
          </Card>

          {/* About / Description */}
          <Card className="p-6 border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-dark-border/40 pb-2">
              About the Company
            </h3>
            <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed whitespace-pre-wrap">
              {company.description}
            </p>
          </Card>

          {/* Tech Stack & Benefits row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tech Stack */}
            <Card className="p-6 border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-dark-border/40 pb-2 flex items-center gap-1.5">
                <Laptop size={16} /> Technology Stack
              </h3>
              {!company.techStack || company.techStack.length === 0 ? (
                <p className="text-xs italic text-slate-400">No tech stack items detailed.</p>
              ) : (
                <div className="flex flex-wrap gap-2 pt-1">
                  {company.techStack.map((tech) => (
                    <span key={tech} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 rounded-lg text-xs font-semibold">
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </Card>

            {/* Benefits */}
            <Card className="p-6 border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-dark-border/40 pb-2 flex items-center gap-1.5">
                <Heart size={16} /> Perks & Benefits
              </h3>
              {!company.benefits || company.benefits.length === 0 ? (
                <p className="text-xs italic text-slate-400">No perks detailed.</p>
              ) : (
                <div className="flex flex-wrap gap-2 pt-1">
                  {company.benefits.map((perk) => (
                    <span key={perk} className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-semibold">
                      {perk}
                    </span>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Locations and Social links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* HQ & Locations */}
            <Card className="md:col-span-2 p-6 border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-dark-border/40 pb-2">
                Office Locations
              </h3>
              <div className="space-y-3 pt-1">
                <div className="flex gap-2 items-start text-xs">
                  <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="block font-bold text-slate-700 dark:text-slate-300">Headquarters</span>
                    <span className="text-slate-500 dark:text-dark-text-muted">{company.headquarters}</span>
                  </div>
                </div>

                {company.locations?.length > 0 && (
                  <div className="flex gap-2 items-start text-xs pt-1 border-t border-slate-100 dark:border-dark-border/30">
                    <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="block font-bold text-slate-700 dark:text-slate-300">Other Offices</span>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-slate-500 dark:text-dark-text-muted">
                        {company.locations.map(loc => <span key={loc} className="after:content-[','] last:after:content-none">{loc}</span>)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Social profiles */}
            <Card className="p-6 border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-dark-border/40 pb-2">
                Social Networks
              </h3>
              <div className="space-y-3 pt-1 text-xs">
                {company.socialLinks?.linkedin ? (
                  <a href={company.socialLinks.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-slate-650 hover:text-primary-600 dark:text-slate-350 dark:hover:text-primary-400 font-semibold">
                    <Linkedin size={16} /> LinkedIn Profile
                  </a>
                ) : (
                  <span className="flex items-center gap-2 text-slate-400"><Linkedin size={16} /> Unlinked</span>
                )}

                {company.socialLinks?.twitter ? (
                  <a href={company.socialLinks.twitter} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-slate-650 hover:text-primary-600 dark:text-slate-350 dark:hover:text-primary-400 font-semibold">
                    <Twitter size={16} /> Twitter Profile
                  </a>
                ) : (
                  <span className="flex items-center gap-2 text-slate-400"><Twitter size={16} /> Unlinked</span>
                )}

                {company.socialLinks?.facebook ? (
                  <a href={company.socialLinks.facebook} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-slate-650 hover:text-primary-600 dark:text-slate-350 dark:hover:text-primary-400 font-semibold">
                    <Facebook size={16} /> Facebook Page
                  </a>
                ) : (
                  <span className="flex items-center gap-2 text-slate-400"><Facebook size={16} /> Unlinked</span>
                )}

                {company.socialLinks?.instagram ? (
                  <a href={company.socialLinks.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-slate-650 hover:text-primary-600 dark:text-slate-350 dark:hover:text-primary-400 font-semibold">
                    <Instagram size={16} /> Instagram Page
                  </a>
                ) : (
                  <span className="flex items-center gap-2 text-slate-400"><Instagram size={16} /> Unlinked</span>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CompanyProfile;
