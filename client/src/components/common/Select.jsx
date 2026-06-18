import React from 'react';

export const Select = React.forwardRef(({
  label,
  error,
  helperText,
  options = [],
  className = '',
  id,
  placeholder = 'Select an option',
  ...props
}, ref) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full space-y-1.5 text-left">
      {/* Label */}
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-dark-text-muted"
        >
          {label}
        </label>
      )}

      {/* Select Field */}
      <select
        ref={ref}
        id={selectId}
        className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white dark:bg-slate-800 transition-colors focus:outline-none cursor-pointer ${
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
            : 'border-slate-300 dark:border-dark-border focus:border-primary-600 focus:ring-1 focus:ring-primary-600'
        } ${className}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Error or Helper text */}
      {error ? (
        <p id={`${selectId}-error`} className="text-xs text-red-600 dark:text-red-400">
          {error.message || error}
        </p>
      ) : (
        helperText && (
          <p id={`${selectId}-helper`} className="text-xs text-slate-500 dark:text-dark-text-muted">
            {helperText}
          </p>
        )
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
