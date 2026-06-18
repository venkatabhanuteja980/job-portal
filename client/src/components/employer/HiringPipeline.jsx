import React from 'react';
import { Check } from 'lucide-react';

export const HiringPipeline = ({ currentStatus }) => {
  const stages = [
    { key: 'applied', label: 'Applied' },
    { key: 'reviewed', label: 'Under Review' },
    { key: 'shortlisted', label: 'Shortlisted' },
    { key: 'interview', label: 'Interview' },
    { key: 'offered', label: 'Offered' },
    { key: 'hired', label: 'Hired' },
  ];

  // Helper to determine active index
  const getStageIndex = (status) => {
    switch (status) {
      case 'applied': return 0;
      case 'reviewed': return 1;
      case 'shortlisted': return 2;
      case 'interview': return 3;
      case 'offered': return 4;
      case 'hired': return 5;
      default: return -1; // e.g. rejected or withdrawn
    }
  };

  const currentIdx = getStageIndex(currentStatus);
  const isRejected = currentStatus === 'rejected';
  const isWithdrawn = currentStatus === 'withdrawn';

  if (isRejected || isWithdrawn) {
    return (
      <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-450 border border-rose-100 dark:border-rose-900/40 text-xs font-bold text-center">
        This candidate application has been {isRejected ? 'REJECTED' : 'WITHDRAWN'}.
      </div>
    );
  }

  return (
    <div className="w-full py-4 text-center">
      {/* Horizontal Pipeline Steps */}
      <div className="flex items-center justify-between relative max-w-2xl mx-auto">
        {/* Background Line */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 dark:bg-slate-800 z-0" />
        
        {/* Active Fill Line */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-emerald-500 z-0 transition-all duration-300"
          style={{ width: `${(Math.max(0, currentIdx) / (stages.length - 1)) * 100}%` }}
        />

        {stages.map((stage, idx) => {
          const isCompleted = idx < currentIdx;
          const isActive = idx === currentIdx;
          
          return (
            <div key={stage.key} className="flex flex-col items-center relative z-10 shrink-0">
              <div
                className={`h-7 w-7 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-all duration-300 select-none ${
                  isCompleted
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : isActive
                    ? 'bg-white border-emerald-500 text-emerald-600 dark:bg-slate-900 ring-4 ring-emerald-50 dark:ring-emerald-950/50'
                    : 'bg-white border-slate-200 text-slate-400 dark:bg-slate-900 dark:border-dark-border'
                }`}
              >
                {isCompleted ? <Check size={12} strokeWidth={3} /> : idx + 1}
              </div>
              <span
                className={`text-[9px] font-bold mt-2 uppercase tracking-wider ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400 font-extrabold'
                    : isCompleted
                    ? 'text-slate-700 dark:text-slate-350'
                    : 'text-slate-400 dark:text-dark-text-muted'
                }`}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HiringPipeline;
