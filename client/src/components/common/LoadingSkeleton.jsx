import React from 'react';

export const LoadingSkeleton = ({
  type = 'card',
  count = 1,
  className = '',
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'list':
        return (
          <div className="space-y-4 w-full">
            {Array.from({ length: count }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 border border-slate-200 bg-white rounded-xl dark:border-dark-border dark:bg-slate-900 animate-pulse"
              >
                <div className="h-12 w-12 rounded-lg bg-slate-200 dark:bg-slate-800 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-sm" />
                  <div className="h-3.5 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-sm" />
                </div>
                <div className="h-8 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg shrink-0" />
              </div>
            ))}
          </div>
        );
      case 'text':
        return (
          <div className="space-y-2.5 w-full">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="space-y-2 animate-pulse">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-sm w-3/4" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-sm w-5/6" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-sm w-2/3" />
              </div>
            ))}
          </div>
        );
      case 'profile':
        return (
          <div className="p-6 border border-slate-200 bg-white rounded-xl dark:border-dark-border dark:bg-slate-900 animate-pulse space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="flex-1 space-y-2.5 text-center sm:text-left">
                <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-sm w-1/4 mx-auto sm:mx-0" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-sm w-1/2 mx-auto sm:mx-0" />
              </div>
            </div>
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-dark-border">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-sm w-full" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-sm w-5/6" />
            </div>
          </div>
        );
      case 'card':
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {Array.from({ length: count }).map((_, i) => (
              <div
                key={i}
                className="p-5 border border-slate-200 bg-white rounded-xl shadow-xs dark:border-dark-border dark:bg-slate-900 animate-pulse space-y-4"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-slate-200 dark:bg-slate-800" />
                  <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-sm w-24" />
                </div>
                <div className="space-y-2.5">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-sm w-2/3" />
                  <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-sm w-full" />
                  <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-sm w-5/6" />
                </div>
                <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-dark-border">
                  <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
                  <div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        );
    }
  };

  return <div className={className}>{renderSkeleton()}</div>;
};

export default LoadingSkeleton;
