import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, ChevronLeft, ChevronRight, Pause, Play, MapPin, Globe, Zap, Gauge } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NewsArticle } from '../types.js';

interface WireTickerProps {
  articles: NewsArticle[];
  onSelectArticle: (article: NewsArticle) => void;
}

export const WireTicker: React.FC<WireTickerProps> = ({
  articles,
  onSelectArticle,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [tickerMode, setTickerMode] = useState<'cycle' | 'marquee'>('marquee');
  const [speed, setSpeed] = useState<'slow' | 'ultraslow' | 'standard'>('slow');
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const CYCLE_DURATION = 9000; // 9 seconds per headline in cycle mode for comfortable reading

  // Filter high-confidence flash articles from India and Global wires
  const flashArticles = React.useMemo(() => {
    const highConfidence = articles.filter(a => a.trustScore >= 88);
    const india = highConfidence.filter(a => a.region === 'india');
    const intl = highConfidence.filter(a => a.region !== 'india');
    
    const combined: NewsArticle[] = [];
    const maxLen = Math.max(india.length, intl.length);
    for (let i = 0; i < maxLen; i++) {
      if (india[i]) combined.push(india[i]);
      if (intl[i]) combined.push(intl[i]);
    }
    return combined.length > 0 ? combined : articles.slice(0, 8);
  }, [articles]);

  // Automatic interval & progress for cycle mode
  useEffect(() => {
    if (flashArticles.length === 0 || tickerMode !== 'cycle' || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    setProgress(0);
    const startTime = Date.now();

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / CYCLE_DURATION) * 100);
      setProgress(pct);
    }, 100);

    timerRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % flashArticles.length);
      setProgress(0);
    }, CYCLE_DURATION);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [flashArticles.length, tickerMode, isPaused, currentIndex]);

  if (flashArticles.length === 0) return null;

  const currentItem = flashArticles[currentIndex] || flashArticles[0];
  const isIndia = currentItem.region === 'india';

  const marqueeSpeedClass =
    speed === 'ultraslow'
      ? 'animate-marquee-slow'
      : speed === 'slow'
      ? 'animate-marquee'
      : 'animate-marquee-standard';

  return (
    <aside
      aria-label="High-Confidence Wire Flash Ticker"
      className="bg-slate-950 text-slate-100 border-b border-slate-800 text-xs h-9 sm:h-10 flex items-center justify-between px-3 sm:px-6 select-none overflow-hidden relative z-40 shadow-xs"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Paged Progress Bar */}
      {tickerMode === 'cycle' && !isPaused && (
        <div
          className="absolute bottom-0 left-0 h-[2px] bg-[#C2410C] transition-all duration-100 ease-linear z-50 opacity-80"
          style={{ width: `${progress}%` }}
        />
      )}

      {/* Left Label: Flash Indicator */}
      <div className="flex items-center gap-2.5 shrink-0 pr-3 border-r border-slate-800 mr-3">
        <span className="flex items-center gap-1.5 bg-[#C2410C] text-white px-2 py-0.5 rounded font-mono font-bold tracking-wider uppercase text-3xs shadow-2xs">
          <Zap className="w-3 h-3 fill-current animate-pulse" />
          <span>WIRE FLASH</span>
        </span>
        <span className="hidden lg:flex items-center gap-1 text-slate-400 font-mono text-3xs">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>VERIFIED &gt;88%</span>
        </span>
      </div>

      {/* Marquee / Cycling Headline View */}
      <div className="flex-1 overflow-hidden relative flex items-center h-full">
        {tickerMode === 'marquee' ? (
          <div className={`flex items-center gap-10 ${marqueeSpeedClass} whitespace-nowrap hover:[animation-play-state:paused] py-1`}>
            {/* Repeat list twice for seamless continuous scroll */}
            {[...flashArticles, ...flashArticles].map((art, idx) => {
              const isArtIndia = art.region === 'india';
              return (
                <button
                  key={`${art.id}-${idx}`}
                  type="button"
                  onClick={() => onSelectArticle(art)}
                  className="inline-flex items-center gap-2.5 text-slate-200 hover:text-white transition-colors cursor-pointer group shrink-0 px-2 py-1 rounded hover:bg-slate-900/80"
                >
                  <span
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-mono font-bold text-3xs uppercase tracking-wide shrink-0 ${
                      isArtIndia
                        ? 'bg-amber-950 text-amber-300 border border-amber-800/80'
                        : 'bg-sky-950 text-sky-300 border border-sky-800/80'
                    }`}
                  >
                    {isArtIndia ? (
                      <MapPin className="w-2.5 h-2.5" />
                    ) : (
                      <Globe className="w-2.5 h-2.5" />
                    )}
                    {isArtIndia ? 'INDIA' : 'GLOBAL'}
                  </span>

                  <span className="font-semibold text-slate-100 text-xs sm:text-[13px] group-hover:text-amber-300 transition-colors">
                    {art.title}
                  </span>

                  <span className="text-slate-400 font-mono text-3xs hidden sm:inline">
                    [{art.primaryPublisher.name} • {art.trustScore}% trust]
                  </span>

                  <span className="text-slate-700 mx-1">•</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentItem.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="flex items-center w-full"
              >
                <button
                  type="button"
                  onClick={() => onSelectArticle(currentItem)}
                  className="flex items-center gap-2.5 text-left truncate group cursor-pointer hover:text-white transition-colors py-0.5"
                >
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono font-bold text-3xs uppercase shrink-0 ${
                      isIndia
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-sky-950 text-sky-300 border border-sky-800'
                    }`}
                  >
                    {isIndia ? (
                      <MapPin className="w-2.5 h-2.5" />
                    ) : (
                      <Globe className="w-2.5 h-2.5" />
                    )}
                    {isIndia ? 'INDIA WIRE' : 'GLOBAL WIRE'}
                  </span>

                  <span className="font-bold text-slate-100 text-xs sm:text-[13px] truncate group-hover:text-amber-300">
                    {currentItem.title}
                  </span>

                  <span className="hidden md:inline text-slate-400 font-mono text-3xs shrink-0 pl-1">
                    — {currentItem.primaryPublisher.name} ({currentItem.trustScore}% trust)
                  </span>
                </button>
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Right Controls: Speed Selector, Mode Switcher, Pause */}
      <div className="flex items-center gap-1.5 shrink-0 pl-3 border-l border-slate-800 ml-2">
        {/* Speed button in marquee mode */}
        {tickerMode === 'marquee' && (
          <button
            type="button"
            onClick={() => {
              setSpeed(s => (s === 'slow' ? 'ultraslow' : s === 'ultraslow' ? 'standard' : 'slow'));
            }}
            title={`Current speed: ${speed}. Click to adjust headline scroll speed.`}
            className="flex items-center gap-1 text-3xs px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 cursor-pointer font-mono"
          >
            <Gauge className="w-3 h-3 text-amber-400" />
            <span className="hidden md:inline">Speed:</span>
            <span className="font-bold text-amber-300 uppercase">
              {speed === 'ultraslow' ? '0.5x Slow' : speed === 'slow' ? '1x Calm' : '1.5x'}
            </span>
          </button>
        )}

        {/* Toggle Mode: Scroll vs Paged */}
        <button
          type="button"
          onClick={() => {
            setTickerMode(m => (m === 'marquee' ? 'cycle' : 'marquee'));
            setProgress(0);
          }}
          title={tickerMode === 'marquee' ? 'Switch to Paged View (displays one headline at a time)' : 'Switch to Continuous Scroll'}
          className="text-3xs px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 cursor-pointer font-mono"
        >
          {tickerMode === 'marquee' ? 'PAGED VIEW' : 'SCROLL VIEW'}
        </button>

        {/* Step controls if in cycle mode */}
        {tickerMode === 'cycle' && (
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => {
                setCurrentIndex(
                  prev => (prev - 1 + flashArticles.length) % flashArticles.length
                );
                setProgress(0);
              }}
              className="p-1 text-slate-400 hover:text-white cursor-pointer"
              title="Previous Flash"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-3xs font-mono text-slate-400 min-w-[32px] text-center">
              {currentIndex + 1}/{flashArticles.length}
            </span>
            <button
              type="button"
              onClick={() => {
                setCurrentIndex(prev => (prev + 1) % flashArticles.length);
                setProgress(0);
              }}
              className="p-1 text-slate-400 hover:text-white cursor-pointer"
              title="Next Flash"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Pause/Play toggle */}
        <button
          type="button"
          onClick={() => setIsPaused(p => !p)}
          className={`p-1.5 rounded transition-colors cursor-pointer ${
            isPaused
              ? 'bg-amber-950 text-amber-300 border border-amber-800/80'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
          title={isPaused ? 'Click to Resume Headlines' : 'Click to Pause Headlines'}
        >
          {isPaused ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3" />}
        </button>
      </div>
    </aside>
  );
};
