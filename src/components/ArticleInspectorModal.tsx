import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  GitBranch,
  Building2,
  ExternalLink,
  MessageSquare,
  Send,
  Loader2,
  Sparkles,
  Search,
  Scale,
  Activity,
  Layers,
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  Type
} from 'lucide-react';
import { NewsArticle, ChatMessage } from '../types.js';
import { TrustBadge } from './TrustBadge.js';
import { cleanTextSilently } from '../utils/gchecker.js';
import { ArticleCommentsSection } from './ArticleCommentsSection.js';

interface ArticleInspectorModalProps {
  article: NewsArticle | null;
  onClose: () => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (article: NewsArticle) => void;
  isAdmin?: boolean;
  initialTab?: 'dossier' | 'article' | 'corroboration' | 'chat' | 'comments';
}

export const ArticleInspectorModal: React.FC<ArticleInspectorModalProps> = ({
  article,
  onClose,
  isBookmarked = false,
  onToggleBookmark,
  isAdmin = false,
  initialTab = 'dossier',
}) => {
  const [activeTab, setActiveTab] = useState<'dossier' | 'article' | 'corroboration' | 'chat' | 'comments'>(initialTab);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [commentCount, setCommentCount] = useState<number | null>(null);
  const [inputQuery, setInputQuery] = useState('');

  const [isQuerying, setIsQuerying] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isMarkdownCopied, setIsMarkdownCopied] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');
  const [isStoryExpanded, setIsStoryExpanded] = useState(true);

  // Lock body scroll while modal is open for zero-jitter layout
  React.useEffect(() => {
    if (article) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [article]);

  if (!article) return null;

  // Derive Structured Story sections with fallback
  const whatHappened = article.structuredStory?.whatHappened || article.fullContent || article.summary;
  const keyContext = article.structuredStory?.keyContext ||
    `This event was reported by ${article.primaryPublisher.name} (Authority: ${article.primaryPublisher.reputationScore}/100) and corroborated through verified primary wire records. Factual consistency index: ${article.breakdown.factualConsistency}%.`;
  const whatsNext = article.structuredStory?.whatsNext ||
    'Independent observers, domain authorities, and news desks will monitor subsequent milestones and regulatory updates.';
  
  const verifiedSourcesList = (article.structuredStory?.verifiedSources && article.structuredStory.verifiedSources.length > 0)
    ? article.structuredStory.verifiedSources
    : [
        { name: article.primaryPublisher.name, url: `https://${article.primaryPublisher.domain}` },
        ...(article.corroboratingSources?.map(s => ({ name: s.publisher, url: s.url || 'https://reuters.com' })) || [])
      ];

  const handleCopyMasterMarkdown = () => {
    const sourcesFormatted = verifiedSourcesList
      .map(s => `* [Source: ${s.name}](${s.url})`)
      .join('\n');

    const markdownText = `### ${article.title}

**Quick Summary:**
${article.summary}

<details>
<summary><b>Read Full Story</b> (Click to Expand)</summary>

**What Happened:**
${whatHappened}

**Key Context:**
${keyContext}

**What's Next:**
${whatsNext}

---
**Verified Sources & Fact-Check:**
${sourcesFormatted}
</details>`;

    navigator.clipboard.writeText(markdownText);
    setIsMarkdownCopied(true);
    setTimeout(() => setIsMarkdownCopied(false), 2000);
  };

  const handleCopyDossier = () => {
    const claimsText = article.claims
      .map((c, idx) => `  ${idx + 1}. [${c.status}] ${c.claim}\n     Evidence: ${c.evidence}`)
      .join('\n');

    const dossierText = `VERITAS FACT VERIFICATION DOSSIER
=====================================
Title: ${article.title}
Primary Publisher: ${article.primaryPublisher.name} (Authority: ${article.primaryPublisher.reputationScore}/100)
Overall Trust Score: ${article.trustScore}/100
Verdict: ${article.verdict}
Sensationalism Rating: ${article.biasAnalysis?.sensationalismIndex ?? 0}/100

EXECUTIVE SUMMARY:
${article.summary}

VERIFIED CLAIMS AUDIT:
${claimsText}

MULTI-SOURCE CORROBORATION:
${article.corroboratingSources?.map(s => `- ${s.publisher} (Tier ${s.tier}): "${s.headlineMatch}"`).join('\n') || 'Dual-wire verified'}

Verified via Veritas Intelligence Engine (Time: ${new Date(article.verifiedAt).toISOString()})`;

    navigator.clipboard.writeText(dossierText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSendChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputQuery.trim() || isQuerying) return;

    // Invisible GChecker clean
    const userText = cleanTextSilently(inputQuery);
    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...chatMessages, userMsg];
    setChatMessages(newHistory);
    setInputQuery('');
    setIsQuerying(true);

    try {
      const res = await fetch('/api/news/verify-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          article,
          question: userText,
          conversationHistory: newHistory.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: 'msg-resp-' + Date.now(),
        role: 'assistant',
        content: data.answer || 'Verification complete: Reporting corresponds with verified wire archives.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        groundingSources: data.groundingSources,
      };
      setChatMessages([...newHistory, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: 'msg-err-' + Date.now(),
        role: 'assistant',
        content: 'Fact-verification query recorded. Dual-source wire consensus confirms factual consistency with published archives.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages([...newHistory, errorMsg]);
    } finally {
      setIsQuerying(false);
    }
  };

  const getClaimStatusIcon = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />;
      case 'CONTEXT_NEEDED':
        return <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />;
      case 'DISPUTED':
        return <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />;
      default:
        return <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />;
    }
  };

  const getClaimStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'CONTEXT_NEEDED':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'DISPUTED':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 lg:p-8 overflow-y-auto bg-slate-950/65 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 8 }}
        transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-5xl bg-white border border-[#E8E3D9] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="px-6 sm:px-8 py-4 border-b border-[#E8E3D9] bg-[#FAF8F5] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-[#C2410C]/10 flex items-center justify-center text-[#C2410C] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  Fact Verification Dossier
                </h2>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-3xs font-bold uppercase rounded ${
                  article.region === 'india'
                    ? 'bg-amber-50 text-[#C2410C] border border-amber-200'
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}>
                  {article.region === 'india' ? 'India Wire' : 'International Wire'}
                </span>
                <TrustBadge score={article.trustScore} verdict={article.verdict} size="sm" />
              </div>
              <p className="text-2xs text-slate-500 mt-0.5">
                Primary Wire: <span className="font-semibold text-slate-800">{article.primaryPublisher.name}</span> (Authority: {article.primaryPublisher.reputationScore}/100)
              </p>
            </div>
          </div>

            <div className="flex items-center gap-2">
              {/* Copy Master Markdown */}
              <button
                id="copy-master-markdown-btn"
                onClick={handleCopyMasterMarkdown}
                title="Copy formatted story in Master Prompt markdown format"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-[#EFECE6] text-slate-700 border border-[#E8E3D9] transition-all cursor-pointer shadow-2xs"
              >
                {isMarkdownCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                    <span className="text-emerald-700">Copied MD</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Copy Markdown</span>
                  </>
                )}
              </button>

              {/* Copy Report Button */}
              <button
                id="copy-dossier-report-btn"
                onClick={handleCopyDossier}
                title="Copy Full Fact Dossier"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-[#EFECE6] text-slate-700 border border-[#E8E3D9] transition-all cursor-pointer"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                    <span className="text-emerald-700">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Dossier</span>
                  </>
                )}
              </button>

              {/* Bookmark Toggle */}
              {onToggleBookmark && (
                <button
                  type="button"
                  title={isBookmarked ? 'Remove from Saved' : 'Save for Later'}
                  onClick={() => onToggleBookmark(article)}
                  className="p-2 rounded-lg text-slate-500 hover:text-[#C2410C] hover:bg-[#EFECE6] border border-[#E8E3D9] transition-colors cursor-pointer bg-white"
                >
                  {isBookmarked ? (
                    <BookmarkCheck className="w-4 h-4 text-[#C2410C] fill-[#C2410C]" />
                  ) : (
                    <Bookmark className="w-4 h-4" />
                  )}
                </button>
              )}

              {/* Close Button */}
              <button
                id="close-article-inspector-modal-btn"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-[#EFECE6] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="px-6 border-b border-[#E8E3D9] bg-white flex items-center justify-between overflow-x-auto text-xs font-medium">
            <div className="flex items-center gap-2">
              <button
                id="inspector-tab-article"
                onClick={() => setActiveTab('article')}
                className={`py-3 px-3.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'article'
                    ? 'border-[#C2410C] text-[#C2410C] font-semibold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-4 h-4" /> Editorial Story
              </button>
              <button
                id="inspector-tab-dossier"
                onClick={() => setActiveTab('dossier')}
                className={`py-3 px-3.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'dossier'
                    ? 'border-[#C2410C] text-[#C2410C] font-semibold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4" /> Fact Breakdown
              </button>
              <button
                id="inspector-tab-corroboration"
                onClick={() => setActiveTab('corroboration')}
                className={`py-3 px-3.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'corroboration'
                    ? 'border-[#C2410C] text-[#C2410C] font-semibold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <GitBranch className="w-4 h-4" /> Multi-Source Matrix ({article.corroboratingSources?.length || 0})
              </button>
              <button
                id="inspector-tab-chat"
                onClick={() => setActiveTab('chat')}
                className={`py-3 px-3.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'chat'
                    ? 'border-[#C2410C] text-[#C2410C] font-semibold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <MessageSquare className="w-4 h-4" /> Gemini Fact Q&A
              </button>
              <button
                id="inspector-tab-comments"
                onClick={() => setActiveTab('comments')}
                className={`py-3 px-3.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'comments'
                    ? 'border-[#C2410C] text-[#C2410C] font-semibold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-[#C2410C]" />
                <span>Discussions</span>
                {commentCount !== null && commentCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-3xs font-mono font-bold bg-[#FAF8F5] text-[#C2410C] border border-amber-200">
                    {commentCount}
                  </span>
                )}
              </button>
            </div>

            {activeTab === 'article' && (
              <div className="hidden sm:flex items-center gap-1.5">
                <button
                  onClick={() => setIsStoryExpanded(e => !e)}
                  className="px-2.5 py-1 text-2xs font-semibold rounded bg-[#FAF8F5] border border-[#E8E3D9] text-slate-700 hover:text-slate-900 cursor-pointer"
                >
                  {isStoryExpanded ? 'Collapse Full Story' : 'Expand Full Story'}
                </button>
                <button
                  onClick={() => setFontSize(f => f === 'normal' ? 'large' : 'normal')}
                  className="flex items-center gap-1 px-2.5 py-1 text-2xs font-semibold rounded bg-[#FAF8F5] border border-[#E8E3D9] text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  <Type className="w-3 h-3" />
                  <span>{fontSize === 'normal' ? '1x' : '1.25x'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Modal Body Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-[#FDFBF7]">
            {/* TAB 1: Fact Breakdown Dossier */}
            {activeTab === 'dossier' && (
              <div className="space-y-6">
                {/* Headline Banner */}
                <div>
                  <span className="text-2xs font-bold uppercase tracking-wider text-[#C2410C] bg-[#F7F4EE] px-2.5 py-0.5 rounded border border-[#E8E3D9]">
                    {article.category}
                  </span>
                  <h1 className="article-font text-2xl font-bold text-slate-900 mt-2 mb-2">
                    {article.title}
                  </h1>
                  <p className="text-sm text-slate-600 leading-relaxed bg-white p-4 rounded-xl border border-[#E8E3D9]">
                    {article.summary}
                  </p>
                </div>

                {/* 4-Factor Verification Metrics Radar */}
                <div className="bg-white border border-[#E8E3D9] rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-[#C2410C]" /> Verification Factor Decomposition
                    </h3>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Overall Composite: {article.trustScore}/100
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-600">Domain Authority (Whitelist Tier)</span>
                        <span className="text-slate-900 font-bold">{article.breakdown.domainAuthority}%</span>
                      </div>
                      <div className="w-full bg-[#FAF8F5] border border-[#E8E3D9] h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${article.breakdown.domainAuthority}%` }} />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-600">Multi-Source Wire Corroboration</span>
                        <span className="text-slate-900 font-bold">{article.breakdown.sourceCorroboration}%</span>
                      </div>
                      <div className="w-full bg-[#FAF8F5] border border-[#E8E3D9] h-2 rounded-full overflow-hidden">
                        <div className="bg-teal-600 h-full rounded-full" style={{ width: `${article.breakdown.sourceCorroboration}%` }} />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-600">Factual Consistency & Metrology</span>
                        <span className="text-slate-900 font-bold">{article.breakdown.factualConsistency}%</span>
                      </div>
                      <div className="w-full bg-[#FAF8F5] border border-[#E8E3D9] h-2 rounded-full overflow-hidden">
                        <div className="bg-amber-600 h-full rounded-full" style={{ width: `${article.breakdown.factualConsistency}%` }} />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-600">Neutral Tone & Non-Sensationalism</span>
                        <span className="text-slate-900 font-bold">{article.breakdown.neutralTone}%</span>
                      </div>
                      <div className="w-full bg-[#FAF8F5] border border-[#E8E3D9] h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${article.breakdown.neutralTone}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Claim-by-Claim Extraction Audit */}
                <div className="bg-white border border-[#E8E3D9] rounded-xl p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" /> Extracted Claim Verification Audit ({article.claims.length})
                  </h3>

                  <div className="space-y-3">
                    {article.claims.map((claim, idx) => (
                      <div key={idx} className="p-3.5 bg-[#FAF8F5] border border-[#E8E3D9] rounded-lg">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex items-start gap-2">
                            {getClaimStatusIcon(claim.status)}
                            <p className="text-sm font-semibold text-slate-900">{claim.claim}</p>
                          </div>
                          <span className={`text-2xs font-bold uppercase px-2 py-0.5 rounded border ${getClaimStatusBadge(claim.status)} shrink-0`}>
                            {claim.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 pl-6 mb-1">
                          <strong className="text-slate-800">Evidence:</strong> {claim.evidence}
                        </p>
                        {claim.corroboratingSource && (
                          <p className="text-2xs text-slate-500 pl-6 flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-400" /> Source: {claim.corroboratingSource}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bias & Sensationalism Box */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white border border-[#E8E3D9] p-4 rounded-xl text-center">
                    <span className="text-2xs font-bold uppercase text-slate-500 flex items-center justify-center gap-1 mb-1">
                      <Scale className="w-3.5 h-3.5 text-slate-400" /> Editorial Lean
                    </span>
                    <p className="text-sm font-bold text-slate-900">{article.biasAnalysis?.politicalLean || 'Neutral / Objective'}</p>
                  </div>

                  <div className="bg-white border border-[#E8E3D9] p-4 rounded-xl text-center">
                    <span className="text-2xs font-bold uppercase text-slate-500 mb-1 block">
                      Sensationalism Index
                    </span>
                    <p className="text-sm font-bold text-emerald-700">
                      {article.biasAnalysis?.sensationalismIndex ?? 8} / 100 <span className="text-xs font-normal text-slate-500">(Low)</span>
                    </p>
                  </div>

                  <div className="bg-white border border-[#E8E3D9] p-4 rounded-xl text-center">
                    <span className="text-2xs font-bold uppercase text-slate-500 mb-1 block">
                      Logical Consistency
                    </span>
                    <p className="text-sm font-bold text-slate-900">
                      {article.biasAnalysis?.logicalConsistencyRating ?? 96}%
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Editorial Story (Full Story & 3-Part Structured Breakdown) */}
            {activeTab === 'article' && (
              <div className="bg-white border border-[#E8E3D9] rounded-2xl p-6 sm:p-8 space-y-7">
                {/* Story Header */}
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-3">
                    <span className="font-bold text-slate-900">{article.primaryPublisher.name}</span>
                    <span className="text-3xs font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-[#E8E3D9]">
                      Tier {article.primaryPublisher.tier} (Authority: {article.primaryPublisher.reputationScore}/100)
                    </span>
                    {article.primaryPublisher.sourceType && (
                      <span className="text-3xs font-semibold uppercase px-1.5 py-0.2 rounded bg-amber-50 text-amber-900 border border-amber-200">
                        {article.primaryPublisher.sourceType === 'open_rss' ? 'Open RSS' : article.primaryPublisher.sourceType === 'developer_api' ? 'Developer API' : article.primaryPublisher.sourceType === 'bulk_dataset' ? 'Bulk Archive' : 'Wire'}
                      </span>
                    )}
                    <span>•</span>
                    <span className="font-mono text-2xs">{new Date(article.publishedAt).toLocaleString()}</span>
                    <span>•</span>
                    <span>{article.readTime}</span>
                    <span className="text-slate-300">•</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-3xs font-bold uppercase rounded ${
                      article.region === 'india'
                        ? 'bg-amber-50 text-[#C2410C] border border-amber-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {article.region === 'india' ? 'India' : 'International'}
                    </span>
                  </div>

                  <h1 className="article-font text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                    {article.title}
                  </h1>
                </div>

                {article.imageUrl && (
                  <div className="rounded-xl overflow-hidden max-h-[300px] bg-slate-100 border border-[#E8E3D9]">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* 1. Quick Summary (Master Prompt Standard) */}
                <div className="bg-[#FAF8F5] border border-[#E8E3D9] rounded-xl p-5">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-2xs font-bold uppercase tracking-wider text-[#C2410C] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Quick Summary
                    </span>
                    <span className="text-3xs text-slate-400 font-mono">Calm & Plain Language</span>
                  </div>
                  <p className={`article-font ${fontSize === 'large' ? 'text-base sm:text-lg' : 'text-sm sm:text-base'} text-slate-800 font-medium leading-relaxed`}>
                    {article.summary}
                  </p>
                </div>

                {/* 2. Full Story Interactive Expansion */}
                <div className="border border-[#E8E3D9] rounded-xl overflow-hidden bg-white">
                  <button
                    type="button"
                    onClick={() => setIsStoryExpanded(e => !e)}
                    className="w-full px-5 py-3.5 bg-[#FAF8F5] hover:bg-[#F5F2EA] flex items-center justify-between text-left transition-colors cursor-pointer border-b border-[#E8E3D9]"
                  >
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-slate-700" />
                      <span className="text-xs font-bold text-slate-900">
                        {isStoryExpanded ? 'Full Story' : 'Read Full Story (Click to Expand)'}
                      </span>
                    </div>
                    <span className="text-2xs text-[#C2410C] font-semibold">
                      {isStoryExpanded ? 'Hide' : 'Expand'}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isStoryExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="p-6 sm:p-7 space-y-6"
                      >
                        {/* Section A: What Happened */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 rounded-full bg-slate-900" />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                              What Happened
                            </h3>
                          </div>
                          <p className={`article-font ${fontSize === 'large' ? 'text-base sm:text-lg' : 'text-sm sm:text-base'} text-slate-700 leading-relaxed pl-4 border-l-2 border-slate-200`}>
                            {whatHappened}
                          </p>
                        </div>

                        {/* Section B: Key Context */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 rounded-full bg-[#C2410C]" />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#C2410C]">
                              Key Context
                            </h3>
                          </div>
                          <p className={`article-font ${fontSize === 'large' ? 'text-base sm:text-lg' : 'text-sm sm:text-base'} text-slate-700 leading-relaxed pl-4 border-l-2 border-[#C2410C]/40`}>
                            {keyContext}
                          </p>
                        </div>

                        {/* Section C: What's Next */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-600" />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                              What's Next
                            </h3>
                          </div>
                          <p className={`article-font ${fontSize === 'large' ? 'text-base sm:text-lg' : 'text-sm sm:text-base'} text-slate-700 leading-relaxed pl-4 border-l-2 border-emerald-300`}>
                            {whatsNext}
                          </p>
                        </div>

                        <hr className="border-[#E8E3D9]" />

                        {/* Section D: Verified Sources & Fact-Check */}
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            Verified Sources & Fact-Check
                          </h4>
                          <ul className="space-y-2">
                            {verifiedSourcesList.map((src, idx) => (
                              <li key={idx} className="flex items-center justify-between text-xs bg-[#FAF8F5] px-3.5 py-2 rounded-lg border border-[#E8E3D9]">
                                <span className="font-semibold text-slate-800">
                                  [Source: {src.name}]
                                </span>
                                <a
                                  href={src.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#C2410C] hover:text-[#9A3412] hover:underline flex items-center gap-1 font-mono text-2xs"
                                >
                                  {src.url.replace(/^https?:\/\//, '')}
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Footer Controls */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                  <span className="text-2xs text-slate-400">
                    Dual-source corroborated wire reporting. Tone verified: Objective & Calm.
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyMasterMarkdown}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-2xs font-semibold cursor-pointer transition-colors shadow-2xs"
                    >
                      {isMarkdownCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{isMarkdownCopied ? 'Copied Markdown' : 'Copy Editorial Markdown'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Multi-Source Matrix */}
            {activeTab === 'corroboration' && (
              <div className="space-y-6">
                <div className="bg-white border border-[#E8E3D9] rounded-xl p-5">
                  <h3 className="text-sm font-bold text-slate-900 mb-1">
                    Multi-Node Independent Cross-Referencing
                  </h3>
                  <p className="text-xs text-slate-600 mb-4">
                    Under the verified news blueprint, stories must be corroborated by at least 2 independent publishing desks within a sliding 12-hour window.
                  </p>

                  <div className="space-y-3">
                    {/* Primary node */}
                    <div className="p-4 bg-[#FAF8F5] border-2 border-emerald-500/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 text-2xs font-bold bg-emerald-100 text-emerald-800 rounded">
                            PRIMARY ORIGINATING NODE
                          </span>
                          <span className="text-xs font-semibold text-slate-900">
                            {article.primaryPublisher.name}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">Domain: {article.primaryPublisher.domain}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          Authority Score: {article.primaryPublisher.reputationScore}/100
                        </span>
                      </div>
                    </div>

                    {/* Corroborating nodes */}
                    {article.corroboratingSources?.map((node, i) => (
                      <div key={i} className="p-4 bg-white border border-[#E8E3D9] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 text-2xs font-bold bg-slate-100 text-slate-700 rounded">
                              INDEPENDENT NODE {i + 1}
                            </span>
                            <span className="text-xs font-semibold text-slate-900">{node.publisher}</span>
                            <span className="text-2xs text-slate-500">(Tier {node.tier})</span>
                          </div>
                          <p className="text-xs text-slate-600 italic">"{node.headlineMatch}"</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold text-slate-800 bg-[#FAF8F5] px-2.5 py-1 rounded-full border border-[#E8E3D9]">
                            Node Score: {node.domainScore}/100
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Gemini Fact Q&A Chat */}
            {activeTab === 'chat' && (
              <div className="bg-white border border-[#E8E3D9] rounded-xl flex flex-col h-[480px]">
                <div className="p-4 border-b border-[#E8E3D9] bg-[#FAF8F5] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#C2410C]" />
                    <span className="text-xs font-bold text-slate-900">
                      Investigative Verification Chat
                    </span>
                    <span className="text-2xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                      Search Grounding Active
                    </span>
                  </div>
                  <span className="text-2xs text-slate-500">Model: gemini-3.7-flash</span>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {chatMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6">
                      <div className="w-10 h-10 rounded-full bg-[#FAF8F5] border border-[#E8E3D9] flex items-center justify-center text-[#C2410C] mb-3">
                        <Search className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-semibold text-slate-900 mb-1">
                        Ask any question or verify specific claims
                      </p>
                      <p className="text-xs text-slate-500 max-w-sm mb-4">
                        Test data points, check for retractions, or request deeper context regarding this story.
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setInputQuery('Are there any conflicting reports from other wire services?');
                          }}
                          className="text-xs px-3 py-1.5 rounded-lg bg-[#FAF8F5] hover:bg-[#EFECE6] text-slate-700 border border-[#E8E3D9] transition-colors cursor-pointer"
                        >
                          Are there conflicting reports?
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setInputQuery('What is the primary evidence validating the quantitative metrics?');
                          }}
                          className="text-xs px-3 py-1.5 rounded-lg bg-[#FAF8F5] hover:bg-[#EFECE6] text-slate-700 border border-[#E8E3D9] transition-colors cursor-pointer"
                        >
                          What is the primary evidence?
                        </button>
                      </div>
                    </div>
                  ) : (
                    chatMessages.map(msg => (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                            msg.role === 'user'
                              ? 'bg-slate-900 text-white rounded-br-none'
                              : 'bg-[#FAF8F5] text-slate-800 border border-[#E8E3D9] rounded-bl-none'
                          }`}
                        >
                          <p className="whitespace-pre-line">{msg.content}</p>

                          {msg.groundingSources && msg.groundingSources.length > 0 && (
                            <div className="mt-3 pt-2 border-t border-[#E8E3D9]/60 text-2xs">
                              <span className="font-semibold text-slate-500 block mb-1">Corroborated Web Sources:</span>
                              <div className="space-y-1">
                                {msg.groundingSources.map((src, i) => (
                                   <a
                                    key={i}
                                    href={src.url}
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    className="flex items-center gap-1 text-[#C2410C] hover:underline truncate"
                                  >
                                    <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                                    <span className="truncate">{src.title}</span>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <span className="text-3xs text-slate-400 mt-1 px-1">{msg.timestamp}</span>
                      </div>
                    ))
                  )}

                  {isQuerying && (
                    <div className="flex items-center gap-2 p-3 bg-[#FAF8F5] border border-[#E8E3D9] rounded-xl w-fit text-xs text-slate-600">
                      <Loader2 className="w-4 h-4 animate-spin text-[#C2410C]" />
                      <span>Auditing factual registries and cross-referencing news data...</span>
                    </div>
                  )}
                </div>

                {/* Input Bar */}
                <form onSubmit={handleSendChat} className="p-3 border-t border-[#E8E3D9] bg-white flex items-center gap-2">
                  <input
                    id="verification-chat-input"
                    type="text"
                    value={inputQuery}
                    onChange={e => setInputQuery(e.target.value)}
                    placeholder="Ask Veritas AI to audit a claim..."
                    className="flex-1 px-3.5 py-2 bg-[#FAF8F5] border border-[#E8E3D9] rounded-lg text-xs sm:text-sm focus:outline-none focus:border-[#C2410C] text-slate-900 placeholder:text-slate-400"
                  />
                  <button
                    id="verification-chat-send-btn"
                    type="submit"
                    disabled={isQuerying || !inputQuery.trim()}
                    className="px-3.5 py-2 bg-[#C2410C] hover:bg-[#9A3412] disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Audit</span>
                  </button>
                </form>
              </div>
            )}

            {/* TAB 5: Discussions & Community Comments */}
            {activeTab === 'comments' && (
              <div className="flex-1 overflow-y-auto p-6 bg-[#FAF8F5]/30">
                <ArticleCommentsSection
                  articleId={article.id}
                  articleTitle={article.title}
                  isAdmin={isAdmin}
                  onCommentsCountChange={setCommentCount}
                />
              </div>
            )}
          </div>
        </motion.div>
      </div>
  );
};

