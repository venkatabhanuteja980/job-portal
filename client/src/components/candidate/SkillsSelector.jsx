import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Plus } from 'lucide-react';
import publicApi from '../../api/publicApi';
import Badge from '../common/Badge';

export const SkillsSelector = ({
  selectedSkills = [], // Array of Skill objects (with _id, name)
  customSkills = [], // Array of strings
  onChange, // Callback: (skills, customSkills) => {}
}) => {
  const [dbSkills, setDbSkills] = useState([]);
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch all available skills from db
  useEffect(() => {
    const fetchSkills = async () => {
      setLoading(true);
      try {
        const response = await publicApi.getSkills();
        // Check if skills is directly in response.data or data.skills
        const skillsList = response.data || [];
        setDbSkills(skillsList.filter(sk => sk.isActive !== false));
      } catch (err) {
        console.error('Failed to load skills:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSkills();
  }, []);

  // Filter suggestions when search query or selected skills change
  useEffect(() => {
    if (!search.trim()) {
      setSuggestions([]);
      return;
    }

    const searchLower = search.toLowerCase();
    
    // Filter out skills that are already selected in db list
    const selectedIds = selectedSkills.map(s => typeof s === 'object' ? s._id : s);
    const filtered = dbSkills.filter(
      sk => sk.name.toLowerCase().includes(searchLower) && !selectedIds.includes(sk._id)
    );

    setSuggestions(filtered.slice(0, 10)); // Limit to 10 suggestions
  }, [search, dbSkills, selectedSkills]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddDbSkill = (skill) => {
    const updatedDb = [...selectedSkills, skill];
    onChange(updatedDb, customSkills);
    setSearch('');
    setIsOpen(false);
  };

  const handleAddCustomSkill = () => {
    const trimmed = search.trim();
    if (!trimmed) return;

    // Check if it matches any database skills exactly
    const matchedDbSkill = dbSkills.find(
      s => s.name.toLowerCase() === trimmed.toLowerCase()
    );

    if (matchedDbSkill) {
      const isAlreadySelected = selectedSkills.some(
        s => (typeof s === 'object' ? s._id : s) === matchedDbSkill._id
      );
      if (!isAlreadySelected) {
        handleAddDbSkill(matchedDbSkill);
      }
      setSearch('');
      return;
    }

    // Otherwise, add to custom skills
    const isAlreadyCustom = customSkills.some(
      s => s.toLowerCase() === trimmed.toLowerCase()
    );

    if (!isAlreadyCustom) {
      const updatedCustom = [...customSkills, trimmed];
      onChange(selectedSkills, updatedCustom);
    }
    
    setSearch('');
    setIsOpen(false);
  };

  const handleRemoveDbSkill = (skillId) => {
    const updatedDb = selectedSkills.filter(
      s => (typeof s === 'object' ? s._id : s) !== skillId
    );
    onChange(updatedDb, customSkills);
  };

  const handleRemoveCustomSkill = (skillName) => {
    const updatedCustom = customSkills.filter(s => s !== skillName);
    onChange(selectedSkills, updatedCustom);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // If suggestions are visible and there is one exact match, select it, otherwise add custom
      if (suggestions.length > 0 && suggestions[0].name.toLowerCase() === search.trim().toLowerCase()) {
        handleAddDbSkill(suggestions[0]);
      } else {
        handleAddCustomSkill();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="space-y-3 text-left w-full" ref={dropdownRef}>
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-dark-text-muted">
        Skills tags
      </label>

      {/* Autocomplete Input */}
      <div className="relative">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search skills (e.g. React, Python) or type and press Enter..."
            className="w-full pl-9 pr-12 py-2 text-sm bg-white border border-slate-350 dark:bg-slate-950 dark:border-dark-border rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-600 focus:border-primary-600"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Suggestion Dropdown */}
        {isOpen && (search.trim() || loading) && (
          <div className="absolute z-30 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg dark:border-dark-border dark:bg-slate-900 max-h-60 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-3 text-xs text-slate-500 dark:text-dark-text-muted italic">
                Loading skills database...
              </div>
            ) : (
              <>
                {suggestions.map((skill) => (
                  <button
                    key={skill._id}
                    type="button"
                    onClick={() => handleAddDbSkill(skill)}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-slate-700 dark:text-slate-350"
                  >
                    <span>{skill.name}</span>
                    <Badge variant="primary" className="text-[9px] uppercase">Official</Badge>
                  </button>
                ))}

                {search.trim() && !suggestions.some(s => s.name.toLowerCase() === search.trim().toLowerCase()) && (
                  <button
                    type="button"
                    onClick={handleAddCustomSkill}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 text-primary-600 dark:text-primary-400 font-semibold"
                  >
                    <Plus size={14} /> Add custom skill &quot;{search.trim()}&quot;
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Selected Tags list */}
      <div className="flex flex-wrap gap-2 pt-1.5">
        {selectedSkills.map((skill) => {
          const name = typeof skill === 'object' ? skill.name : skill;
          const id = typeof skill === 'object' ? skill._id : skill;
          return (
            <span
              key={id}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 dark:bg-primary-950/20 dark:text-primary-400 border border-primary-100 dark:border-primary-900/35"
            >
              {name}
              <button
                type="button"
                onClick={() => handleRemoveDbSkill(id)}
                className="hover:text-primary-950 dark:hover:text-white"
              >
                <X size={12} />
              </button>
            </span>
          );
        })}

        {customSkills.map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-dark-border"
          >
            {skill}
            <span className="text-[8px] font-bold text-slate-400 dark:text-dark-text-muted mr-0.5">CUSTOM</span>
            <button
              type="button"
              onClick={() => handleRemoveCustomSkill(skill)}
              className="hover:text-slate-950 dark:hover:text-white"
            >
              <X size={12} />
            </button>
          </span>
        ))}

        {selectedSkills.length === 0 && customSkills.length === 0 && (
          <span className="text-xs italic text-slate-400 dark:text-dark-text-muted">
            No skills added yet. Add skills to improve your recommendation matches.
          </span>
        )}
      </div>
    </div>
  );
};

export default SkillsSelector;
