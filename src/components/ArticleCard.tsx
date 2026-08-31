import React, { useState, memo } from 'react';
import { Clock, ArrowUpRight, Bookmark, BookmarkCheck, MapPin, Globe, ShieldCheck } from 'lucide-react';
import { NewsArticle } from '../types.js';
import { TrustBadge } from './TrustBadge.js';

interface ArticleCardProps {
  article: NewsArticle;
  onSelect: (article: NewsArticle) => void;
  featured?: boolean;
  isBookmarked?: boolean;
  onToggleBookmark?: (article: NewsArticle, e: React.MouseEvent) => void;
  layoutMode?: 'grid' | 'compact';
}

export const ArticleCard: React.FC<ArticleCardProps> = memo(({
  article,
  onSelect,
  featured = false,
  isBookmarked = false,
  onToggleBookmark,
  layoutMode = 'grid',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const verifiedClaimsCount = article.claims.filter(c => c.status === 'VERIFIED').length;
  const isIndia = article.region === 'india';

  const timeAgo = (dateStr: string) => {
    const timestamp = new Date(dateStr).getTime();
    if (isNaN(timestamp)) return 'Just now';
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60 || diff < 0) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  // Compact List Row Mode
  if (layoutMode === 'compact' && !featured) {
    return (
      <article
        id={`article-card-compact-${article.id}`}
        onClick={() => onSelect(article)}
        className="group bg-white border border-[#E8E3D9] rounded-xl px-5 py-4 flex items-center justify-between gap-5 hover:border-slate-800 hover:bg-[#FAF8F5] transition-colors duration-150 cursor-pointer shadow-2xs"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="text-xs font-bold text-slate-900 truncate">
              {article.primaryPublisher.name}
            </span>

            {/* Minor metadata tags */}
            <div className="hidden sm:flex items-center gap-2 opacity-75 group-hover:opacity-100 transition-opacity">
              <span className="text-slate-300">•</span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-3xs font-mono font-bold rounded ${
                isIndia ? 'bg-amber-50 text-[#C2410C] border border-amber-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}>
                {isIndia ? <MapPin className="w-2.5 h-2.5" /> : <Globe className="w-2.5 h-2.5" />}
                {isIndia ? 'India Wire' : 'Global Wire'}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-3xs font-medium text-slate-500 uppercase tracking-wider">{article.category}</span>
              <span className="text-slate-300">•</span>
              <span className="text-3xs text-slate-500 font-mono">{timeAgo(article.publishedAt)}</span>
            </div>
          </div>

          <h3 className="article-font text-base sm:text-[17px] font-semibold text-slate-900 leading-snug group-hover:text-[#C2410C] transition-colors truncate">
            {article.title}
          </h3>
        </div>

        <div className="flex items-center gap-3.5 shrink-0">
          <TrustBadge score={article.trustScore} verdict={article.verdict} size="sm" />

          {onToggleBookmark && (
            <button
              type="button"
              title={isBookmarked ? 'Remove bookmark' : 'Bookmark story'}
              onClick={(e) => onToggleBookmark(article, e)}
              className="p-1.5 rounded text-slate-300 hover:text-[#C2410C] transition-colors cursor-pointer"
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-4 h-4 text-[#C2410C] fill-[#C2410C]" />
              ) : (
                <Bookmark className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </button>
          )}

          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </article>
    );
  }

  // Featured Lead Story Card
  if (featured) {
    return (
      <article
        id={`article-card-${article.id}`}
        onClick={() => onSelect(article)}
        className="group relative bg-white border border-[#E8E3D9] rounded-2xl overflow-hidden shadow-2xs hover:shadow-md hover:border-slate-800 transition-all duration-200 cursor-pointer grid grid-cols-1 lg:grid-cols-12 gap-0"
      >
        <div className="lg:col-span-7 p-7 sm:p-9 lg:p-10 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  {article.primaryPublisher.name}
                </span>

                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500 font-mono">
                  {timeAgo(article.publishedAt)}
                </span>

                <span className="text-slate-300 hidden sm:inline">•</span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-3xs font-bold uppercase tracking-wider rounded ${
                  isIndia
                    ? 'bg-amber-50 text-[#C2410C] border border-amber-200'
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}>
                  {isIndia ? <MapPin className="w-2.5 h-2.5" /> : <Globe className="w-2.5 h-2.5" />}
                  {isIndia ? 'India Wire' : 'Global Wire'}
                </span>

                <span className="text-3xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:inline px-2 py-0.5 rounded bg-slate-50 border border-slate-100">
                  {article.category}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <TrustBadge score={article.trustScore} verdict={article.verdict} size="sm" />
                {onToggleBookmark && (
                  <button
                    type="button"
                    title={isBookmarked ? 'Remove bookmark' : 'Bookmark story'}
                    onClick={(e) => onToggleBookmark(article, e)}
                    className="p-1.5 rounded text-slate-400 hover:text-[#C2410C] transition-colors cursor-pointer"
                  >
                    {isBookmarked ? (
                      <BookmarkCheck className="w-4 h-4 text-[#C2410C] fill-[#C2410C]" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            </div>

            <h2 className="article-font text-2xl sm:text-3xl lg:text-[32px] font-bold text-slate-900 leading-snug group-hover:text-[#C2410C] transition-colors mb-4">
              {article.title}
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed line-clamp-3 mb-6">
              {article.summary}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between pt-5 border-t border-[#EFECE6] text-xs text-slate-500">
              <div className="flex items-center gap-3">
                <span className="text-emerald-800 font-semibold flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" /> {verifiedClaimsCount} verified claims
                </span>
                <span className="hidden sm:inline text-slate-400 font-mono text-3xs">
                  Read time: {article.readTime}
                </span>
              </div>

              <span className="font-semibold text-slate-900 group-hover:text-[#C2410C] flex items-center gap-1 group-hover:translate-x-1 transition-all">
                Read Full Story <ArrowUpRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 relative min-h-[240px] lg:min-h-full bg-[#F7F4EE] overflow-hidden border-t lg:border-t-0 lg:border-l border-[#E8E3D9]">
          {article.imageUrl ? (
            <img
              src={article.imageUrl}
              alt={article.title}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 p-8">
              <span className="font-serif text-3xl tracking-widest text-slate-300">VERITAS</span>
            </div>
          )}
        </div>
      </article>
    );
  }

  // Refined Spacious Grid Card
  return (
    <article
      id={`article-card-${article.id}`}
      onClick={() => onSelect(article)}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className="group bg-white border border-[#E8E3D9] rounded-2xl p-6 sm:p-6.5 flex flex-col justify-between shadow-2xs hover:shadow-md hover:border-slate-800 transition-all duration-150 cursor-pointer relative h-full space-y-4"
    >
      <div className="space-y-3.5">
        {/* Minimal Clean Header: Publisher & Confidence */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 truncate">
            <span className="font-bold text-xs uppercase tracking-wider text-slate-900 truncate">
              {article.primaryPublisher.name}
            </span>
            <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 text-3xs font-mono font-medium rounded ${
              isIndia
                ? 'bg-amber-50 text-[#C2410C] border border-amber-200/80'
                : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}>
              {isIndia ? 'India' : 'Intl'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <TrustBadge score={article.trustScore} verdict={article.verdict} size="sm" />
            {onToggleBookmark && (
              <button
                type="button"
                title={isBookmarked ? 'Remove bookmark' : 'Bookmark story'}
                onClick={(e) => onToggleBookmark(article, e)}
                className="p-1 rounded text-slate-300 hover:text-[#C2410C] transition-colors cursor-pointer"
              >
                {isBookmarked ? (
                  <BookmarkCheck className="w-4 h-4 text-[#C2410C] fill-[#C2410C]" />
                ) : (
                  <Bookmark className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="article-font text-lg sm:text-[19px] font-bold text-slate-900 leading-snug group-hover:text-[#C2410C] transition-colors line-clamp-3">
          {article.title}
        </h3>

        {/* Minimal Summary with comfortable line-height */}
        <p className="text-slate-600 text-xs sm:text-[13.5px] leading-relaxed line-clamp-3">
          {article.summary}
        </p>

        {/* Secondary Metadata: Revealed smoothly on hover/focus */}
        <div className={`flex flex-wrap items-center gap-1.5 transition-all duration-150 overflow-hidden ${
          isExpanded ? 'opacity-100 max-h-8 pt-1' : 'opacity-0 max-h-0'
        }`}>
          <span className="text-3xs text-slate-500 uppercase font-semibold px-2 py-0.5 rounded bg-slate-50 border border-slate-100">
            {article.category}
          </span>

          <span className="text-3xs text-emerald-800 font-medium px-2 py-0.5 rounded bg-emerald-50 border border-emerald-100 flex items-center gap-1">
            <ShieldCheck className="w-2.5 h-2.5 text-emerald-700" /> {verifiedClaimsCount} verified claims
          </span>
        </div>
      </div>

      {/* Footer Strip */}
      <div className="pt-4 border-t border-[#EFECE6] flex items-center justify-between text-xs text-slate-500">
        <span className="text-2xs text-slate-400 flex items-center gap-1.5 font-mono">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          {timeAgo(article.publishedAt)}
        </span>

        <span className="text-xs font-semibold text-slate-900 group-hover:text-[#C2410C] flex items-center gap-1 shrink-0 transition-colors">
          Read Story <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#C2410C] group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </article>
  );
});

