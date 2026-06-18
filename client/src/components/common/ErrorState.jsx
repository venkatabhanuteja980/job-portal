import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import Button from './Button';

export const ErrorState = ({
  title = 'Something went wrong',
  message = 'We encountered an error loading this resource. Please try again.',
  onRetry = null,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 border border-red-150 bg-red-50/20 rounded-xl dark:border-red-950/20 dark:bg-red-950/5 ${className}`}
    >
      {/* Alert Icon */}
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400 mb-4">
        <AlertCircle size={24} />
      </div>

      {/* Details */}
      <h3 className="text-base font-bold font-display text-slate-900 dark:text-white mb-1.5">
        {title}
      </h3>
      <p className="max-w-md text-sm text-slate-500 dark:text-dark-text-muted mb-6">
        {message}
      </p>

      {/* Action Button */}
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          icon={RotateCcw}
          onClick={onRetry}
          className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-950/40 dark:text-red-400 dark:hover:bg-red-950/10"
        >
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
