import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import Button from './Button';

export const SearchBar = ({
  onSearch,
  initialTitle = '',
  initialLocation = '',
  className = '',
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [location, setLocation] = useState(initialLocation);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({ title, location });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex flex-col md:flex-row items-stretch border border-slate-200 bg-white rounded-xl shadow-xs overflow-hidden dark:border-dark-border dark:bg-slate-900 ${className}`}
    >
      {/* Keywords Search Input */}
      <div className="flex-1 flex items-center px-4 py-2 border-b md:border-b-0 md:border-r border-slate-100 dark:border-dark-border">
        <Search size={18} className="text-slate-400 dark:text-dark-text-muted shrink-0 mr-2.5" />
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Job title, keywords, or company..."
          className="w-full text-sm py-1.5 focus:outline-none bg-transparent"
        />
      </div>

      {/* Location Search Input */}
      <div className="flex-1 flex items-center px-4 py-2">
        <MapPin size={18} className="text-slate-400 dark:text-dark-text-muted shrink-0 mr-2.5" />
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="City, state, or remote..."
          className="w-full text-sm py-1.5 focus:outline-none bg-transparent"
        />
      </div>

      {/* Action Button */}
      <div className="p-2 flex items-center shrink-0">
        <Button
          type="submit"
          variant="primary"
          className="w-full md:w-auto h-full px-5 py-2.5 font-semibold text-sm rounded-lg"
        >
          Search
        </Button>
      </div>
    </form>
  );
};

export default SearchBar;
