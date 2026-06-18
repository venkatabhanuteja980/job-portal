import React from 'react';

export const Card = ({
  children,
  title,
  subtitle,
  action,
  className = '',
  hoverable = false,
  bodyClassName = '',
  ...props
}) => {
  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-xl shadow-xs overflow-hidden transition-all duration-200 ${
        hoverable ? 'hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700' : ''
      } ${className}`}
      {...props}
    >
      {/* Card Header (if title exists) */}
      {(title || subtitle || action) && (
        <div className="px-5 py-4 border-b border-slate-100 dark:border-dark-border flex items-center justify-between gap-4">
          <div className="text-left">
            {title && (
              <h3 className="font-bold font-display text-slate-900 dark:text-white leading-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-dark-text-muted mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      {/* Card Content Area */}
      <div className={`px-5 py-4 text-sm text-slate-700 dark:text-slate-300 ${bodyClassName}`}>
        {children}
      </div>
    </div>
  );
};

export default Card;
