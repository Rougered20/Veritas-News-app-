import React from 'react';
import { Sparkles, Activity, FlaskConical, LayoutGrid, List, ShieldAlert, ShieldCheck, Globe } from 'lucide-react';
import { CircuitHealthStatus, NewsArticle } from '../types.js';
import { WireTicker } from './WireTicker.js';

interface NavbarProps {
  articles: NewsArticle[];
  onSelectArticle: (article: NewsArticle) => void;
  onOpenIngestLab: () => void;
  onOpenSourceHub: () => void;
  onOpenCircuitHealth: () => void;
  onOpenModeration: () => void;
  pendingModerationCount?: number;
  isAdmin: boolean;
  onToggleAdminRole: () => void;
  onToggleQuickAuditor: () => void;
  isQuickAuditorOpen: boolean;
  circuitStatus: CircuitHealthStatus | null;
  isStreaming: boolean;
  totalArticles: number;
  savedCount: number;
  onSelectSavedView: () => void;
  layoutMode: 'grid' | 'compact';
  onToggleLayoutMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  articles,
  onSelectArticle,
  onOpenIngestLab,
  onOpenSourceHub,
  onOpenCircuitHealth,
  onOpenModeration,
  pendingModerationCount = 0,
  isAdmin,
  onToggleAdminRole,
  onToggleQuickAuditor,
  isQuickAuditorOpen,
  circuitStatus,
  isStreaming,
  totalArticles,
  savedCount,
  onSelectSavedView,
  layoutMode,
  onToggleLayoutMode,
}) => {
  const isHealthy = circuitStatus?.state === 'CLOSED';


  return (
    <header className="sticky top-0 z-30 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#E8E3D9]">
      {/* Thin Minimalist Wire Flash Ticker */}
      <WireTicker articles={articles} onSelectArticle={onSelectArticle} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Masthead Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-2xs font-serif font-bold text-sm tracking-widest shrink-0">
              V
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="article-font font-bold text-lg sm:text-xl text-slate-900 tracking-tight">
                  VERITAS
                </span>
                <span className="text-3xs font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#F2EFE9] text-slate-600 border border-[#E8E3D9]">
                  WIRE
                </span>
              </div>
              <p className="text-3xs text-slate-500 font-medium whitespace-nowrap mt-0.5 hidden sm:block">
                Corroborated Editorial Intelligence
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Live Indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FAF8F5] border border-[#E8E3D9] text-2xs text-slate-600 shrink-0">
              <span className={`w-1.5 h-1.5 rounded-full ${isStreaming ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="font-medium hidden md:inline">{isStreaming ? 'Live Stream' : 'Connecting'}</span>
              <span className="text-slate-300 hidden md:inline">•</span>
              <span className="font-mono text-slate-700 font-semibold">{totalArticles}</span>
            </div>

            {/* Instant Claim Auditor */}
            <button
              id="navbar-quick-auditor-btn"
              onClick={onToggleQuickAuditor}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer shrink-0 ${
                isQuickAuditorOpen
                  ? 'bg-[#C2410C] text-white border-[#C2410C]'
                  : 'bg-white hover:bg-[#FAF8F5] text-slate-700 border-[#E8E3D9]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden xs:inline sm:inline">Audit Claim</span>
            </button>

            {/* Moderation Command Center Button */}
            <button
              id="navbar-open-moderation-btn"
              onClick={onOpenModeration}
              title="Open Editorial Moderation Console"
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                pendingModerationCount > 0
                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-200'
                  : 'bg-white hover:bg-[#FAF8F5] text-slate-700 border-[#E8E3D9]'
              }`}
            >
              <ShieldAlert className={`w-3.5 h-3.5 ${pendingModerationCount > 0 ? 'text-rose-600 animate-pulse' : 'text-purple-600'}`} />
              <span className="hidden sm:inline">Moderation</span>
              {pendingModerationCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-3xs font-mono font-bold bg-rose-600 text-white">
                  {pendingModerationCount}
                </span>
              )}
            </button>

            {/* Sources & Reliability Hub */}
            <button
              id="navbar-open-source-hub-btn"
              onClick={onOpenSourceHub}
              title="Open Source Reliability Registry & Spellcheck Deck"
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-[#FAF8F5] text-slate-700 border border-[#E8E3D9] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Sources</span>
            </button>

            {/* Ingestion Lab */}
            <button
              id="navbar-open-ingest-lab-btn"
              onClick={onOpenIngestLab}
              title="Open News Ingestion Lab"
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-[#FAF8F5] text-slate-700 border border-[#E8E3D9] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <FlaskConical className="w-3.5 h-3.5 text-[#C2410C]" />
              <span className="hidden sm:inline">Ingest</span>
            </button>

            {/* System Circuit Health */}
            <button
              id="navbar-open-circuit-health-btn"
              onClick={onOpenCircuitHealth}
              title={`Circuit status: ${isHealthy ? 'Healthy' : 'Fallback Active'}`}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                isHealthy
                  ? 'bg-white hover:bg-emerald-50/50 text-slate-700 border-[#E8E3D9]'
                  : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
              }`}
            >
              <Activity className={`w-3.5 h-3.5 ${isHealthy ? 'text-emerald-600' : 'text-rose-600'}`} />
              <span className="hidden sm:inline">Circuit</span>
            </button>

            {/* Role Switcher (Admin / Reader Mode) */}
            <button
              id="navbar-toggle-role-btn"
              onClick={onToggleAdminRole}
              title={`Current View: ${isAdmin ? 'Admin / Staff Moderator' : 'Standard Reader'}. Click to toggle.`}
              className={`px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-2xs font-bold uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                isAdmin
                  ? 'bg-purple-100 text-purple-900 border-purple-300'
                  : 'bg-white hover:bg-[#FAF8F5] text-slate-600 border-[#E8E3D9]'
              }`}
            >
              <ShieldCheck className={`w-3 h-3 ${isAdmin ? 'text-purple-700' : 'text-slate-400'}`} />
              <span className="hidden md:inline">{isAdmin ? 'Admin Mode' : 'Reader Mode'}</span>
            </button>

            {/* Density Layout Mode */}
            <button
              id="navbar-layout-mode-btn"
              onClick={onToggleLayoutMode}
              title={`Switch to ${layoutMode === 'grid' ? 'Compact' : 'Grid'} view`}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 bg-white hover:bg-[#FAF8F5] border border-[#E8E3D9] transition-all cursor-pointer"
            >
              {layoutMode === 'grid' ? <List className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};
