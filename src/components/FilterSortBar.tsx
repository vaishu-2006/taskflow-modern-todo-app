import { useState } from 'react';
import { FilterType, SortType } from '../lib/filterSort';
import {
  Filter,
  ArrowUpDown,
  Search,
  X,
} from 'lucide-react';

interface FilterSortBarProps {
  onFilterChange: (filter: FilterType) => void;
  onSortChange: (sort: SortType) => void;
  onSearchChange: (query: string) => void;
  currentFilter: FilterType;
  currentSort: SortType;
  searchQuery: string;
}

export function FilterSortBar({
  onFilterChange,
  onSortChange,
  onSearchChange,
  currentFilter,
  currentSort,
  searchQuery,
}: FilterSortBarProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);

  const filterOptions: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'All Tasks' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'favorite', label: 'Favorites' },
    { value: 'today', label: "Today's Tasks" },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'high-priority', label: 'High Priority' },
    { value: 'medium-priority', label: 'Medium Priority' },
    { value: 'low-priority', label: 'Low Priority' },
  ];

  const sortOptions: { value: SortType; label: string }[] = [
    { value: 'recently-added', label: 'Recently Added' },
    { value: 'created-date', label: 'Created Date' },
    { value: 'due-date', label: 'Due Date' },
    { value: 'alphabetically', label: 'Alphabetically' },
    { value: 'priority', label: 'Priority' },
    { value: 'favorite-first', label: 'Favorites First' },
  ];

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search tasks by title, description, or category..."
          className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-800 dark:text-slate-100 placeholder-slate-400"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Filter and Sort Controls */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full px-4 py-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-500 transition-all flex items-center justify-center gap-2 text-slate-700 dark:text-slate-300 font-medium"
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>

          {showFilters && (
            <div className="absolute top-full left-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 z-20 w-48">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onFilterChange(option.value);
                    setShowFilters(false);
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 first:rounded-t-xl last:rounded-b-xl transition-colors ${
                    currentFilter === option.value
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 font-medium'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative flex-1">
          <button
            onClick={() => setShowSort(!showSort)}
            className="w-full px-4 py-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-500 transition-all flex items-center justify-center gap-2 text-slate-700 dark:text-slate-300 font-medium"
          >
            <ArrowUpDown className="w-4 h-4" />
            Sort
          </button>

          {showSort && (
            <div className="absolute top-full right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 z-20 w-48">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onSortChange(option.value);
                    setShowSort(false);
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 first:rounded-t-xl last:rounded-b-xl transition-colors ${
                    currentSort === option.value
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 font-medium'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
