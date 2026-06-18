import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Briefcase, Building2, Users, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import publicApi from '../../api/publicApi';
import SearchBar from '../../components/common/SearchBar';
import Card from '../../components/common/Card';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

export const Home = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ jobsCount: 0, companiesCount: 0, candidatesCount: 0 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [statsRes, catsRes] = await Promise.all([
          publicApi.getPlatformStats(),
          publicApi.getCategories(),
        ]);
        setStats(statsRes.data);
        setCategories(catsRes.data?.slice(0, 6) || []); // Show top 6
      } catch {
        // Fallback stats on connection failure
        setStats({ jobsCount: 15, companiesCount: 6, candidatesCount: 45 });
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const handleSearch = ({ title, location }) => {
    const params = new URLSearchParams();
    if (title) params.append('search', title);
    if (location) params.append('location', location);
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-16 py-4 text-left"
    >
      <Helmet>
        <title>JobPortal - Find Your Dream Job</title>
        <meta name="description" content="Search and apply for thousands of vacancies on the most advanced job portal. Powered by intelligent job matching algorithms." />
        <meta property="og:title" content="JobPortal - Find Your Dream Job" />
        <meta property="og:description" content="Search and apply for thousands of vacancies on the most advanced job portal." />
      </Helmet>

      {/* Hero Banner Section */}
      <section className="text-center space-y-6 max-w-4xl mx-auto pt-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold dark:bg-primary-950/20 dark:text-primary-400">
          <Sparkles size={12} /> Powered by AI Job Matching
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight font-display text-slate-900 dark:text-white leading-tight">
          Discover Your Next <span className="text-primary-600">Career Horizon</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto dark:text-dark-text-muted">
          Connect directly with top employers. Parse your CV in seconds, compute matching compatibility, and land interviews.
        </p>

        {/* Floating Search Bar */}
        <div className="pt-4 max-w-3xl mx-auto">
          <SearchBar onSearch={handleSearch} />
        </div>
      </section>

      {/* Platform Statistics Counters */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {[
          { label: 'Active Jobs', val: stats.jobsCount, icon: Briefcase, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400' },
          { label: 'Verified Companies', val: stats.companiesCount, icon: Building2, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400' },
          { label: 'Talented Candidates', val: stats.candidatesCount, icon: Users, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400' },
        ].map((item, idx) => (
          <Card key={idx} className="flex items-center gap-5 p-6 border-slate-150">
            <div className={`p-3.5 rounded-xl ${item.color}`}>
              <item.icon size={24} />
            </div>
            <div>
              <p className="text-3xl font-extrabold font-display text-slate-900 dark:text-white">{item.val}+</p>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">{item.label}</p>
            </div>
          </Card>
        ))}
      </section>

      {/* Top Categories Grid */}
      <section className="space-y-8 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
          <div>
            <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Popular Job Categories</h2>
            <p className="text-sm text-slate-500 dark:text-dark-text-muted mt-1">Explore job openings categorized by fields of expertises.</p>
          </div>
          <button
            onClick={() => navigate('/jobs')}
            className="flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 cursor-pointer"
          >
            All Categories <ArrowRight size={16} />
          </button>
        </div>

        {loading ? (
          <LoadingSkeleton type="card" count={3} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <Card
                key={cat._id}
                hoverable
                onClick={() => navigate(`/jobs?category=${cat._id}`)}
                className="p-5 cursor-pointer text-left border-slate-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center font-bold font-display dark:bg-primary-950/20 dark:text-primary-400 shrink-0">
                    {cat.name.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full dark:bg-primary-950/20 dark:text-primary-400">
                    {cat.jobCount || 0} jobs
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mt-4">{cat.name}</h3>
                <p className="text-xs text-slate-500 dark:text-dark-text-muted mt-1 truncate">
                  {cat.description || 'Explore active listings in this category.'}
                </p>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* For Candidates / For Employers CTAs */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto pt-8">
        <div className="p-8 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-blue-50/20 dark:border-dark-border dark:bg-slate-900/40 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">For Candidates</span>
            <h3 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Boost Your Job Hunt</h3>
            <p className="text-sm text-slate-500 dark:text-dark-text-muted">
              Create a profile, upload your resume for instant AI parsing, and automatically get scored against matching job listings.
            </p>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-primary-600" /> AI-powered resume parser</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-primary-600" /> Instantly calculate matching compatibility</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-primary-600" /> Apply with custom cover letters</li>
            </ul>
          </div>
          <button
            onClick={() => navigate('/register?role=candidate')}
            className="w-full sm:w-auto px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-semibold self-start cursor-pointer shadow-md shadow-primary-600/10"
          >
            Build Candidate Profile
          </button>
        </div>

        <div className="p-8 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-emerald-50/20 dark:border-dark-border dark:bg-slate-900/40 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">For Employers</span>
            <h3 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Find Top-Tier Talent</h3>
            <p className="text-sm text-slate-500 dark:text-dark-text-muted">
              Register your organization, post job profiles, and utilize our automated interview scheduling and candidate pipeline tools.
            </p>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-600" /> Showcase company brand profiles</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-600" /> Track applicants on visual pipelines</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-600" /> Schedule video interviews instantly</li>
            </ul>
          </div>
          <button
            onClick={() => navigate('/register?role=employer')}
            className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold self-start cursor-pointer shadow-md shadow-emerald-600/10"
          >
            Create Employer Account
          </button>
        </div>
      </section>
    </motion.div>
  );
};

export default Home;
