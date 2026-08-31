import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Play,
  FlaskConical,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Terminal,
  Layers,
  ArrowRight,
  Sparkles,
  SpellCheck,
  Globe,
  Rss,
  Code2,
  Database
} from 'lucide-react';
import { NewsArticle } from '../types.js';
import { analyzeTextClientSpellcheck } from '../utils/gchecker.js';

interface IngestLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  onArticleIngested?: (article: NewsArticle) => void;
  initialPreset?: {
    name: string;
    domain: string;
    category?: string;
  } | null;
}

const PRESET_TEMPLATES = [
  {
    label: 'BBC News (Open RSS)',
    group: 'open_rss',
    title: 'Global Renewable Capacity Surpasses 4,000 GW in Verified International Energy Agency Audit',
    summary: 'The IEA reports accelerated solar and offshore wind installations across the European Union and Asia-Pacific during Q3, outpacing fossil fuel additions by a 4-to-1 margin.',
    category: 'Climate' as const,
    publisherName: 'BBC News',
    publisherDomain: 'bbc.co.uk',
    isBreaking: true,
  },
  {
    label: 'Reuters (Open RSS / Wire)',
    group: 'open_rss',
    title: 'Semiconductor Manufacturing Consortium Unveils 1.4nm Photolithography Blueprint',
    summary: 'Leading fabrication foundries including TSMC and ASML agree on high-numerical-aperture EUV standards to commence test production by late 2027.',
    category: 'Technology' as const,
    publisherName: 'Reuters',
    publisherDomain: 'reuters.com',
    isBreaking: false,
  },
  {
    label: 'PBS NewsHour (Open RSS)',
    group: 'open_rss',
    title: 'Public Health Taskforce Details Global Malaria Vaccine Rollout Across 12 Nations',
    summary: 'The World Health Organization and Gavi deliver over 30 million R21 doses, achieving a documented 75% reduction in symptomatic pediatric cases.',
    category: 'Science' as const,
    publisherName: 'PBS NewsHour',
    publisherDomain: 'pbs.org',
    isBreaking: false,
  },
  {
    label: 'The Guardian (Developer API)',
    group: 'developer_api',
    title: 'Marine Conservation Treaty Enters Full Legal Force Following 60th National Ratification',
    summary: 'High Seas biodiversity protections now enforce binding ecological impact assessments on deep-sea mining and commercial trawling in international waters.',
    category: 'World' as const,
    publisherName: 'The Guardian',
    publisherDomain: 'theguardian.com',
    isBreaking: true,
  },
  {
    label: 'GDELT Project (Bulk Dataset)',
    group: 'bulk_dataset',
    title: 'Cross-Border Supply Chain Resilience Index Shows Record Stability in ASEAN Corridor',
    summary: 'Automated global event indexing reveals reduced port container dwell times and synchronized bilateral customs harmonization between Singapore and India.',
    category: 'Economy' as const,
    publisherName: 'GDELT Project',
    publisherDomain: 'gdeltproject.org',
    isBreaking: false,
  },
  {
    label: 'Common Crawl News (Bulk Archive)',
    group: 'bulk_dataset',
    title: 'Open Web Indexing Ingests 2.8 Billion Verified Multilingual News Artifacts',
    summary: 'Public digital preservation repository snapshots 450,000 international journalism portals with cryptographic tamper-evident checksums.',
    category: 'Technology' as const,
    publisherName: 'Common Crawl',
    publisherDomain: 'commoncrawl.org',
    isBreaking: false,
  },
  {
    label: 'Wikinews (Open Archive)',
    group: 'bulk_dataset',
    title: 'International Astronomical Union Confirms Discovery of Water Vapor on Exoplanet K2-18b',
    summary: 'James Webb Space Telescope spectroscopy data undergoes secondary peer review confirming atmospheric carbon-bearing molecules.',
    category: 'Science' as const,
    publisherName: 'Wikinews',
    publisherDomain: 'en.wikinews.org',
    isBreaking: false,
  },
  {
    label: 'Sensational Clickbait (Negative Test)',
    group: 'test',
    title: 'Shocking Secret Energy Discovery Will Instantly Destroy All Power Grids Tomorrow!',
    summary: 'An anonymous blog post claims a hidden free-energy magnetic device has been suppressed by global authorities and will be unleashed overnight.',
    category: 'World' as const,
    publisherName: 'Viral Truth Buzz',
    publisherDomain: 'viraltruthbuzz.net',
    isBreaking: true,
  }
];

export const IngestLabModal: React.FC<IngestLabModalProps> = ({
  isOpen,
  onClose,
  onArticleIngested,
  initialPreset,
}) => {
  const [title, setTitle] = useState(PRESET_TEMPLATES[0].title);
  const [summary, setSummary] = useState(PRESET_TEMPLATES[0].summary);
  const [category, setCategory] = useState<'World' | 'Technology' | 'Economy' | 'Science' | 'Climate' | 'Geopolitics'>('Climate');
  const [publisherName, setPublisherName] = useState(PRESET_TEMPLATES[0].publisherName);
  const [publisherDomain, setPublisherDomain] = useState(PRESET_TEMPLATES[0].publisherDomain);
  const [isBreaking, setIsBreaking] = useState(true);

  const [isRunning, setIsRunning] = useState(false);
  const [stageProgress, setStageProgress] = useState<number>(0);
  const [runLogs, setRunLogs] = useState<string[]>([]);
  const [ingestedResult, setIngestedResult] = useState<NewsArticle | null>(null);

  // Live spellcheck diagnostic
  const titleSpellcheck = analyzeTextClientSpellcheck(title);
  const summarySpellcheck = analyzeTextClientSpellcheck(summary);
  const totalSpellcheckFixes = titleSpellcheck.fixesCount + summarySpellcheck.fixesCount;

  if (!isOpen) return null;

  const loadPreset = (preset: typeof PRESET_TEMPLATES[0]) => {
    setTitle(preset.title);
    setSummary(preset.summary);
    setCategory(preset.category);
    setPublisherName(preset.publisherName);
    setPublisherDomain(preset.publisherDomain);
    setIsBreaking(preset.isBreaking);
    setIngestedResult(null);
    setRunLogs([]);
    setStageProgress(0);
  };

  const handleApplySpellcheck = () => {
    setTitle(titleSpellcheck.correctedText);
    setSummary(summarySpellcheck.correctedText);
  };

  const handleRunPipeline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim() || isRunning) return;

    setIsRunning(true);
    setIngestedResult(null);
    setStageProgress(1);
    setRunLogs([
      `[STAGE 1] Ingesting payload & executing Zod schema + spellcheck sanitization...`,
    ]);

    try {
      setTimeout(() => {
        setStageProgress(2);
        setRunLogs(prev => [
          ...prev,
          `[STAGE 2] Checking Publisher Whitelist tier and user trust rating for "${publisherDomain}"...`,
        ]);
      }, 500);

      setTimeout(() => {
        setStageProgress(3);
        setRunLogs(prev => [
          ...prev,
          `[STAGE 3] Querying 12-hour sliding window for independent cross-corroboration nodes...`,
        ]);
      }, 1100);

      setTimeout(() => {
        setStageProgress(4);
        setRunLogs(prev => [
          ...prev,
          `[STAGE 4] Executing AI Fact-Checking Pipeline with Gemini claim extraction & search grounding...`,
        ]);
      }, 1800);

      const res = await fetch('/api/news/ingest-custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          summary,
          category,
          publisherName,
          publisherDomain,
          isBreaking,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.article) {
        setStageProgress(5);
        setIngestedResult(data.article);
        setRunLogs(prev => [
          ...prev,
          `[COMPLETE] Verified Article published into live news feed: ID=${data.article.id}`,
          `[STATS] Trust Score: ${data.article.trustScore}/100, Corroborating Nodes: ${data.article.corroboratingSources?.length || 0}`,
        ]);
        if (onArticleIngested) {
          onArticleIngested(data.article);
        }
      } else {
        setStageProgress(0);
        setRunLogs(prev => [
          ...prev,
          `[ERROR] Pipeline rejected: ${data.error || 'Unknown validation failure'}`,
        ]);
      }
    } catch (err: any) {
      setStageProgress(0);
      setRunLogs(prev => [
        ...prev,
        `[ERROR] Pipeline execution network error: ${err.message}`,
      ]);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          transition={{ type: 'spring', duration: 0.35 }}
          className="relative w-full max-w-4xl bg-[#FCFAF6] rounded-2xl border border-[#E8E3D9] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden z-10"
        >
          {/* Header */}
          <div className="px-5 sm:px-8 py-5 bg-white border-b border-[#E8E3D9] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 text-[#C2410C] flex items-center justify-center shadow-2xs">
                <FlaskConical className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-lg sm:text-xl text-slate-900">
                  News Ingestion & Verification Lab
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Test and execute the 4-Stage Ingestion Pipeline across Open RSS, Developer APIs & Datasets
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-[#F2EFE9] rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 sm:p-8 overflow-y-auto space-y-6 flex-1">
            {/* Quick Templates Selector */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                Select Test Source & Feed Template:
              </span>
              <div className="flex flex-wrap gap-2">
                {PRESET_TEMPLATES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => loadPreset(preset)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-orange-50 hover:border-orange-300 text-slate-700 border border-[#E8E3D9] transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
                  >
                    {preset.group === 'open_rss' && <Rss className="w-3 h-3 text-amber-500" />}
                    {preset.group === 'developer_api' && <Code2 className="w-3 h-3 text-blue-500" />}
                    {preset.group === 'bulk_dataset' && <Database className="w-3 h-3 text-purple-500" />}
                    {preset.group === 'test' && <AlertTriangle className="w-3 h-3 text-rose-500" />}
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Spellcheck Notice if Typos detected */}
            {totalSpellcheckFixes > 0 && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3 text-xs text-amber-900">
                <div className="flex items-center gap-2">
                  <SpellCheck className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Detected <strong>{totalSpellcheckFixes}</strong> spelling/casing inconsistencies. The pipeline will automatically normalize them.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleApplySpellcheck}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold text-xs shrink-0 cursor-pointer shadow-2xs"
                >
                  Auto-Correct Now
                </button>
              </div>
            )}

            {/* Ingestion Form */}
            <form onSubmit={handleRunPipeline} className="bg-white p-6 rounded-xl border border-[#E8E3D9] shadow-2xs space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Headline</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E3D9] rounded-lg text-xs font-serif text-slate-900 focus:outline-none focus:border-[#C2410C]"
                    placeholder="Enter news title..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E3D9] rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#C2410C]"
                  >
                    <option value="World">World</option>
                    <option value="Technology">Technology</option>
                    <option value="Economy">Economy</option>
                    <option value="Science">Science</option>
                    <option value="Climate">Climate</option>
                    <option value="Geopolitics">Geopolitics</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Summary / Lead Paragraph</label>
                <textarea
                  rows={3}
                  value={summary}
                  onChange={e => setSummary(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E3D9] rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#C2410C] leading-relaxed"
                  placeholder="Enter full summary..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Publisher Name</label>
                  <input
                    type="text"
                    value={publisherName}
                    onChange={e => setPublisherName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E3D9] rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#C2410C]"
                    placeholder="e.g. Reuters"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Publisher Domain</label>
                  <input
                    type="text"
                    value={publisherDomain}
                    onChange={e => setPublisherDomain(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E3D9] rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#C2410C]"
                    placeholder="e.g. reuters.com"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBreaking}
                    onChange={e => setIsBreaking(e.target.checked)}
                    className="rounded border-[#E8E3D9] text-[#C2410C] focus:ring-[#C2410C]"
                  />
                  <span>Mark as Breaking Wire Bulletin</span>
                </label>

                <button
                  id="run-verification-pipeline-btn"
                  type="submit"
                  disabled={isRunning}
                  className="px-5 py-2.5 bg-[#C2410C] hover:bg-[#9A3412] disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Auditing Pipeline...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      <span>Execute Verification Pipeline</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Pipeline Stage Visualizer */}
            <div className="bg-white p-5 rounded-xl border border-[#E8E3D9] shadow-2xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#C2410C]" /> Pipeline Execution Stages
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { step: 1, name: '1. Ingest & Spellcheck' },
                  { step: 2, name: '2. Whitelist Audit' },
                  { step: 3, name: '3. Cross-Ref Matrix' },
                  { step: 4, name: '4. AI Fact Engine' },
                ].map(stage => {
                  const isDone = stageProgress > stage.step;
                  const isCurrent = stageProgress === stage.step;
                  return (
                    <div
                      key={stage.step}
                      className={`p-2.5 rounded-lg border text-center transition-all ${
                        isDone
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : isCurrent
                          ? 'bg-amber-50 border-amber-300 text-amber-900 animate-pulse'
                          : 'bg-[#FAF8F5] border-[#E8E3D9] text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1 text-xs font-semibold">
                        {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                        {isCurrent && <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />}
                        <span>{stage.name}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Terminal Output */}
            {runLogs.length > 0 && (
              <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs space-y-1.5 overflow-x-auto border border-slate-800 shadow-inner">
                <div className="flex items-center justify-between text-slate-400 pb-1 border-b border-slate-800 text-2xs">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" /> Pipeline Console Stream
                  </span>
                  <span>Real-Time SSE Sync</span>
                </div>
                {runLogs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed">
                    <span className="text-emerald-400 mr-2">›</span>
                    <span className={log.includes('ERROR') ? 'text-rose-400' : log.includes('passed') || log.includes('Verified') ? 'text-emerald-300' : 'text-slate-200'}>
                      {log}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
