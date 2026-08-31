/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import {
  Shield,
  Radio,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  Layers,
  Flame,
  CheckCircle2,
  Bookmark,
  Sparkle
} from 'lucide-react';
import { NewsArticle, NewsRegion, CircuitHealthStatus, IngestionPipelineLog } from './types.js';
import { Navbar } from './components/Navbar.js';
import { FilterBar } from './components/FilterBar.js';
import { ArticleCard } from './components/ArticleCard.js';
import { ArticleInspectorModal } from './components/ArticleInspectorModal.js';
import { IngestLabModal } from './components/IngestLabModal.js';
import { SourceReliabilityHubModal } from './components/SourceReliabilityHubModal.js';
import { ClassicArticleReader } from './components/ClassicArticleReader.js';
import { CircuitHealthDrawer } from './components/CircuitHealthDrawer.js';
import { QuickClaimAuditor } from './components/QuickClaimAuditor.js';
import { BreakingToast } from './components/BreakingToast.js';
import { AdminModerationModal } from './components/AdminModerationModal.js';
import { ArticleGridSkeleton } from './components/ArticleSkeleton.js';
import { ErrorBoundary } from './components/ErrorBoundary.js';
import { cleanTextSilently } from './utils/gchecker.js';

const staggerFeedContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
};

const cardStaggerVariant: Variants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(2px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.42,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function App() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [pendingArticles, setPendingArticles] = useState<NewsArticle[]>([]);
  const [pipelineLogs, setPipelineLogs] = useState<IngestionPipelineLog[]>([]);
  const [circuitStatus, setCircuitStatus] = useState<CircuitHealthStatus | null>(null);
  const [isFaultSimulated, setIsFaultSimulated] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);

  // User Integration States
  const [savedArticleIds, setSavedArticleIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('veritas_saved_articles');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('veritas_is_admin');
      return stored !== null ? stored === 'true' : true; // Default true so features are readily accessible
    } catch {
      return true;
    }
  });

  const [pendingModerationCount, setPendingModerationCount] = useState<number>(0);

  const [layoutMode, setLayoutMode] = useState<'grid' | 'compact'>(() => {
    try {
      return (localStorage.getItem('veritas_layout_mode') as 'grid' | 'compact') || 'grid';
    } catch {
      return 'grid';
    }
  });

  const [isQuickAuditorOpen, setIsQuickAuditorOpen] = useState(false);
  const [isSavedView, setIsSavedView] = useState(false);

  // Filters
  const [selectedRegion, setSelectedRegion] = useState<NewsRegion>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [minTrust, setMinTrust] = useState(0);

  // Modals & Drawers
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [standaloneArticleId, setStandaloneArticleId] = useState<string | null>(null);
  const [isIngestLabOpen, setIsIngestLabOpen] = useState(false);
  const [isSourceHubOpen, setIsSourceHubOpen] = useState(false);
  const [isCircuitDrawerOpen, setIsCircuitDrawerOpen] = useState(false);
  const [isModerationOpen, setIsModerationOpen] = useState(false);

  const eventSourceRef = useRef<EventSource | null>(null);

  // Fetch pending moderation metrics
  const fetchModerationMetrics = async () => {
    try {
      const res = await fetch('/api/admin/metrics');
      if (res.ok) {
        const data = await res.json();
        setPendingModerationCount((data.pendingReview || 0) + (data.activeReports || 0));
      }
    } catch (e) {
      // Non-critical
    }
  };

  const handleToggleAdminRole = () => {
    setIsAdmin(prev => {
      const next = !prev;
      localStorage.setItem('veritas_is_admin', String(next));
      return next;
    });
  };

  // Sync saved articles to local storage
  useEffect(() => {
    try {
      localStorage.setItem('veritas_saved_articles', JSON.stringify(savedArticleIds));
    } catch (e) {
      console.warn('Could not persist bookmarks:', e);
    }
  }, [savedArticleIds]);

  // Sync layout mode to local storage
  useEffect(() => {
    try {
      localStorage.setItem('veritas_layout_mode', layoutMode);
    } catch (e) {
      console.warn('Could not persist layout mode:', e);
    }
  }, [layoutMode]);

  // 1. Initial REST fetch + SSE live stream connection
  useEffect(() => {
    // Check URL for direct article view
    const params = new URLSearchParams(window.location.search);
    const articleParam = params.get('article');
    if (articleParam) {
      setStandaloneArticleId(articleParam);
    }

    const handlePopState = () => {
      const currentParams = new URLSearchParams(window.location.search);
      const curArt = currentParams.get('article');
      setStandaloneArticleId(curArt || null);
    };
    window.addEventListener('popstate', handlePopState);

    fetchNews();
    fetchCircuitStatus();
    fetchModerationMetrics();
    connectSSE();

    const healthInterval = setInterval(() => {
      fetchCircuitStatus();
      fetchModerationMetrics();
    }, 8000);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      eventSourceRef.current?.close();
      clearInterval(healthInterval);
    };
  }, []);

  const fetchNews = async () => {
    try {
      const res = await fetch('/api/news');
      const data = await res.json();
      if (data.articles) {
        setArticles(data.articles);
      }
    } catch (err) {
      console.warn('Initial fetch fallback:', err);
    } finally {
      setIsLoadingInitial(false);
    }
  };

  const fetchCircuitStatus = async () => {
    try {
      const res = await fetch('/api/circuit/status');
      const data = await res.json();
      setCircuitStatus(data);
      if (data.state === 'OPEN') {
        setIsFaultSimulated(true);
      }
    } catch (err) {
      console.warn('Circuit telemetry error:', err);
    }
  };

  const connectSSE = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const es = new EventSource('/api/news/stream');
    eventSourceRef.current = es;

    es.onopen = () => {
      setIsStreaming(true);
    };

    es.addEventListener('init', (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload.articles && payload.articles.length > 0) {
          setArticles(payload.articles);
        }
        if (payload.logs) {
          setPipelineLogs(payload.logs);
        }
      } catch (err) {
        console.error('SSE init parse error:', err);
      }
    });

    es.addEventListener('new_article', (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload.article) {
          // Add to pending non-disruptive queue
          setPendingArticles(prev => {
            if (prev.some(a => a.id === payload.article.id) || articles.some(a => a.id === payload.article.id)) {
              return prev;
            }
            return [payload.article, ...prev];
          });
        }
      } catch (err) {
        console.error('SSE new_article parse error:', err);
      }
    });

    es.addEventListener('pipeline_log', (e: MessageEvent) => {
      try {
        const log = JSON.parse(e.data);
        setPipelineLogs(prev => [...prev.slice(-49), log]);
      } catch (err) {
        console.error('SSE pipeline_log error:', err);
      }
    });

    es.onerror = () => {
      setIsStreaming(false);
    };
  };

  // Toggle article bookmark with memoized stability
  const handleToggleBookmark = useCallback((article: NewsArticle, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSavedArticleIds(prev => {
      if (prev.includes(article.id)) {
        return prev.filter(id => id !== article.id);
      } else {
        return [...prev, article.id];
      }
    });
  }, []);

  // Reveal pending articles into visible feed
  const handleRevealPending = useCallback(() => {
    if (pendingArticles.length === 0) return;
    setArticles(prev => [...pendingArticles, ...prev]);
    setPendingArticles([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pendingArticles]);

  // Toggle simulated fault
  const handleToggleFault = async () => {
    try {
      const res = await fetch('/api/circuit/toggle-fault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forced: !isFaultSimulated }),
      });
      const data = await res.json();
      setIsFaultSimulated(data.simulatedFault);
      setCircuitStatus(data.status);
    } catch (err) {
      console.error('Toggle fault error:', err);
    }
  };

  // Filter articles with silent GChecker cleanup
  const filteredArticles = articles.filter(art => {
    if (isSavedView && !savedArticleIds.includes(art.id)) {
      return false;
    }
    if (!isSavedView && selectedRegion !== 'all' && (art.region || 'international') !== selectedRegion) {
      return false;
    }
    if (selectedCategory !== 'All' && art.category.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }
    if (minTrust > 0 && art.trustScore < minTrust) {
      return false;
    }
    if (searchQuery.trim() !== '') {
      const cleanQ = cleanTextSilently(searchQuery).toLowerCase();
      const rawQ = searchQuery.toLowerCase();
      const match =
        art.title.toLowerCase().includes(cleanQ) ||
        art.summary.toLowerCase().includes(cleanQ) ||
        art.primaryPublisher.name.toLowerCase().includes(cleanQ) ||
        art.claims.some(c => c.claim.toLowerCase().includes(cleanQ)) ||
        art.title.toLowerCase().includes(rawQ) ||
        art.summary.toLowerCase().includes(rawQ);
      if (!match) return false;
    }
    return true;
  });

  const featuredArticle = !isSavedView && layoutMode === 'grid' ? filteredArticles[0] : null;
  const gridArticles = !isSavedView && layoutMode === 'grid' ? filteredArticles.slice(1) : filteredArticles;

  const getHeaderTitle = () => {
    if (isSavedView) return 'Saved Reading Dossiers';
    if (selectedRegion === 'india') return 'India News Wire';
    if (selectedRegion === 'international') return 'International News Wire';
    return 'Real-Time Corroborated Wire';
  };

  const getHeaderDescription = () => {
    if (isSavedView) return `Viewing ${savedArticleIds.length} bookmarked dispatches and verified fact dossiers.`;
    if (selectedRegion === 'india') return 'Curated real-time dispatches from verified Indian news agencies and public bodies: PTI, The Hindu, The Indian Express, Mint, ISRO, and RBI.';
    if (selectedRegion === 'international') return 'Real-time global reporting cross-audited across Reuters, AP, Nature, BBC, and international wire bureaus.';
    return 'Multi-node news stream verified in real-time against domain trust whitelists and factual consistency engines.';
  };

  const handleSelectArticle = (art: NewsArticle) => {
    // Navigate cleanly to full tab/page article view with URL persistence
    const newUrl = `${window.location.pathname}?article=${encodeURIComponent(art.id)}`;
    window.history.pushState({ articleId: art.id }, '', newUrl);
    setStandaloneArticleId(art.id);
  };

  // If viewing a full tab article, render the full classic newspaper reader view
  if (standaloneArticleId) {
    return (
      <ErrorBoundary>
        <ClassicArticleReader
          articleId={standaloneArticleId}
          onBackToFeed={() => {
            setStandaloneArticleId(null);
            setSelectedArticle(null);
            window.history.pushState({}, '', window.location.pathname);
          }}
        />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#FDFBF7] text-[#1E293B] flex flex-col selection:bg-[#FED7AA]">
        {/* Dynamic Non-Disruptive Toast for Live Updates */}
        <BreakingToast
          pendingCount={pendingArticles.length}
          onReveal={handleRevealPending}
        />

        {/* Minimalist, Professional Navigation Bar */}
        <Navbar
          articles={articles}
          onSelectArticle={handleSelectArticle}
          onOpenIngestLab={() => setIsIngestLabOpen(true)}
          onOpenSourceHub={() => setIsSourceHubOpen(true)}
          onOpenCircuitHealth={() => setIsCircuitDrawerOpen(true)}
          onOpenModeration={() => setIsModerationOpen(true)}
          pendingModerationCount={pendingModerationCount}
          isAdmin={isAdmin}
          onToggleAdminRole={handleToggleAdminRole}
          onToggleQuickAuditor={() => setIsQuickAuditorOpen(prev => !prev)}
          isQuickAuditorOpen={isQuickAuditorOpen}
          circuitStatus={circuitStatus}
          isStreaming={isStreaming}
          totalArticles={articles.length}
          savedCount={savedArticleIds.length}
          onSelectSavedView={() => setIsSavedView(true)}
          layoutMode={layoutMode}
          onToggleLayoutMode={() => setLayoutMode(m => m === 'grid' ? 'compact' : 'grid')}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-7">
          {/* Quick Claim / Rumor Auditor (Collapsible) */}
          <QuickClaimAuditor
            isOpen={isQuickAuditorOpen}
            onClose={() => setIsQuickAuditorOpen(false)}
          />

          {/* Clean, Refined Masthead Header */}
          <div className="mb-6">
            <h1 className="article-font text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {getHeaderTitle()}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              {getHeaderDescription()}
            </p>
          </div>

          {/* Fault Simulation Active Alert (if triggered) */}
          {isFaultSimulated && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-4 shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-800 shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-rose-900">
                    Upstream Network Fault Active — Self-Healing Circuit Engaged
                  </h3>
                  <p className="text-2xs text-rose-700">
                    Serving authenticated stories from the Stale-While-Revalidate fallback cache with zero UI degradation.
                  </p>
                </div>
              </div>
              <button
                onClick={handleToggleFault}
                className="px-3 py-1.5 bg-rose-800 hover:bg-rose-900 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors cursor-pointer"
              >
                Restore Stream
              </button>
            </motion.div>
          )}

          {/* Filter Bar with Region Tabs, Search & Categories */}
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedRegion={selectedRegion}
            onRegionChange={setSelectedRegion}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            minTrust={minTrust}
            onMinTrustChange={setMinTrust}
            savedCount={savedArticleIds.length}
            isSavedView={isSavedView}
            onToggleSavedView={setIsSavedView}
          />

          {/* Feed Content */}
          <AnimatePresence mode="wait">
            {isLoadingInitial ? (
              <motion.div
                key="loading-wire-skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ArticleGridSkeleton layoutMode={layoutMode} />
              </motion.div>
            ) : filteredArticles.length === 0 ? (
              <motion.div
                key="empty-wire-state"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="py-16 text-center bg-white border border-[#E8E3D9] rounded-2xl p-8 max-w-lg mx-auto shadow-2xs"
              >
                <Shield className="w-10 h-10 text-slate-300 mx-auto mb-3 stroke-1" />
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  {isSavedView ? 'No saved bookmarks yet' : 'No verified articles match filter criteria'}
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  {isSavedView
                    ? 'Click the bookmark icon on any article card to save it for reading later.'
                    : 'Try adjusting your search query, selecting "All" categories, or lowering the minimum trust score floor.'}
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setMinTrust(0);
                    setIsSavedView(false);
                  }}
                  className="px-4 py-2 bg-[#C2410C] text-white text-xs font-semibold rounded-lg cursor-pointer hover:bg-[#9A3412] transition-colors"
                >
                  Reset All Filters
                </button>
              </motion.div>
            ) : (
              <motion.div
                key={`wire-feed-${selectedRegion}-${selectedCategory}-${searchQuery}-${isSavedView ? 'saved' : 'live'}-${layoutMode}`}
                variants={staggerFeedContainer}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Featured Top Story (Only in Grid mode and when not in Saved view) */}
                {featuredArticle && (
                  <motion.div variants={cardStaggerVariant}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-[#C2410C]" /> Lead Verified Story
                      </span>
                      <span className="text-3xs text-slate-400">Continuous dual-wire cross-audit</span>
                    </div>
                    <ArticleCard
                      article={featuredArticle}
                      onSelect={handleSelectArticle}
                      featured={true}
                      isBookmarked={savedArticleIds.includes(featuredArticle.id)}
                      onToggleBookmark={handleToggleBookmark}
                      layoutMode={layoutMode}
                    />
                  </motion.div>
                )}

                {/* Feed of Verified Articles */}
                {gridArticles.length > 0 && (
                  <div>
                    {featuredArticle && (
                      <div className="flex items-center justify-between mb-4 pt-4 border-t border-[#E8E3D9]">
                        <span className="text-2xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-[#C2410C]" /> Live Wire Stream ({gridArticles.length})
                        </span>
                        <span className="text-3xs text-slate-400">Real-time SSE updates</span>
                      </div>
                    )}

                    <motion.div
                      variants={staggerFeedContainer}
                      className={
                        layoutMode === 'compact'
                          ? 'space-y-2.5'
                          : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'
                      }
                    >
                      {gridArticles.map(article => (
                        <motion.div
                          key={article.id}
                          variants={cardStaggerVariant}
                          className="h-full"
                        >
                          <ArticleCard
                            article={article}
                            onSelect={handleSelectArticle}
                            isBookmarked={savedArticleIds.includes(article.id)}
                            onToggleBookmark={handleToggleBookmark}
                            layoutMode={layoutMode}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Minimalist Editorial Footer */}
        <footer className="bg-[#FAF8F5] border-t border-[#E8E3D9] py-8 mt-16 text-xs text-slate-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#C2410C] flex items-center justify-center text-white text-xs font-bold shadow-2xs">
                  V
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Veritas Intelligence & Wire Engine</p>
                  <p className="text-3xs text-slate-500">Autonomous factual validation, multi-node corroboration, and self-healing stream</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-2xs text-slate-500">
                <span className="flex items-center gap-1 text-emerald-800 font-medium">
                  <CheckCircle2 className="w-3 h-3" /> AP / Reuters Editorial Standards
                </span>
                <span>•</span>
                <span>Zero-Reload SSE Transport</span>
                <span>•</span>
                <span>SWR Fallback</span>
              </div>
            </div>
          </div>
        </footer>

        {/* Modals & Drawers */}
        <AnimatePresence>
          {selectedArticle && (
            <ArticleInspectorModal
              article={selectedArticle}
              onClose={() => {
                setSelectedArticle(null);
                fetchModerationMetrics();
              }}
              isBookmarked={savedArticleIds.includes(selectedArticle.id)}
              onToggleBookmark={handleToggleBookmark}
              isAdmin={isAdmin}
            />
          )}
        </AnimatePresence>

        <AdminModerationModal
          isOpen={isModerationOpen}
          onClose={() => {
            setIsModerationOpen(false);
            fetchModerationMetrics();
          }}
          onSelectArticleById={(articleId) => {
            const match = articles.find(a => a.id === articleId);
            if (match) {
              handleSelectArticle(match);
            }
          }}
        />

        <IngestLabModal
          isOpen={isIngestLabOpen}
          onClose={() => setIsIngestLabOpen(false)}
          onArticleIngested={(art) => {
            setArticles(prev => [art, ...prev]);
            handleSelectArticle(art);
          }}
        />

        <SourceReliabilityHubModal
          isOpen={isSourceHubOpen}
          onClose={() => setIsSourceHubOpen(false)}
          onSelectSourceToIngest={(source) => {
            setIsIngestLabOpen(true);
          }}
        />

        <CircuitHealthDrawer
          isOpen={isCircuitDrawerOpen}
          onClose={() => setIsCircuitDrawerOpen(false)}
          status={circuitStatus}
          logs={pipelineLogs}
          onToggleFault={handleToggleFault}
          isFaultSimulated={isFaultSimulated}
        />
      </div>
    </ErrorBoundary>
  );
}
