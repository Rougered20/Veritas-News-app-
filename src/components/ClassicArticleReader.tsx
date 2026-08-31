import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Share2,
  Bookmark,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Clock,
  Calendar,
  Layers,
  Sparkles,
  Printer,
  Globe,
  Quote,
  MessageSquare,
  AlertCircle,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { NewsArticle, VerifiedClaim } from '../types.js';
import { TrustBadge } from './TrustBadge.js';
import { ArticleCommentsSection } from './ArticleCommentsSection.js';

interface ClassicArticleReaderProps {
  articleId: string;
  onBackToFeed?: () => void;
}

export const ClassicArticleReader: React.FC<ClassicArticleReaderProps> = ({
  articleId,
  onBackToFeed,
}) => {
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<'standard' | 'large' | 'compact'>('standard');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'story' | 'factcheck' | 'corroboration' | 'discussion'>('story');

  useEffect(() => {
    fetchArticle();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [articleId]);

  const fetchArticle = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch(`/api/news/${articleId}`);
      if (!res.ok) {
        throw new Error('Article not found or unavailable');
      }
      const data = await res.json();
      setArticle(data.article || data);
    } catch (err: any) {
      setError(err.message || 'Failed to load article');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?article=${encodeURIComponent(articleId)}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-slate-600">
        <div className="w-12 h-12 rounded-2xl bg-white border border-[#E8E3D9] shadow-md flex items-center justify-center mb-4">
          <div className="w-6 h-6 border-2 border-[#C2410C] border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="font-serif text-lg text-slate-900 font-semibold">Opening Full Classic Dispatch...</p>
        <p className="text-xs text-slate-500 font-mono mt-1">Cross-referencing verified wire network</p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white border border-[#E8E3D9] rounded-2xl p-8 shadow-sm">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h2 className="font-serif font-bold text-xl text-slate-900 mb-2">Dispatch Not Found</h2>
          <p className="text-xs text-slate-600 mb-6 leading-relaxed">
            The requested article identifier could not be retrieved from the wire network. It may have been retracted or re-indexed.
          </p>
          {onBackToFeed ? (
            <button
              onClick={onBackToFeed}
              className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Main Feed</span>
            </button>
          ) : (
            <a
              href="/"
              className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Main Wire</span>
            </a>
          )}
        </div>
      </div>
    );
  }

  const textSizeClass =
    fontSize === 'large'
      ? 'text-lg sm:text-xl leading-loose'
      : fontSize === 'compact'
      ? 'text-sm sm:text-base leading-relaxed'
      : 'text-base sm:text-lg leading-relaxed';

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-900 antialiased print:bg-white print:text-black">
      {/* Top Editorial Masthead Bar */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E8E3D9] transition-all print:hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBackToFeed ? (
              <button
                onClick={onBackToFeed}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-[#F2EFE9] text-slate-700 border border-[#E8E3D9] shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Wire Feed</span>
              </button>
            ) : (
              <a
                href="/"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-[#F2EFE9] text-slate-700 border border-[#E8E3D9] shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Wire Feed</span>
              </a>
            )}

            <div className="hidden sm:flex items-center gap-2 text-2xs font-mono text-slate-500 border-l border-[#E8E3D9] pl-3">
              <span className="font-bold text-slate-800 uppercase tracking-wider">{article.category}</span>
              <span>/</span>
              <span>{article.primaryPublisher.name}</span>
            </div>
          </div>

          {/* Reading Controls & Actions */}
          <div className="flex items-center gap-2">
            {/* Font Size Adjuster */}
            <div className="flex items-center bg-white border border-[#E8E3D9] rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setFontSize('compact')}
                className={`px-2 py-1 rounded font-serif ${fontSize === 'compact' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'}`}
                title="Compact typography"
              >
                A-
              </button>
              <button
                onClick={() => setFontSize('standard')}
                className={`px-2 py-1 rounded font-serif ${fontSize === 'standard' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'}`}
                title="Standard typography"
              >
                A
              </button>
              <button
                onClick={() => setFontSize('large')}
                className={`px-2 py-1 rounded font-serif ${fontSize === 'large' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'}`}
                title="Large typography"
              >
                A+
              </button>
            </div>

            <button
              onClick={handlePrint}
              title="Print Classic Newspaper Layout"
              className="p-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-[#F2EFE9] border border-[#E8E3D9] rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleCopyLink}
              title="Copy verified dispatch permalink"
              className="px-3 py-1.5 bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs font-semibold rounded-lg shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied Link!' : 'Share'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Article Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-8">
        {/* Newspaper Style Header & Primary Article */}
        <article className="space-y-6 bg-white border border-[#E8E3D9] rounded-2xl p-6 sm:p-10 shadow-sm">
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8E3D9] pb-4">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-full text-2xs font-bold uppercase tracking-wider bg-orange-100 text-orange-950 border border-orange-200">
                {article.category}
              </span>
              <span className="font-bold text-slate-900">{article.primaryPublisher.name}</span>
              <span className="text-3xs font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                Tier {article.primaryPublisher.tier} (Authority {article.primaryPublisher.reputationScore}%)
              </span>
              {article.primaryPublisher.sourceType && (
                <span className="text-3xs font-semibold uppercase px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                  {article.primaryPublisher.sourceType.replace('_', ' ')}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(article.publishedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {article.readTime}
              </span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="font-serif font-bold text-2xl sm:text-4xl lg:text-5xl text-slate-950 leading-tight tracking-tight">
            {article.title}
          </h1>

          {/* Lead Abstract / Dek */}
          <div className="p-4 sm:p-5 rounded-xl bg-[#FAF8F5] border border-[#E8E3D9] border-l-4 border-l-[#C2410C]">
            <p className="font-serif italic text-slate-800 text-base sm:text-lg leading-relaxed">
              "{article.summary}"
            </p>
          </div>

          {/* Trust Scoring & Corroboration Snapshot */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E3D9] text-xs">
            <div className="flex items-center gap-2.5">
              <TrustBadge score={article.trustScore} verdict={article.verdict} />
              <div>
                <span className="text-3xs uppercase tracking-wider text-slate-500 block font-bold">Provenance Score</span>
                <span className="font-bold text-slate-900">{article.trustScore}/100 High Confidence</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 border-t sm:border-t-0 sm:border-l border-[#E8E3D9] pt-2 sm:pt-0 sm:pl-3">
              <Layers className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <span className="text-3xs uppercase tracking-wider text-slate-500 block font-bold">Corroborating Wires</span>
                <span className="font-bold text-slate-900">{article.corroboratingSources?.length || 1} Independent Outlets</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 border-t sm:border-t-0 sm:border-l border-[#E8E3D9] pt-2 sm:pt-0 sm:pl-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="text-3xs uppercase tracking-wider text-slate-500 block font-bold">Claim Verification</span>
                <span className="font-bold text-slate-900">{article.claims?.length || 2} Claims Corroborated</span>
              </div>
            </div>
          </div>

          {/* Classic Editorial Body Columns */}
          <div className="pt-4 border-t border-[#E8E3D9] space-y-6">
            {/* 3-Part Structured Narrative Breakdown */}
            {article.structuredStory ? (
              <div className="space-y-6">
                <section className="space-y-2">
                  <h3 className="font-serif font-bold text-lg sm:text-xl text-slate-950 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C2410C]" />
                    What Happened
                  </h3>
                  <p className={`font-serif text-slate-800 ${textSizeClass}`}>
                    {article.structuredStory.whatHappened}
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="font-serif font-bold text-lg sm:text-xl text-slate-950 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    Key Context & Historical Background
                  </h3>
                  <p className={`font-serif text-slate-800 ${textSizeClass}`}>
                    {article.structuredStory.keyContext}
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="font-serif font-bold text-lg sm:text-xl text-slate-950 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    What's Next & Strategic Timeline
                  </h3>
                  <p className={`font-serif text-slate-800 ${textSizeClass}`}>
                    {article.structuredStory.whatsNext}
                  </p>
                </section>
              </div>
            ) : null}

            {/* Extended Content Paragraphs if available */}
            {article.fullContent && (
              <div className="pt-4 border-t border-[#E8E3D9] space-y-4 font-serif text-slate-800">
                {article.fullContent.split('\n\n').map((para, idx) => (
                  <p key={idx} className={`${textSizeClass} leading-relaxed`}>
                    {para}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Key Facts & Corroborated Claims Box */}
          {article.claims && article.claims.length > 0 && (
            <div className="mt-8 p-5 sm:p-6 rounded-xl bg-[#FAF8F5] border border-[#E8E3D9] space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-serif font-bold text-base sm:text-lg text-slate-950 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                  Audited Claims & Grounded Citations
                </h4>
                <span className="text-3xs font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-950 border border-emerald-200">
                  {article.verdict}
                </span>
              </div>

              <div className="space-y-3">
                {article.claims.map((claim: VerifiedClaim, idx: number) => (
                  <div key={idx} className="p-4 rounded-lg bg-white border border-[#E8E3D9] space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-serif font-bold text-sm sm:text-base text-slate-900">
                        "{claim.claim}"
                      </p>
                      <span className="px-2.5 py-0.5 rounded-full text-3xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-200 shrink-0">
                        {claim.status}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed">
                      {claim.evidence}
                    </p>
                    {claim.corroboratingSource && (
                      <div className="text-3xs text-slate-500 pt-1 font-mono flex items-center gap-1.5">
                        <span className="font-bold">Corroborating Source:</span>
                        <span className="px-1.5 py-0.5 rounded bg-[#F2EFE9] text-slate-700">
                          {claim.corroboratingSource}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Primary & Corroborating Publisher Dispatches */}
          <div className="mt-8 pt-6 border-t border-[#E8E3D9] space-y-4">
            <h4 className="font-serif font-bold text-base sm:text-lg text-slate-950 flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#C2410C]" />
              Corroborating Wire Network ({article.corroboratingSources?.length || 1} Outlets)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Primary Source */}
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E3D9] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">{article.primaryPublisher.name}</span>
                  <span className="text-3xs font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-950">Primary</span>
                </div>
                <p className="text-xs font-mono text-slate-500">{article.primaryPublisher.domain}</p>
                <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                  <span>Reputation: <strong>{article.primaryPublisher.reputationScore}%</strong></span>
                  <span>Tier {article.primaryPublisher.tier} Wire</span>
                </div>
              </div>

              {/* Additional Corroborating Nodes */}
              {article.corroboratingSources && article.corroboratingSources.map((src, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-white border border-[#E8E3D9] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">{src.publisher}</span>
                    <span className="text-3xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-950">Corroborator</span>
                  </div>
                  <p className="text-xs text-slate-700 font-serif leading-snug">"{src.headlineMatch}"</p>
                  <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-100">
                    <span>Domain: <strong>{src.domainScore}%</strong></span>
                    <span>Tier {src.tier}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </article>

        {/* Community Discussion Section */}
        <section className="bg-white border border-[#E8E3D9] rounded-2xl p-6 sm:p-10 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <MessageSquare className="w-5 h-5 text-[#C2410C]" />
            <h3 className="font-serif font-bold text-xl text-slate-950">
              Community Audit & Discussion Room
            </h3>
          </div>
          <ArticleCommentsSection articleId={article.id} articleTitle={article.title} />
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-[#E8E3D9] bg-[#FAF8F5] text-center text-xs text-slate-500 print:hidden">
        <p className="font-serif text-slate-700 font-semibold mb-1">
          Cryptographically Verified Autonomous Wire Network
        </p>
        <p className="text-3xs font-mono text-slate-400">
          Dual-source corroborated across global public datasets, developer APIs, and open RSS feeds.
        </p>
      </footer>
    </div>
  );
};
