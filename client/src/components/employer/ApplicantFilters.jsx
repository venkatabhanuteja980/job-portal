import React from 'react';
import { Search, SlidersHorizontal, RotateCcw } from 'lucide-react';
import Select from '../common/Select';

export const ApplicantFilters = ({
  search = '',
  onSearchChange,
  status = 'all',
  onStatusChange,
  minMatchScore = 0,
  onMinMatchScoreChange,
  sortBy = 'matchScore-desc',
  onSortByChange,
  onReset,
}) => {
  const statuses = [
    { value: 'all', label: 'All Stages' },
    { value: 'applied', label: 'Applied' },
    { value: 'reviewed', label: 'Under Review' },
    { value: 'shortlisted', label: 'Shortlisted' },
    { value: 'interview', label: 'Interviewing' },
    { value: 'offered', label: 'Offered' },
    { value: 'hired', label: 'Hired' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'withdrawn', label: 'Withdrawn' },
  ];

  const sortOptions = [
    { value: 'matchScore-desc', label: 'Highest Match Score' },
    { value: 'matchScore-asc', label: 'Lowest Match Score' },
    { value: 'appliedAt-desc', label: 'Newest First' },
    { value: 'appliedAt-asc', label: 'Oldest First' },
  ];

  return (
    <div className="p-4 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900 space-y-4 text-left">
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Name / Skill search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by candidate name or skill tag..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-350 dark:bg-slate-950 dark:border-dark-border rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-600 focus:border-primary-600"
          />
        </div>

        {/* Dropdowns row */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="w-40">
            <Select
              name="status"
              value={status}
              onChange={(e) => onStatusChange(e.target.value)}
              options={statuses}
            />
          </div>

          <div className="w-48">
            <Select
              name="sortBy"
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
              options={sortOptions}
            />
          </div>

          <button
            type="button"
            onClick={onReset}
            className="px-3.5 py-2 rounded-lg border border-slate-300 dark:border-dark-border hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-white flex items-center justify-center gap-1 text-xs font-bold shrink-0 cursor-pointer"
          >
            <RotateCcw size={13} /> Reset
          </button>
        </div>
      </div>

      {/* Match Score slider */}
      <div className="pt-2 border-t border-slate-100 dark:border-dark-border/40 flex flex-col sm:flex-row sm:items-center gap-4">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 shrink-0">
          <SlidersHorizontal size={14} /> Min Match Score: {minMatchScore}%
        </span>
        <div className="flex-1 flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={minMatchScore}
            onChange={(e) => onMinMatchScoreChange(parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-600"
          />
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 w-8 text-right">{minMatchScore}%</span>
        </div>
      </div>
    </div>
  );
};

export default ApplicantFilters;
