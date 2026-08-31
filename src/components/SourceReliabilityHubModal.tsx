import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ShieldCheck,
  Globe,
  Rss,
  Code2,
  Database,
  Star,
  CheckCircle2,
  AlertTriangle,
  Search,
  Sparkles,
  ExternalLink,
  MessageSquare,
  SpellCheck,
  Send,
  Loader2,
  TrendingUp,
  RefreshCw,
  SlidersHorizontal,
  Check,
  ArrowRight
} from 'lucide-react';
import { PublisherProfile, UserSourceAudit, NewsArticle } from '../types.js';
import { analyzeTextClientSpellcheck, ClientSpellcheckReport } from '../utils/gchecker.js';

interface SourceReliabilityHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSourceToIngest?: (source: { name: string; domain: string; category: string; endpointUrl?: string }) => void;
}

type TabType = 'all' | 'open_rss' | 'developer_api' | 'bulk_dataset' | 'spellcheck_lab' | 'user_audits';

export const SourceReliabilityHubModal: React.FC<SourceReliabilityHubModalProps> = ({
  isOpen,
  onClose,
  onSelectSourceToIngest,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sources, setSources] = useState<PublisherProfile[]>([]);
  const [audits, setAudits] = useState<UserSourceAudit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Auditing Form State
  const [selectedSourceForAudit, setSelectedSourceForAudit] = useState<PublisherProfile | null>(null);
  const [auditScore, setAuditScore] = useState<number>(90);
  const [auditFactuality, setAuditFactuality] = useState<'Very High' | 'High' | 'Moderate' | 'Unreliable'>('Very High');
  const [auditFeedback, setAuditFeedback] = useState('');
  const [auditUserName, setAuditUserName] = useState('');
  const [isSubmittingAudit, setIsSubmittingAudit] = useState(false);
  const [auditSuccessMessage, setAuditSuccessMessage] = useState<string | null>(null);

  // Live Spellcheck Workbench State
  const [spellcheckInput, setSpellcheckInput] = useState(
    'The goverment and reuterss recieved reports that artifical inteligence and technolgy breaktrough occured in isro and rbi laboratories with definately high consitant resilence.'
  );
  const [spellcheckReport, setSpellcheckReport] = useState<ClientSpellcheckReport | null>(null);
  const [isAnalyzingSpellcheck, setIsAnalyzingSpellcheck] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      fetchRegistry();
      fetchAudits();
      // Run initial spellcheck on sample text
      handleRunSpellcheck(spellcheckInput);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const fetchRegistry = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/publishers/registry');
      if (res.ok) {
        const data = await res.json();
        setSources(data.allSources || []);
      }
    } catch (err) {
      console.error('Failed to load publisher registry', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAudits = async () => {
    try {
      const res = await fetch('/api/publishers/audits');
      if (res.ok) {
        const data = await res.json();
        setAudits(data.audits || []);
      }
    } catch (err) {
      console.error('Failed to load user audits', err);
    }
  };

  const handleOpenAuditModal = (source: PublisherProfile) => {
    setSelectedSourceForAudit(source);
    setAuditScore(source.userTrustRating || source.reputationScore || 90);
    setAuditFactuality(source.factualityRecord || 'Very High');
    setAuditFeedback('');
    setAuditSuccessMessage(null);
  };

  const handleSubmitAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSourceForAudit) return;

    try {
      setIsSubmittingAudit(true);
      const res = await fetch(`/api/publishers/${encodeURIComponent(selectedSourceForAudit.domain)}/audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userScore: auditScore,
          factualityRating: auditFactuality,
          feedback: auditFeedback,
          userName: auditUserName.trim() || 'Verified Reader',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAuditSuccessMessage(`Audit submitted successfully! New Trust Rating: ${data.profile.userTrustRating}/100 (${data.profile.userVotesCount} community votes).`);
        fetchRegistry();
        fetchAudits();
        setTimeout(() => {
          setSelectedSourceForAudit(null);
          setAuditSuccessMessage(null);
        }, 1800);
      }
    } catch (err) {
      console.error('Failed to submit audit', err);
    } finally {
      setIsSubmittingAudit(false);
    }
  };

  const handleRunSpellcheck = (text: string) => {
    setIsAnalyzingSpellcheck(true);
    const report = analyzeTextClientSpellcheck(text);
    setSpellcheckReport(report);
    setIsAnalyzingSpellcheck(false);
  };

  if (!isOpen) return null;

  // Filter sources by tab & search
  const filteredSources = sources.filter(s => {
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'open_rss' && s.sourceType === 'open_rss') ||
      (activeTab === 'developer_api' && s.sourceType === 'developer_api') ||
      (activeTab === 'bulk_dataset' && s.sourceType === 'bulk_dataset');

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      s.name.toLowerCase().includes(query) ||
      s.domain.toLowerCase().includes(query) ||
      s.description.toLowerCase().includes(query);

    return matchesTab && matchesSearch;
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          transition={{ type: 'spring', duration: 0.35 }}
          className="relative w-full max-w-5xl bg-[#FCFAF6] rounded-2xl border border-[#E8E3D9] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden z-10"
        >
          {/* Header */}
          <div className="px-5 sm:px-8 py-5 bg-white border-b border-[#E8E3D9] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 text-[#C2410C] flex items-center justify-center shadow-2xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif font-bold text-lg sm:text-xl text-slate-900">
                    Source Reliability & Spellcheck Audit Deck
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-3xs font-mono font-bold uppercase tracking-wider bg-orange-100 text-orange-900 border border-orange-200">
                    {sources.length} Certified Feeds
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Public Datasets, Developer APIs, Open RSS Feeds, and User-Audited Integrity Scoring
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

          {/* Navigation Sub-Tabs */}
          <div className="px-5 sm:px-8 py-3 bg-[#FAF8F5] border-b border-[#E8E3D9] flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'all'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-white text-slate-700 hover:bg-[#F2EFE9] border border-[#E8E3D9]'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>All Registry</span>
                <span className="text-3xs font-mono px-1 rounded bg-black/20 text-white/90">
                  {sources.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('open_rss')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'open_rss'
                    ? 'bg-[#C2410C] text-white shadow-2xs'
                    : 'bg-white text-slate-700 hover:bg-[#F2EFE9] border border-[#E8E3D9]'
                }`}
              >
                <Rss className="w-3.5 h-3.5 text-amber-500" />
                <span>Open RSS Feeds</span>
                <span className="text-3xs font-mono px-1 rounded bg-black/20 text-white/90">
                  {sources.filter(s => s.sourceType === 'open_rss').length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('developer_api')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'developer_api'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white text-slate-700 hover:bg-[#F2EFE9] border border-[#E8E3D9]'
                }`}
              >
                <Code2 className="w-3.5 h-3.5 text-blue-500" />
                <span>Developer APIs</span>
                <span className="text-3xs font-mono px-1 rounded bg-black/20 text-white/90">
                  {sources.filter(s => s.sourceType === 'developer_api').length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('bulk_dataset')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'bulk_dataset'
                    ? 'bg-purple-600 text-white shadow-2xs'
                    : 'bg-white text-slate-700 hover:bg-[#F2EFE9] border border-[#E8E3D9]'
                }`}
              >
                <Database className="w-3.5 h-3.5 text-purple-500" />
                <span>Bulk Archives</span>
                <span className="text-3xs font-mono px-1 rounded bg-black/20 text-white/90">
                  {sources.filter(s => s.sourceType === 'bulk_dataset').length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('spellcheck_lab')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'spellcheck_lab'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'bg-white text-slate-700 hover:bg-[#F2EFE9] border border-[#E8E3D9]'
                }`}
              >
                <SpellCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Spellcheck Engine</span>
              </button>

              <button
                onClick={() => setActiveTab('user_audits')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'user_audits'
                    ? 'bg-amber-700 text-white shadow-2xs'
                    : 'bg-white text-slate-700 hover:bg-[#F2EFE9] border border-[#E8E3D9]'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                <span>Community Audits ({audits.length})</span>
              </button>
            </div>

            {/* Quick Search */}
            {activeTab !== 'spellcheck_lab' && activeTab !== 'user_audits' && (
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter feeds by name/domain..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#E8E3D9] rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 placeholder:text-slate-400 text-slate-800"
                />
              </div>
            )}
          </div>

          {/* Modal Body Area */}
          <div className="p-5 sm:p-8 overflow-y-auto flex-1 space-y-6">
            {/* TAB: SPELLCHECK ENGINE WORKBENCH */}
            {activeTab === 'spellcheck_lab' && (
              <div className="space-y-6 max-w-4xl mx-auto">
                <div className="bg-white p-6 rounded-xl border border-[#E8E3D9] shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <SpellCheck className="w-5 h-5 text-emerald-600" />
                      <h3 className="font-serif font-bold text-base text-slate-900">
                        Editorial Spellcheck & Typographical Normalizer
                      </h3>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Score: {spellcheckReport?.cleanlinessScore || 100}%
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Test how the pipeline automatically audits incoming data feeds: detecting and silently fixing misspelled wire vocabulary, improper acronyms (e.g. isro → ISRO, reuterss → Reuters), missing contraction apostrophes, and punctuation artifacts.
                  </p>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Input Raw Wire Sample Text
                    </label>
                    <textarea
                      rows={4}
                      value={spellcheckInput}
                      onChange={e => {
                        setSpellcheckInput(e.target.value);
                        handleRunSpellcheck(e.target.value);
                      }}
                      placeholder="Paste raw scraped text or wire excerpt with typos here..."
                      className="w-full p-3 text-xs bg-[#FAF8F5] border border-[#E8E3D9] rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800 font-mono leading-relaxed"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => handleRunSpellcheck(spellcheckInput)}
                      disabled={isAnalyzingSpellcheck}
                      className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-lg shadow-2xs transition-all cursor-pointer flex items-center gap-2"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzingSpellcheck ? 'animate-spin' : ''}`} />
                      <span>Re-Analyze Spellcheck</span>
                    </button>

                    <div className="flex items-center gap-3 text-xs text-slate-600">
                      <span>Total Corrections: <strong className="text-slate-900 font-mono">{spellcheckReport?.fixesCount || 0}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Spellcheck Output Comparison Card */}
                {spellcheckReport && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-xl border border-rose-200 bg-rose-50/20 shadow-2xs space-y-3">
                      <div className="flex items-center gap-2 text-rose-800 text-xs font-bold uppercase tracking-wider">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        <span>Detected Flaws & Fixes ({spellcheckReport.fixes.length})</span>
                      </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {spellcheckReport.fixes.length === 0 ? (
                          <p className="text-xs text-slate-500 italic">No spelling or grammar errors detected. Text is 100% clean.</p>
                        ) : (
                          spellcheckReport.fixes.map((fix, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#E8E3D9] text-xs">
                              <span className="line-through text-rose-600 font-mono">{fix.original}</span>
                              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-emerald-700 font-semibold font-mono">{fix.corrected}</span>
                              <span className="text-3xs uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                {fix.type}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-2xs space-y-3">
                      <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Normalized Editorial Prose</span>
                      </div>
                      <div className="p-3 rounded-lg bg-white border border-[#E8E3D9] text-xs font-serif text-slate-900 leading-relaxed max-h-48 overflow-y-auto">
                        {spellcheckReport.correctedText}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: COMMUNITY AUDITS LOG */}
            {activeTab === 'user_audits' && (
              <div className="space-y-4 max-w-4xl mx-auto">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-base text-slate-900">
                    Community-Submitted Source Audits & Trust Ratings
                  </h3>
                  <span className="text-xs text-slate-500">
                    {audits.length} recorded community reviews
                  </span>
                </div>

                <div className="space-y-3">
                  {audits.length === 0 ? (
                    <div className="p-8 text-center bg-white rounded-xl border border-[#E8E3D9]">
                      <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs text-slate-500">No user source audits submitted yet. Rate any source from the registry tab!</p>
                    </div>
                  ) : (
                    audits.map(audit => (
                      <div key={audit.id} className="p-4 rounded-xl bg-white border border-[#E8E3D9] shadow-2xs space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900">{audit.publisherName}</span>
                            <span className="text-3xs font-mono text-slate-500">({audit.domain})</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-full text-3xs font-bold font-mono bg-amber-50 text-amber-800 border border-amber-200">
                              {audit.userScore}/100 Trust Score
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-3xs font-semibold bg-slate-100 text-slate-700">
                              {audit.factualityRating} Factuality
                            </span>
                          </div>
                        </div>

                        {audit.feedback && (
                          <p className="text-xs text-slate-700 bg-[#FAF8F5] p-2.5 rounded-lg border border-[#E8E3D9] font-serif">
                            "{audit.feedback}"
                          </p>
                        )}

                        <div className="flex items-center justify-between text-3xs text-slate-400 pt-1">
                          <span>Audited by <strong>{audit.userName}</strong></span>
                          <span>{new Date(audit.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB: SOURCES REGISTRY GRID (ALL / OPEN RSS / DEVELOPER API / BULK DATASET) */}
            {activeTab !== 'spellcheck_lab' && activeTab !== 'user_audits' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading ? (
                  <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-400 gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-[#C2410C]" />
                    <span className="text-xs font-mono">Loading verified news registry...</span>
                  </div>
                ) : filteredSources.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-slate-500 text-xs">
                    No sources matched your query.
                  </div>
                ) : (
                  filteredSources.map(source => {
                    const badgeColor =
                      source.sourceType === 'open_rss'
                        ? 'bg-amber-50 text-amber-900 border-amber-200'
                        : source.sourceType === 'developer_api'
                        ? 'bg-blue-50 text-blue-900 border-blue-200'
                        : source.sourceType === 'bulk_dataset'
                        ? 'bg-purple-50 text-purple-900 border-purple-200'
                        : 'bg-emerald-50 text-emerald-900 border-emerald-200';

                    const typeLabel =
                      source.sourceType === 'open_rss'
                        ? 'Open RSS'
                        : source.sourceType === 'developer_api'
                        ? 'Developer API'
                        : source.sourceType === 'bulk_dataset'
                        ? 'Bulk Archive'
                        : 'Wire Service';

                    return (
                      <div
                        key={source.domain}
                        className="bg-white rounded-xl border border-[#E8E3D9] p-4.5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="font-serif font-bold text-sm text-slate-900">
                                  {source.name}
                                </h4>
                                <span className={`text-3xs font-semibold px-1.5 py-0.2 rounded border ${badgeColor}`}>
                                  {typeLabel}
                                </span>
                              </div>
                              <p className="text-3xs font-mono text-slate-500 mt-0.5">
                                {source.domain}
                              </p>
                            </div>

                            <span className="px-2 py-0.5 rounded-full text-3xs font-mono font-bold bg-slate-900 text-white shrink-0">
                              Tier {source.tier}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-sans">
                            {source.description}
                          </p>
                        </div>

                        {/* Scores & Metrics */}
                        <div className="space-y-2 pt-2 border-t border-[#F2EFE9]">
                          <div className="grid grid-cols-2 gap-2 text-2xs">
                            <div className="bg-[#FAF8F5] p-2 rounded-lg border border-[#E8E3D9]">
                              <span className="text-slate-500 block text-3xs uppercase tracking-wider">Authority Score</span>
                              <strong className="text-slate-900 font-mono text-xs">{source.reputationScore}/100</strong>
                            </div>
                            <div className="bg-[#FAF8F5] p-2 rounded-lg border border-[#E8E3D9]">
                              <span className="text-slate-500 block text-3xs uppercase tracking-wider">User Trust Rating</span>
                              <strong className="text-[#C2410C] font-mono text-xs">
                                {source.userTrustRating || source.reputationScore}/100
                                <span className="text-3xs font-normal text-slate-400 ml-1">
                                  ({source.userVotesCount || 1} votes)
                                </span>
                              </strong>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-3xs text-slate-500">
                            <span>Bias: <strong className="text-slate-700">{source.biasRating}</strong></span>
                            <span>Factuality: <strong className="text-emerald-700">{source.factualityRecord}</strong></span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => handleOpenAuditModal(source)}
                              className="flex-1 py-1.5 px-2 bg-white hover:bg-orange-50 hover:border-orange-300 text-[#C2410C] border border-[#E8E3D9] rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
                            >
                              <Star className="w-3 h-3 text-amber-500" />
                              <span>Rate Reliability</span>
                            </button>

                            {onSelectSourceToIngest && (
                              <button
                                onClick={() => {
                                  onSelectSourceToIngest({
                                    name: source.name,
                                    domain: source.domain,
                                    category: 'World',
                                    endpointUrl: source.endpointUrl,
                                  });
                                  onClose();
                                }}
                                title="Load into Ingest Lab"
                                className="py-1.5 px-2.5 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 shadow-2xs shrink-0"
                              >
                                <ArrowRight className="w-3 h-3" />
                                <span>Ingest</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Footer Note */}
          <div className="px-5 sm:px-8 py-3 bg-white border-t border-[#E8E3D9] flex items-center justify-between text-3xs text-slate-500 shrink-0">
            <span>
              All sources protected by active cryptographic corroboration and automated grammar sanitization.
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#FAF8F5] hover:bg-[#F2EFE9] text-slate-700 border border-[#E8E3D9] transition-all cursor-pointer"
            >
              Close Hub
            </button>
          </div>
        </motion.div>

        {/* User Reliability Rating Modal Sub-Dialog */}
        <AnimatePresence>
          {selectedSourceForAudit && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedSourceForAudit(null)}
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
              />

              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative w-full max-w-md bg-white rounded-2xl border border-[#E8E3D9] shadow-2xl p-6 z-10 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
                    <h3 className="font-serif font-bold text-base text-slate-900">
                      Audit Source Reliability
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedSourceForAudit(null)}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3 rounded-lg bg-[#FAF8F5] border border-[#E8E3D9] text-xs space-y-1">
                  <div className="font-bold text-slate-900">{selectedSourceForAudit.name}</div>
                  <div className="text-3xs text-slate-500 font-mono">{selectedSourceForAudit.domain}</div>
                </div>

                {auditSuccessMessage ? (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{auditSuccessMessage}</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitAudit} className="space-y-4">
                    {/* User Score Slider */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <label className="font-bold text-slate-700">Your Trust Rating Score</label>
                        <span className="font-mono font-bold text-slate-900 text-sm">{auditScore}/100</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="100"
                        value={auditScore}
                        onChange={e => setAuditScore(Number(e.target.value))}
                        className="w-full accent-slate-900 cursor-pointer"
                      />
                      <div className="flex justify-between text-3xs text-slate-400 font-mono">
                        <span>20 (Low Trust)</span>
                        <span>60 (Moderate)</span>
                        <span>100 (Unquestioned)</span>
                      </div>
                    </div>

                    {/* Factuality Rating Select */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Factuality Classification</label>
                      <select
                        value={auditFactuality}
                        onChange={e => setAuditFactuality(e.target.value as any)}
                        className="w-full p-2 text-xs bg-[#FAF8F5] border border-[#E8E3D9] rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                      >
                        <option value="Very High">Very High (Exemplary editorial fact-checking)</option>
                        <option value="High">High (Reliable primary sourcing)</option>
                        <option value="Moderate">Moderate (Occasional sensationalism/opinion)</option>
                        <option value="Unreliable">Unreliable (Frequent unverified claims)</option>
                      </select>
                    </div>

                    {/* Review Feedback */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Editorial Feedback (Optional)</label>
                      <textarea
                        rows={2}
                        value={auditFeedback}
                        onChange={e => setAuditFeedback(e.target.value)}
                        placeholder="Add details about coverage reliability, bias notes, or corrections..."
                        className="w-full p-2 text-xs bg-[#FAF8F5] border border-[#E8E3D9] rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 placeholder:text-slate-400"
                      />
                    </div>

                    {/* User Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Your Reader Name / Handle</label>
                      <input
                        type="text"
                        value={auditUserName}
                        onChange={e => setAuditUserName(e.target.value)}
                        placeholder="e.g. Elena Vance, Senior Fact-Checker"
                        className="w-full p-2 text-xs bg-[#FAF8F5] border border-[#E8E3D9] rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 placeholder:text-slate-400"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedSourceForAudit(null)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmittingAudit}
                        className="px-4 py-2 bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs font-semibold rounded-lg shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        {isSubmittingAudit ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Recording...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Submit Source Audit</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
};
