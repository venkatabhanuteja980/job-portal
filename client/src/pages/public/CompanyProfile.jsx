import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Globe, MapPin, Building2, Calendar, Users, Briefcase, ArrowLeft } from 'lucide-react';
import publicApi from '../../api/publicApi';
import jobApi from '../../api/jobApi';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';

export const CompanyProfile = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  // States
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompanyData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await publicApi.getCompanyDetails(slug);
        const companyData = response.data;
        setCompany(companyData);

        // Fetch active jobs posted by this company
        const jobsResponse = await jobApi.getJobs({ company: companyData._id });
        setJobs(jobsResponse.data || []);
      } catch (err) {
        setError(err.message || 'Failed to retrieve company details.');
      } finally {
        setLoading(false);
      }
    };
    fetchCompanyData();
  }, [slug]);

  if (loading) return <LoadingSkeleton type="profile" className="py-12" />;
  if (error) return <ErrorState message={error} onRetry={() => navigate('/')} className="py-12" />;
  if (!company) return <ErrorState message="Company profile not found." className="py-12" />;

  const logoInitials = company.name ? company.name.substring(0, 2).toUpperCase() : 'CO';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-8 py-4 text-left max-w-5xl mx-auto"
    >
      <Helmet>
        <title>{`${company.name} - Company Profile | JobPortal`}</title>
        <meta name="description" content={company.description?.substring(0, 150) || 'Learn more about careers and jobs.'} />
      </Helmet>

      {/* Back button */}
      <div>
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-dark-text-muted dark:hover:text-white cursor-pointer">
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      {/* Hero Branding Header */}
      <Card className="p-6 border-slate-200">
        <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
          <div className="flex gap-4 items-center">
            <div className="h-16 w-16 rounded-xl bg-slate-100 flex items-center justify-center font-bold font-display text-lg text-slate-500 shrink-0 dark:bg-slate-800 dark:text-slate-400">
              {company.logo?.url ? (
                <img src={company.logo.url} alt={company.name} className="h-full w-full object-cover rounded-xl" />
              ) : (
                logoInitials
              )}
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-extrabold font-display text-slate-900 dark:text-white">
                {company.name}
              </h1>
              <p className="text-sm font-medium text-slate-500 dark:text-dark-text-muted">
                {company.industry}
              </p>
            </div>
          </div>

          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto shrink-0"
            >
              <Button variant="outline" size="sm" icon={Globe} className="w-full">
                Visit Website
              </Button>
            </a>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left pane: Description details */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="About Us" className="border-slate-200">
            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
              {company.description || 'No description provided.'}
            </p>
          </Card>
          
          {company.techStack && company.techStack.length > 0 && (
            <Card title="Tech Stack" className="border-slate-200">
              <div className="flex flex-wrap gap-2">
                {company.techStack.map((tech) => (
                  <span key={tech} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold dark:bg-slate-800 dark:text-slate-300">
                    {tech}
                  </span>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right pane: Facts summary */}
        <div className="lg:col-span-1 space-y-6">
          <Card title="Company Details" className="border-slate-200">
            <div className="space-y-4 text-sm">
              <div className="flex gap-3">
                <MapPin size={18} className="text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-850 dark:text-slate-200">Headquarters</p>
                  <p className="text-xs text-slate-500 dark:text-dark-text-muted mt-0.5">{company.headquarters}</p>
                </div>
              </div>

              {company.size && (
                <div className="flex gap-3">
                  <Users size={18} className="text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-850 dark:text-slate-200">Company Size</p>
                    <p className="text-xs text-slate-500 dark:text-dark-text-muted mt-0.5">{company.size} employees</p>
                  </div>
                </div>
              )}

              {company.foundedYear && (
                <div className="flex gap-3">
                  <Calendar size={18} className="text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-850 dark:text-slate-200">Founded</p>
                    <p className="text-xs text-slate-500 dark:text-dark-text-muted mt-0.5">{company.foundedYear}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Active Vacancies listings */}
      <section className="space-y-6 max-w-5xl mx-auto pt-6 text-left">
        <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
          <Briefcase size={20} /> Active Openings
        </h2>

        {jobs.length === 0 ? (
          <EmptyState
            title="No active job listings"
            description="This company hasn't posted any active job vacancies at the moment."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map((job) => (
              <Card
                key={job._id}
                hoverable
                onClick={() => navigate(`/jobs/${job._id}`)}
                className="p-5 cursor-pointer border-slate-200"
              >
                <h3 className="font-bold text-base text-slate-900 dark:text-white truncate">
                  {job.title}
                </h3>
                <div className="flex items-center gap-x-4 gap-y-1.5 flex-wrap text-xs text-slate-500 dark:text-dark-text-muted mt-2">
                  <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                  <span className="flex items-center gap-1 capitalize"><Building2 size={12} /> {job.locationType}</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-4 dark:border-dark-border">
                  <Badge variant="primary" className="capitalize">
                    {job.jobType.replace('-', ' ')}
                  </Badge>
                  <span className="text-xs text-slate-400">
                    Apply before {new Date(job.deadline).toLocaleDateString()}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </motion.div>
  );
};

export default CompanyProfile;
