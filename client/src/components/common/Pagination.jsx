import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({
  page = 1,
  totalPages = 1,
  onPageChange,
  hasNextPage = false,
  hasPrevPage = false,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  // Generate page numbers to display (e.g. max 5 around active page)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <nav className={`flex items-center justify-center gap-1.5 py-4 ${className}`} aria-label="Pagination Navigation">
      {/* Prev Button */}
      <button
        onClick={() => hasPrevPage && onPageChange(page - 1)}
        disabled={!hasPrevPage}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-dark-border dark:bg-slate-800 dark:text-dark-text-muted dark:hover:bg-slate-700"
        aria-label="Go to previous page"
      >
        <ChevronLeft size={16} />
      </button>

      {/* Pages list */}
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold transition-all ${
            page === p
              ? 'bg-primary-600 text-white shadow-xs'
              : 'border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 dark:border-dark-border dark:bg-slate-800 dark:text-dark-text-muted dark:hover:bg-slate-700'
          }`}
          aria-current={page === p ? 'page' : undefined}
          aria-label={`Go to page ${p}`}
        >
          {p}
        </button>
      ))}

      {/* Next Button */}
      <button
        onClick={() => hasNextPage && onPageChange(page + 1)}
        disabled={!hasNextPage}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-dark-border dark:bg-slate-800 dark:text-dark-text-muted dark:hover:bg-slate-700"
        aria-label="Go to next page"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
};

export default Pagination;
