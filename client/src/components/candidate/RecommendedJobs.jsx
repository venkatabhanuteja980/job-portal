import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, MapPin, Briefcase, ChevronRight } from 'lucide-react';
import candidateApi from '../../api/candidateApi';
import Card from '../common/Card';
import Badge from '../common/Badge';
import LoadingSkeleton from '../common/LoadingSkeleton';
import ErrorState from '../common/ErrorState';
import EmptyState from '../common/EmptyState';

export const RecommendedJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await candidateApi.getRecommendations();
        setJobs(response.data || []);
      } catch (err) {
        setError(err.message || 'Failed to retrieve job recommendations.');
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, []);


  if (loading) return <LoadingSkeleton type="card" count={3} />;
  if (error) return <ErrorState message={error} onRetry={() => navigate(0)} />;
  if (jobs.length === 0) {
    return (
      <EmptyState
        title="No recommendations yet"
        description="Strengthen your profile by adding work experience and skills to get matching job suggestions."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
      {jobs.map((match) => {
        const job = match.job || match;
        const score = match.matchScore || 0;
        const matchingSkills = match.matchingSkills || [];
        const missingSkills = match.missingSkills || [];
        const companyInitials = job.company?.name ? job.company.name.substring(0, 2).toUpperCase() : 'CO';

        return (
          <Card
            key={job._id}
            hoverable
            onClick={() => navigate(`/jobs/${job._id}`)}
            className="p-5 cursor-pointer flex flex-col justify-between border-slate-200"
          >
            <div className="space-y-4">
              {/* Header: Company Initials & Match Score Indicator */}
              <div className="flex justify-between items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center font-bold font-display text-sm text-slate-500 shrink-0 dark:bg-slate-800 dark:text-slate-400">
                  {companyInitials}
                </div>
                
                {/* Score badge */}
                <Badge variant={score >= 70 ? 'success' : score >= 40 ? 'warning' : 'danger'} className="text-[10px]">
                  <Sparkles size={10} className="mr-1" /> {score}% Match
                </Badge>
              </div>

              {/* Title & Company */}
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 dark:text-white leading-tight truncate">
                  {job.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-dark-text-muted font-medium truncate">
                  {job.company?.name || 'Company Profile'}
                </p>
              </div>

              {/* Meta information tags */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
                <span className="flex items-center gap-0.5"><MapPin size={12} /> {job.location}</span>
                <span className="flex items-center gap-0.5 capitalize"><Briefcase size={12} /> {job.locationType}</span>
              </div>

              {/* Skills matched breakdown (condensed display) */}
              <div className="pt-3 border-t border-slate-100 dark:border-dark-border space-y-2 text-[10px]">
                {matchingSkills.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider mr-1">Matched:</span>
                    {matchingSkills.slice(0, 3).map((sk) => (
                      <span key={sk} className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-sm dark:bg-emerald-950/20 dark:text-emerald-400">
                        {sk}
                      </span>
                    ))}
                    {matchingSkills.length > 3 && <span className="text-slate-400">+{matchingSkills.length - 3}</span>}
                  </div>
                )}

                {missingSkills.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider mr-1">Missing:</span>
                    {missingSkills.slice(0, 3).map((sk) => (
                      <span key={sk} className="px-1.5 py-0.5 bg-red-50/50 text-red-700 rounded-sm dark:bg-red-950/20 dark:text-red-400">
                        {sk}
                      </span>
                    ))}
                    {missingSkills.length > 3 && <span className="text-slate-400">+{missingSkills.length - 3}</span>}
                  </div>
                )}
              </div>
            </div>

            {/* Footer card link */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-4 dark:border-dark-border">
              <Badge variant="primary" className="text-[10px] capitalize">
                {job.jobType.replace('-', ' ')}
              </Badge>
              <span className="text-[11px] text-slate-400 flex items-center">
                Details <ChevronRight size={12} className="ml-0.5" />
              </span>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default RecommendedJobs;
