import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { SlidersHorizontal, Briefcase, MapPin, DollarSign, Calendar, ChevronRight, X } from 'lucide-react';
import jobApi from '../../api/jobApi';
import publicApi from '../../api/publicApi';
import SearchBar from '../../components/common/SearchBar';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import Pagination from '../../components/common/Pagination';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';

export const Jobs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Search States
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [categories, setCategories] = useState([]);
  
  // Loading & Error States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter States
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedJobTypes, setSelectedJobTypes] = useState(searchParams.getAll('jobType'));
  const [selectedExperienceLevels, setSelectedExperienceLevels] = useState(searchParams.getAll('experienceLevel'));
  const [selectedLocationTypes, setSelectedLocationTypes] = useState(searchParams.getAll('locationType'));
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || '');
  const [minSalary, setMinSalary] = useState(searchParams.get('minSalary') || '');

  // Fetch categories list on mount
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await publicApi.getCategories();
        setCategories(res.data.map(c => ({ label: c.name, value: c._id })));
      } catch {
        // Ignored
      }
    };
    fetchCats();
  }, []);

  // Fetch Jobs based on URL search query parameters
  useEffect(() => {
    const fetchJobsData = async () => {
      setLoading(true);
      setError(null);
      
      const params = {};
      searchParams.forEach((value, key) => {
        if (value) {
          // If parameter holds multiple entries (like arrays)
          if (['jobType', 'experienceLevel', 'locationType'].includes(key)) {
            params[key] = searchParams.getAll(key).join(',');
          } else {
            params[key] = value;
          }
        }
      });
      
      // Enforce default limits
      if (!params.limit) params.limit = 10;
      if (!params.page) params.page = 1;

      try {
        const response = await jobApi.getJobs(params);
        setJobs(response.data || []);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } catch (err) {
        setError(err.message || 'Failed to retrieve job vacancy data.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobsData();
  }, [searchParams]);

  // Sync state with URL params
  const updateUrlParams = (newFilters = {}) => {
    const nextParams = new URLSearchParams(searchParams);
    
    // Merge filters
    Object.keys(newFilters).forEach((key) => {
      const val = newFilters[key];
      nextParams.delete(key); // Clear existing
      
      if (Array.isArray(val)) {
        val.forEach(item => nextParams.append(key, item));
      } else if (val) {
        nextParams.set(key, val);
      }
    });

    // Reset page on filter changes
    if (!newFilters.page && nextParams.get('page')) {
      nextParams.set('page', '1');
    }
    
    setSearchParams(nextParams);
  };

  const handleSearchHeader = ({ title, location }) => {
    updateUrlParams({ search: title, location: location });
  };

  const handleJobTypeChange = (type) => {
    const nextTypes = selectedJobTypes.includes(type)
      ? selectedJobTypes.filter((t) => t !== type)
      : [...selectedJobTypes, type];
    setSelectedJobTypes(nextTypes);
    updateUrlParams({ jobType: nextTypes });
  };

  const handleExperienceChange = (lvl) => {
    const nextLvls = selectedExperienceLevels.includes(lvl)
      ? selectedExperienceLevels.filter((l) => l !== lvl)
      : [...selectedExperienceLevels, lvl];
    setSelectedExperienceLevels(nextLvls);
    updateUrlParams({ experienceLevel: nextLvls });
  };

  const handleLocationTypeChange = (loc) => {
    const nextLocs = selectedLocationTypes.includes(loc)
      ? selectedLocationTypes.filter((l) => l !== loc)
      : [...selectedLocationTypes, loc];
    setSelectedLocationTypes(nextLocs);
    updateUrlParams({ locationType: nextLocs });
  };

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    setCategoryFilter(val);
    updateUrlParams({ category: val });
  };

  const handleSalaryChange = (e) => {
    const val = e.target.value;
    setMinSalary(val);
  };

  const applySalaryFilter = () => {
    updateUrlParams({ minSalary });
  };

  const clearAllFilters = () => {
    setSelectedJobTypes([]);
    setSelectedExperienceLevels([]);
    setSelectedLocationTypes([]);
    setCategoryFilter('');
    setMinSalary('');
    setSearchParams(new URLSearchParams({ page: '1', limit: '10' }));
  };

  const getPostedTime = (dateStr) => {
    const date = new Date(dateStr);
    const diff = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return '1 day ago';
    return `${diff} days ago`;
  };

  const filterSidebar = (
    <div className="space-y-6 text-left">
      <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-dark-border">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <SlidersHorizontal size={18} /> Filters
        </h3>
        <button
          onClick={clearAllFilters}
          className="text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 cursor-pointer"
        >
          Clear All
        </button>
      </div>

      {/* Categories select */}
      <div className="space-y-2">
        <Select
          label="Job Category"
          options={categories}
          value={categoryFilter}
          onChange={handleCategoryChange}
          placeholder="All Categories"
        />
      </div>

      {/* Job Types checkboxes */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-dark-text-muted">Job Type</h4>
        <div className="space-y-2">
          {['full-time', 'part-time', 'contract', 'internship', 'freelance'].map((type) => (
            <label key={type} className="flex items-center gap-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedJobTypes.includes(type)}
                onChange={() => handleJobTypeChange(type)}
                className="h-4 w-4 rounded-sm border-slate-300 text-primary-600 focus:ring-primary-600 cursor-pointer"
              />
              <span className="capitalize">{type.replace('-', ' ')}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Experience Levels checkboxes */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-dark-text-muted">Experience Level</h4>
        <div className="space-y-2">
          {['entry', 'mid', 'senior', 'lead', 'executive'].map((lvl) => (
            <label key={lvl} className="flex items-center gap-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedExperienceLevels.includes(lvl)}
                onChange={() => handleExperienceChange(lvl)}
                className="h-4 w-4 rounded-sm border-slate-300 text-primary-600 focus:ring-primary-600 cursor-pointer"
              />
              <span className="capitalize">{lvl}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Location Types */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-dark-text-muted">Location Type</h4>
        <div className="space-y-2">
          {['onsite', 'remote', 'hybrid'].map((loc) => (
            <label key={loc} className="flex items-center gap-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedLocationTypes.includes(loc)}
                onChange={() => handleLocationTypeChange(loc)}
                className="h-4 w-4 rounded-sm border-slate-300 text-primary-600 focus:ring-primary-600 cursor-pointer"
              />
              <span className="capitalize">{loc}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Salary Filter */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-dark-text-muted">Min Annual Salary</h4>
        <div className="flex gap-2">
          <input
            type="number"
            value={minSalary}
            onChange={handleSalaryChange}
            placeholder="e.g. 50000"
            className="flex-1 w-full px-3 py-1.5 rounded-lg border border-slate-300 text-sm dark:border-dark-border bg-white dark:bg-slate-800 focus:outline-none"
          />
          <Button variant="outline" size="sm" onClick={applySalaryFilter} className="px-3">
            Apply
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-8 py-4"
    >
      <Helmet>
        <title>Search Jobs - JobPortal</title>
        <meta name="description" content="Search and apply for active vacancies on our MERN job portal." />
      </Helmet>

      {/* Header Search Box */}
      <section className="max-w-4xl mx-auto">
        <SearchBar
          onSearch={handleSearchHeader}
          initialTitle={searchParams.get('search') || ''}
          initialLocation={searchParams.get('location') || ''}
        />
      </section>

      {/* Main Grid content split */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Sidebar Filters */}
        <div className="hidden lg:block lg:col-span-1 p-5 bg-white border border-slate-200 rounded-xl dark:border-dark-border dark:bg-slate-900 sticky top-24">
          {filterSidebar}
        </div>

        {/* Mobile Filter actions */}
        <div className="lg:hidden flex justify-between items-center w-full px-1">
          <p className="text-sm font-semibold text-slate-500">{pagination.total} jobs found</p>
          <Button
            variant="outline"
            size="sm"
            icon={SlidersHorizontal}
            onClick={() => setShowMobileFilters(true)}
          >
            Filters
          </Button>
        </div>

        {/* Mobile Drawer Overlay */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-black/55 backdrop-blur-xs" onClick={() => setShowMobileFilters(false)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 bottom-0 w-80 bg-white dark:bg-slate-900 p-6 overflow-y-auto z-10 flex flex-col space-y-4"
            >
              <div className="flex justify-between items-center border-b pb-2 dark:border-dark-border">
                <span className="font-bold text-slate-900 dark:text-white">Filters</span>
                <button onClick={() => setShowMobileFilters(false)}>
                  <X size={20} className="text-slate-400" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-2">
                {filterSidebar}
              </div>
              <Button variant="primary" className="w-full" onClick={() => setShowMobileFilters(false)}>
                Show Results
              </Button>
            </motion.div>
          </div>
        )}

        {/* Listings content */}
        <div className="lg:col-span-3 space-y-4">
          {loading ? (
            <LoadingSkeleton type="list" count={4} />
          ) : error ? (
            <ErrorState message={error} onRetry={() => setSearchParams(searchParams)} />
          ) : jobs.length === 0 ? (
            <EmptyState
              title="No matching jobs"
              description="We couldn't find any vacancies matching your filter options. Try resetting some parameter filters."
              action={<Button onClick={clearAllFilters}>Reset All Filters</Button>}
            />
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <Card
                  key={job._id}
                  hoverable
                  onClick={() => navigate(`/jobs/${job._id}`)}
                  className="p-5 cursor-pointer border-slate-200"
                >
                  <div className="flex flex-col sm:flex-row gap-4 items-start justify-between text-left">
                    {/* Job Details summary */}
                    <div className="flex gap-4 items-start">
                      <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 font-bold font-display dark:bg-slate-800 dark:text-slate-400">
                        {job.company?.name ? job.company.name.substring(0, 2).toUpperCase() : 'CO'}
                      </div>
                      
                      <div className="space-y-1">
                        <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">
                          {job.title}
                        </h3>
                        <p className="text-sm font-medium text-slate-600 dark:text-dark-text-muted">
                          {job.company?.name || 'Company Profile'}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1.5 text-xs text-slate-500 dark:text-dark-text-muted">
                          <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
                          <span className="flex items-center gap-1 capitalize"><Briefcase size={14} /> {job.locationType}</span>
                          {job.salary && !job.salary.isConfidential && (
                            <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                              <DollarSign size={14} />
                              {job.salary.min?.toLocaleString()} - {job.salary.max?.toLocaleString()} {job.salary.currency}
                            </span>
                          )}
                          <span className="flex items-center gap-1"><Calendar size={14} /> {getPostedTime(job.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <Badge variant="primary" className="capitalize">
                        {job.jobType.replace('-', ' ')}
                      </Badge>
                      <ChevronRight size={18} className="text-slate-400 shrink-0 hidden sm:block" />
                    </div>
                  </div>
                </Card>
              ))}

              {/* Pagination controls at bottom */}
              <Pagination
                page={pagination.page}
                totalPages={Math.ceil(pagination.total / pagination.limit)}
                onPageChange={(p) => updateUrlParams({ page: p })}
                hasNextPage={pagination.page < Math.ceil(pagination.total / pagination.limit)}
                hasPrevPage={pagination.page > 1}
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Jobs;
