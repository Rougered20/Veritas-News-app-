import React from 'react';
import { motion, type Variants } from 'motion/react';
import { ShieldCheck, Radio, Newspaper, Sparkles } from 'lucide-react';

interface ArticleSkeletonProps {
  layoutMode?: 'grid' | 'compact';
  featured?: boolean;
}

export const SingleArticleCardSkeleton: React.FC<{ featured?: boolean; layoutMode?: 'grid' | 'compact' }> = ({
  featured = false,
  layoutMode = 'grid',
}) => {
  if (layoutMode === 'compact' && !featured) {
    return (
      <div className="bg-white border border-[#E8E3D9] rounded-xl px-5 py-4 flex items-center justify-between gap-5 shadow-2xs">
        <div className="flex-1 min-w-0 space-y-2.5">
          {/* Header Row */}
          <div className="flex items-center gap-2.5">
            <div className="h-4 w-28 bg-[#EAE5DC] rounded animate-pulse" />
            <div className="h-3.5 w-16 bg-[#F2EFE9] rounded animate-pulse" />
            <div className="h-3.5 w-20 bg-[#F2EFE9] rounded animate-pulse" />
          </div>
          {/* Headline */}
          <div className="h-4.5 w-4/5 bg-[#DFD8CC] rounded animate-pulse" />
        </div>
        {/* Right side badge */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="h-7 w-20 bg-[#F5F2EA] rounded-lg border border-[#E8E3D9] animate-pulse" />
          <div className="w-5 h-5 bg-[#EAE5DC] rounded-md animate-pulse" />
        </div>
      </div>
    );
  }

  if (featured) {
    return (
      <div className="bg-white border border-[#E8E3D9] rounded-2xl p-7 sm:p-9 lg:p-10 shadow-2xs space-y-6 relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Column */}
          <div className="lg:col-span-8 space-y-5">
            {/* Top Meta Bar */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="h-5 w-32 bg-[#DFD8CC] rounded-md animate-pulse" />
              <div className="h-5 w-16 bg-[#EAE5DC] rounded-md animate-pulse" />
              <div className="h-5 w-24 bg-[#EAE5DC] rounded-md animate-pulse" />
              <div className="h-5 w-20 bg-[#F2EFE9] rounded ml-auto animate-pulse" />
            </div>

            {/* Headline */}
            <div className="space-y-2.5 pt-1">
              <div className="h-8 sm:h-9 w-11/12 bg-[#D5CDC0] rounded-lg animate-pulse" />
              <div className="h-8 sm:h-9 w-3/4 bg-[#D5CDC0] rounded-lg animate-pulse" />
            </div>

            {/* Summary Lines */}
            <div className="space-y-2 pt-2">
              <div className="h-4 w-full bg-[#EAE5DC] rounded animate-pulse" />
              <div className="h-4 w-11/12 bg-[#EAE5DC] rounded animate-pulse" />
              <div className="h-4 w-4/5 bg-[#EAE5DC] rounded animate-pulse" />
            </div>

            {/* Corroboration Block */}
            <div className="p-4 bg-[#FAF8F5] border border-[#E8E3D9] rounded-xl flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#DFD8CC] animate-pulse" />
                <div className="h-4 w-40 bg-[#DFD8CC] rounded animate-pulse" />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#DFD8CC] animate-pulse" />
                <div className="w-5 h-5 rounded-full bg-[#DFD8CC] animate-pulse" />
                <div className="h-4 w-28 bg-[#DFD8CC] rounded ml-1 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Right Trust Assessment Column */}
          <div className="lg:col-span-4 p-6 bg-[#FAF8F5] border border-[#E8E3D9] rounded-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E3D9]">
              <div className="h-4 w-32 bg-[#DFD8CC] rounded animate-pulse" />
              <div className="h-6 w-16 bg-[#D5CDC0] rounded-lg animate-pulse" />
            </div>
            <div className="space-y-2.5">
              <div className="h-3.5 w-full bg-[#EAE5DC] rounded animate-pulse" />
              <div className="h-3.5 w-4/5 bg-[#EAE5DC] rounded animate-pulse" />
            </div>
            <div className="pt-2">
              <div className="h-9 w-full bg-[#DFD8CC] rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Standard Grid Card Skeleton
  return (
    <div className="bg-white border border-[#E8E3D9] rounded-2xl p-6 shadow-2xs flex flex-col justify-between h-full space-y-4">
      <div className="space-y-4">
        {/* Card Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="h-4 w-28 bg-[#DFD8CC] rounded-md animate-pulse" />
            <div className="h-3.5 w-14 bg-[#EAE5DC] rounded animate-pulse" />
          </div>
          <div className="h-6 w-16 bg-[#E5DFD4] rounded-lg animate-pulse" />
        </div>

        {/* Headline */}
        <div className="space-y-2 pt-1">
          <div className="h-5.5 w-full bg-[#D5CDC0] rounded-md animate-pulse" />
          <div className="h-5.5 w-4/5 bg-[#D5CDC0] rounded-md animate-pulse" />
        </div>

        {/* Excerpt */}
        <div className="space-y-2 pt-1">
          <div className="h-3.5 w-full bg-[#EAE5DC] rounded animate-pulse" />
          <div className="h-3.5 w-11/12 bg-[#EAE5DC] rounded animate-pulse" />
          <div className="h-3.5 w-3/5 bg-[#EAE5DC] rounded animate-pulse" />
        </div>
      </div>

      {/* Card Footer */}
      <div className="pt-4 border-t border-[#F2EFE9] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-[#DFD8CC] animate-pulse" />
            <div className="h-3.5 w-24 bg-[#EAE5DC] rounded animate-pulse" />
          </div>
          <div className="h-3.5 w-16 bg-[#F2EFE9] rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export const ArticleGridSkeleton: React.FC<ArticleSkeletonProps> = ({
  layoutMode = 'grid',
}) => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.02,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 8 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Editorial News Wire Dispatch Banner */}
      <div className="p-4 sm:p-5 bg-white border border-[#E8E3D9] rounded-2xl shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shrink-0 shadow-xs">
            <Newspaper className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs sm:text-sm text-slate-900">
                Synchronizing Verified News Wire
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-3xs font-mono font-bold">
                <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-600" />
                LIVE INGESTION
              </span>
            </div>
            <p className="text-2xs text-slate-500 mt-0.5">
              Auditing PTI, Reuters, The Hindu, AP, ISRO, and scientific databases with factual consistency engines.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center font-mono text-3xs text-slate-500 bg-[#FAF8F5] px-3 py-1.5 rounded-lg border border-[#E8E3D9]">
          <span className="w-2 h-2 rounded-full bg-[#C2410C] animate-ping" />
          <span>Cross-Auditing Nodes...</span>
        </div>
      </div>

      {/* Featured Story Skeleton (only in grid mode) */}
      {layoutMode === 'grid' && (
        <motion.div variants={itemVariants} className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="h-4 w-36 bg-[#DFD8CC] rounded animate-pulse" />
            <div className="h-3.5 w-32 bg-[#F2EFE9] rounded animate-pulse" />
          </div>
          <SingleArticleCardSkeleton featured={true} layoutMode="grid" />
        </motion.div>
      )}

      {/* Secondary Header */}
      {layoutMode === 'grid' && (
        <div className="flex items-center justify-between pt-2 border-t border-[#E8E3D9]">
          <div className="h-4 w-40 bg-[#DFD8CC] rounded animate-pulse" />
          <div className="h-3.5 w-24 bg-[#F2EFE9] rounded animate-pulse" />
        </div>
      )}

      {/* Grid or List of Skeletons */}
      <div
        className={
          layoutMode === 'compact'
            ? 'space-y-3'
            : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
        }
      >
        {Array.from({ length: layoutMode === 'compact' ? 8 : 6 }).map((_, index) => (
          <motion.div key={`skeleton-${index}`} variants={itemVariants}>
            <SingleArticleCardSkeleton layoutMode={layoutMode} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

