import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Sparkles, Loader2, CheckCircle2, AlertCircle, HelpCircle, ArrowRight, X } from 'lucide-react';
import { cleanTextSilently } from '../utils/gchecker.js';
import { TrustBadge } from './TrustBadge.js';
import { VerificationStatus, ClickbaitRating, VerifiedClaim } from '../types.js';

interface AuditResult {
  trustScore: number;
  verdict: VerificationStatus;
  clickbaitRating: ClickbaitRating;
  breakdown: {
    domainAuthority: number;
    sourceCorroboration: number;
    factualConsistency: number;
    neutralTone: number;
  };
  claims: VerifiedClaim[];
  biasAnalysis: {
    politicalLean: string;
    sensationalismIndex: number;
    logicalConsistencyRating: number;
  };
  verifiedSummary: string;
}

interface QuickClaimAuditorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickClaimAuditor: React.FC<QuickClaimAuditorProps> = ({ isOpen, onClose }) => {
  const [claimInput, setClaimInput] = useState('');
  const [publisherInput, setPublisherInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [auditData, setAuditData] = useState<AuditResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimInput.trim() || isLoading) return;

    // Invisible GChecker client-side sanitization
    const polishedClaim = cleanTextSilently(claimInput);
    const polishedPub = cleanTextSilently(publisherInput);

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/news/instant-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claim: polishedClaim,
          publisher: polishedPub || 'Citizen Query Submission',
        }),
      });

      const data = await res.json();
      if (data.success && data.result) {
        setAuditData(data.result);
      } else {
        setErrorMsg(data.error || 'Failed to complete factual audit');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Audit service unreachable');
    } finally {
      setIsLoading(false);
    }
  };

  const resetAudit = () => {
    setAuditData(null);
    setClaimInput('');
    setPublisherInput('');
    setErrorMsg(null);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="mb-8 overflow-hidden bg-white border border-[#E8E3D9] rounded-2xl shadow-xs"
      >
        <div className="p-5 sm:p-6 bg-[#FAF8F5] border-b border-[#E8E3D9] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#C2410C]/10 flex items-center justify-center text-[#C2410C]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Instant Factual Auditor & Claim Verifier
              </h3>
              <p className="text-2xs text-slate-500">
                Paste any headline, statement, or rumor to cross-reference against multi-wire verification nodes.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          {!auditData ? (
            <form onSubmit={handleAudit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Statement, Headline, or Claim
                </label>
                <textarea
                  id="quick-claim-textarea"
                  rows={2}
                  value={claimInput}
                  onChange={e => setClaimInput(e.target.value)}
                  placeholder="e.g. WHO confirms 74% decline in regional malaria cases using new dual vaccines..."
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E8E3D9] rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#C2410C] shadow-2xs"
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                <div className="flex-1 max-w-sm">
                  <input
                    type="text"
                    value={publisherInput}
                    onChange={e => setPublisherInput(e.target.value)}
                    placeholder="Source / Publisher (Optional, e.g. BBC, Reuters, Social Media)"
                    className="w-full px-3 py-2 bg-white border border-[#E8E3D9] rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#C2410C]"
                  />
                </div>

                <div className="flex items-center gap-2 justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !claimInput.trim()}
                    className="px-4 py-2 bg-[#C2410C] hover:bg-[#9A3412] disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying with Multi-Node Model...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Audit Statement</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                  {errorMsg}
                </p>
              )}
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E3D9]">
                <div>
                  <span className="text-2xs font-bold uppercase tracking-wider text-slate-500">
                    Factual Audit Report
                  </span>
                  <h4 className="article-font text-lg font-bold text-slate-900">
                    "{claimInput}"
                  </h4>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <TrustBadge score={auditData.trustScore} verdict={auditData.verdict} size="md" />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#FAF8F5] p-3 rounded-lg border border-[#E8E3D9] text-center">
                  <span className="text-3xs uppercase font-bold text-slate-500 block">Authority</span>
                  <span className="text-sm font-bold text-slate-900">{auditData.breakdown.domainAuthority}%</span>
                </div>
                <div className="bg-[#FAF8F5] p-3 rounded-lg border border-[#E8E3D9] text-center">
                  <span className="text-3xs uppercase font-bold text-slate-500 block">Corroboration</span>
                  <span className="text-sm font-bold text-teal-800">{auditData.breakdown.sourceCorroboration}%</span>
                </div>
                <div className="bg-[#FAF8F5] p-3 rounded-lg border border-[#E8E3D9] text-center">
                  <span className="text-3xs uppercase font-bold text-slate-500 block">Consistency</span>
                  <span className="text-sm font-bold text-slate-900">{auditData.breakdown.factualConsistency}%</span>
                </div>
                <div className="bg-[#FAF8F5] p-3 rounded-lg border border-[#E8E3D9] text-center">
                  <span className="text-3xs uppercase font-bold text-slate-500 block">Sensationalism</span>
                  <span className="text-sm font-bold text-emerald-700">{auditData.biasAnalysis.sensationalismIndex}/100</span>
                </div>
              </div>

              <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E8E3D9] text-xs text-slate-700 leading-relaxed">
                <strong className="font-semibold text-slate-900 block mb-1">Executive Summary:</strong>
                {auditData.verifiedSummary}
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-2xs text-slate-500">
                  Invisible GChecker prose and syntax normalized automatically.
                </span>
                <button
                  onClick={resetAudit}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                >
                  Audit Another Statement
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
