import React, { useState } from 'react';

export const Avatar = ({
  name = '',
  url,
  size = 'md',
  className = '',
  ...props
}) => {
  const [imageError, setImageError] = useState(false);

  // Extract initials (e.g., "John Smith" -> "JS", "Jane" -> "J")
  const getInitials = (fullName) => {
    if (!fullName) return '?';
    const names = fullName.trim().split(/\s+/);
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return names[0][0].toUpperCase();
  };

  const sizes = {
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-16 w-16 text-xl',
    xl: 'h-24 w-24 text-3xl',
  };

  return (
    <div
      className={`relative flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold font-display select-none shrink-0 overflow-hidden ${sizes[size]} ${className}`}
      {...props}
    >
      {url && !imageError ? (
        <img
          src={url}
          alt={name}
          onError={() => setImageError(true)}
          className="h-full w-full object-cover rounded-full"
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
};

export default Avatar;
