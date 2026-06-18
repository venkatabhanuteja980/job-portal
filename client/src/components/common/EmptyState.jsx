import React from 'react';
import { Inbox } from 'lucide-react';

export const EmptyState = ({
  title = 'No data found',
  description = 'There is nothing to display here at the moment.',
  icon: Icon = Inbox,
  action = null,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 md:p-12 border border-dashed border-slate-300 rounded-xl bg-slate-50/50 dark:border-dark-border dark:bg-slate-900/10 ${className}`}
    >
      {/* Icon Frame */}
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-950/20 dark:text-primary-400 mb-4">
        <Icon size={24} />
      </div>

      {/* Message Info */}
      <h3 className="text-base font-bold font-display text-slate-900 dark:text-white mb-1.5">
        {title}
      </h3>
      <p className="max-w-sm text-sm text-slate-500 dark:text-dark-text-muted mb-6">
        {description}
      </p>

      {/* Call to action element */}
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export default EmptyState;
