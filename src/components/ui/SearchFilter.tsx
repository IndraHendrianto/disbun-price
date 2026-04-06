'use client';

import { useState } from 'react';

interface SearchFilterProps {
  searchPlaceholder?: string;
  categories?: string[];
  onSearch?: (query: string) => void;
  onFilter?: (category: string) => void;
}

export default function SearchFilter({
  searchPlaceholder = 'Cari komoditas...',
  categories = [],
  onSearch,
  onFilter,
}: SearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  const handleFilter = (category: string) => {
    setSelectedCategory(category);
    onFilter?.(category);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search Input */}
      <div className="relative flex-1">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] text-xl">
          search
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder={searchPlaceholder}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--border)] bg-white text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-all duration-200"
        />
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleFilter('Semua')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
              selectedCategory === 'Semua'
                ? 'bg-[var(--primary)] text-white shadow-md'
                : 'bg-white border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            Semua
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleFilter(cat)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                selectedCategory === cat
                  ? 'bg-[var(--primary)] text-white shadow-md'
                  : 'bg-white border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
