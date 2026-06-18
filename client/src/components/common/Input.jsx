import React from 'react';

export const Input = React.forwardRef(({
  label,
  error,
  helperText,
  type = 'text',
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full space-y-1.5 text-left">
      {/* Label Tag */}
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-dark-text-muted"
        >
          {label}
        </label>
      )}

      {/* Input Field */}
      <input
        ref={ref}
        id={inputId}
        type={type}
        className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white dark:bg-slate-800 transition-colors focus:outline-none ${
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
            : 'border-slate-300 dark:border-dark-border focus:border-primary-600 focus:ring-1 focus:ring-primary-600'
        } ${className}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
        {...props}
      />

      {/* Helper text or validation error message */}
      {error ? (
        <p id={`${inputId}-error`} className="text-xs text-red-600 dark:text-red-400">
          {error.message || error}
        </p>
      ) : (
        helperText && (
          <p id={`${inputId}-helper`} className="text-xs text-slate-500 dark:text-dark-text-muted">
            {helperText}
          </p>
        )
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
