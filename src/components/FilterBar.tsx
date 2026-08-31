import React from 'react';
import { Search, X, Globe, MapPin, Bookmark, SlidersHorizontal } from 'lucide-react';
import { NewsRegion } from '../types.js';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedRegion: NewsRegion;
  onRegionChange: (region: NewsRegion) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  minTrust: number;
  onMinTrustChange: (score: number) => void;
  savedCount: number;
  isSavedView: boolean;
  onToggleSavedView: (val: boolean) => void;
}

const CATEGORIES = [
  'All',
  'Science',
  'Technology',
  'Economy',
  'Geopolitics',
  'World',
  'Climate',
];

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedRegion,
  onRegionChange,
  selectedCategory,
  onCategoryChange,
  minTrust,
  onMinTrustChange,
  savedCount,
  isSavedView,
  onToggleSavedView,
}) => {
  const [showFilters, setShowFilters] = React.useState(false);
  const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'All' || minTrust > 0;

  return (
    <div className="space-y-4 mb-8">
      {/* Primary Wire & Regional Navigation Tabs */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 border-b border-[#E8E3D9] pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-full">
          {/* All Stories Tab */}
          <button
            id="tab-region-all"
            onClick={() => {
              onRegionChange('all');
              if (isSavedView) onToggleSavedView(false);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              !isSavedView && selectedRegion === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-[#F2EFE9]'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>All Wire</span>
          </button>

          {/* India Wire Tab */}
          <button
            id="tab-region-india"
            onClick={() => {
              onRegionChange('india');
              if (isSavedView) onToggleSavedView(false);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              !isSavedView && selectedRegion === 'india'
                ? 'bg-[#C2410C] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-[#F2EFE9]'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>India Wire</span>
            <span className={`text-3xs px-1.5 py-0.2 rounded font-bold ${
              !isSavedView && selectedRegion === 'india' ? 'bg-white/20 text-white' : 'bg-[#EAE5DC] text-[#C2410C]'
            }`}>
              PTI • The Hindu • ISRO
            </span>
          </button>

          {/* International Wire Tab */}
          <button
            id="tab-region-international"
            onClick={() => {
              onRegionChange('international');
              if (isSavedView) onToggleSavedView(false);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              !isSavedView && selectedRegion === 'international'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-[#F2EFE9]'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <span>International Wire</span>
            <span className={`text-3xs px-1.5 py-0.2 rounded font-bold ${
              !isSavedView && selectedRegion === 'international' ? 'bg-white/20 text-white' : 'bg-[#EAE5DC] text-slate-700'
            }`}>
              Reuters • AP • Nature
            </span>
          </button>

          {/* Saved Bookmarks Tab */}
          {savedCount > 0 && (
            <button
              id="tab-saved-dossiers"
              onClick={() => onToggleSavedView(true)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                isSavedView
                  ? 'bg-[#C2410C] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-[#F2EFE9]'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSavedView ? 'fill-white' : 'text-[#C2410C]'}`} />
              <span>Saved Dossiers</span>
              <span className={`text-3xs px-1.5 py-0.2 rounded-full font-bold ${
                isSavedView ? 'bg-white text-[#C2410C]' : 'bg-[#C2410C] text-white'
              }`}>
                {savedCount}
              </span>
            </button>
          )}
        </div>

        {/* Minimal Search and Filter Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="news-feed-search-input"
              type="text"
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="Search wire dispatches..."
              className="w-full pl-8 pr-7 py-1.5 bg-white border border-[#E8E3D9] rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#C2410C]"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowFilters(prev => !prev)}
            title="Refine by Category and Trust"
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
              showFilters || hasActiveFilters
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-[#E8E3D9] hover:bg-[#FAF8F5]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Refine</span>
          </button>
        </div>
      </div>

      {/* Secondary Refinement Row (Collapsible / Unobtrusive) */}
      {(showFilters || hasActiveFilters) && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#FAF8F5] border border-[#E8E3D9] rounded-xl text-xs">
          {/* Category Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-2xs font-bold uppercase text-slate-400 mr-1">Category:</span>
            {CATEGORIES.map(cat => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => onCategoryChange(cat)}
                  className={`px-2.5 py-1 rounded-md text-2xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800 text-white shadow-2xs'
                      : 'bg-white text-slate-600 border border-[#E8E3D9] hover:bg-[#FAF8F5]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Min Trust Floor */}
          <div className="flex items-center gap-1.5">
            <span className="text-2xs font-bold uppercase text-slate-400 mr-1">Min Verification:</span>
            {[
              { label: 'All', score: 0 },
              { label: '85%+', score: 85 },
              { label: '95%+ Tier 1', score: 95 },
            ].map(opt => (
              <button
                key={opt.score}
                onClick={() => onMinTrustChange(opt.score)}
                className={`px-2.5 py-1 rounded-md text-2xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  minTrust === opt.score
                    ? 'bg-[#C2410C] text-white shadow-2xs'
                    : 'bg-white text-slate-600 border border-[#E8E3D9] hover:bg-[#FAF8F5]'
                }`}
              >
                {opt.label}
              </button>
            ))}

            {hasActiveFilters && (
              <button
                onClick={() => {
                  onSearchChange('');
                  onCategoryChange('All');
                  onMinTrustChange(0);
                }}
                className="ml-2 text-2xs text-[#C2410C] hover:underline font-semibold cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
