import React from 'react';
import { Search, X } from 'lucide-react';
import { CategoryItem, DEFAULT_CATEGORIES } from '../types';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  categories?: CategoryItem[];
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories = DEFAULT_CATEGORIES
}) => {
  const allCategories = [
    { id: 'all', name: 'Semua' },
    ...categories
  ];

  return (
    <div className="space-y-3">
      {/* Search Input Bar */}
      <div className="relative flex items-center bg-white border border-stone-200 rounded-xl shadow-xs focus-within:border-stone-400 transition-colors">
        <div className="pl-3.5 pr-2 text-stone-400 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-stone-400" />
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari menu makanan atau minuman..."
          className="w-full py-3 pr-9 text-xs sm:text-sm text-stone-800 placeholder-stone-400 bg-transparent focus:outline-none"
        />

        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="p-1 mr-2 text-stone-400 hover:text-stone-600 rounded-full transition-colors cursor-pointer"
            aria-label="Hapus pencarian"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
        {allCategories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-stone-900 text-white'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
