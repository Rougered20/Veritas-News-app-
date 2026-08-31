import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flag, X, AlertTriangle, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';
import { ArticleComment, ReportReason } from '../types.js';

interface ReportCommentModalProps {
  comment: ArticleComment | null;
  articleTitle?: string;
  onClose: () => void;
  onReportSubmitted: (commentId: string) => void;
}

const REPORT_REASONS: Array<{ value: ReportReason; label: string; description: string }> = [
  {
    value: 'misinformation',
    label: 'False or Misleading Information',
    description: 'Contains demonstrably false claims, manipulated facts, or debunked rumors.',
  },
  {
    value: 'harassment',
    label: 'Harassment or Personal Attack',
    description: 'Targeted hostility, insults, doxxing, or intimidation against individuals or groups.',
  },
  {
    value: 'hate_speech',
    label: 'Hate Speech & Discrimination',
    description: 'Dehumanizing rhetoric, slurs, or incitement of violence against protected groups.',
  },
  {
    value: 'spam',
    label: 'Spam, Phishing, or Commercial Links',
    description: 'Repetitive advertising, affiliate links, financial scams, or bot spam.',
  },
  {
    value: 'uncivil',
    label: 'Uncivil Conduct or Vulgarity',
    description: 'Offensive language, excessive hostility, or trolling that derails discourse.',
  },
  {
    value: 'other',
    label: 'Other Policy Violation',
    description: 'Other violations of Veritas wire community standards.',
  },
];

export const ReportCommentModal: React.FC<ReportCommentModalProps> = ({
  comment,
  articleTitle,
  onClose,
  onReportSubmitted,
}) => {
  const [selectedReason, setSelectedReason] = useState<ReportReason>('misinformation');
  const [details, setDetails] = useState('');
  const [reporterName, setReporterName] = useState(() => localStorage.getItem('veritas_user_name') || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!comment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/comments/${comment.id}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: selectedReason,
          details: details.trim() || undefined,
          reporterName: reporterName.trim() || 'Reader Report',
          articleTitle,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit report');
      }

      setIsSubmitted(true);
      onReportSubmitted(comment.id);
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while submitting the report');
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-white border border-[#E8E3D9] rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-[#E8E3D9] bg-[#FAF8F5] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                <Flag className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Flag Comment for Moderation</h3>
                <p className="text-2xs text-slate-500">Veritas Editorial Integrity Review</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-[#EFECE6] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {isSubmitted ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Report Submitted to Editorial Team</h4>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                Thank you for protecting wire accuracy. Our moderation team will audit this comment against editorial guidelines.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Comment preview quote */}
              <div className="p-3 bg-[#FAF8F5] border border-[#E8E3D9] rounded-xl text-2xs space-y-1">
                <div className="font-semibold text-slate-700 flex items-center justify-between">
                  <span>Author: {comment.author.name}</span>
                  <span className="text-slate-400 capitalize">{comment.author.role}</span>
                </div>
                <p className="text-slate-600 line-clamp-2 italic">
                  "{comment.content}"
                </p>
              </div>

              {/* Reason selection */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Select Violation Category
                </label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {REPORT_REASONS.map((r) => (
                    <label
                      key={r.value}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                        selectedReason === r.value
                          ? 'border-[#C2410C] bg-amber-50/50'
                          : 'border-[#E8E3D9] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reportReason"
                        value={r.value}
                        checked={selectedReason === r.value}
                        onChange={() => setSelectedReason(r.value)}
                        className="mt-0.5 text-[#C2410C] focus:ring-[#C2410C]"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-slate-900">{r.label}</div>
                        <div className="text-3xs text-slate-500 leading-tight mt-0.5">{r.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Details (Optional) */}
              <div>
                <label className="block text-2xs font-semibold text-slate-700 mb-1">
                  Additional Context / Evidence <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Provide any relevant context or links explaining why this content violates standards..."
                  rows={2}
                  className="w-full px-3 py-2 text-xs border border-[#E8E3D9] rounded-xl bg-white focus:outline-none focus:border-[#C2410C] focus:ring-1 focus:ring-[#C2410C]"
                />
              </div>

              {/* Reporter name */}
              <div>
                <label className="block text-2xs font-semibold text-slate-700 mb-1">
                  Your Alias <span className="text-slate-400 font-normal">(Optional for attribution)</span>
                </label>
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="e.g. Wire Reader / S. Sharma"
                  className="w-full px-3 py-1.5 text-xs border border-[#E8E3D9] rounded-xl bg-white focus:outline-none focus:border-[#C2410C] focus:ring-1 focus:ring-[#C2410C]"
                />
              </div>

              {errorMessage && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-2xs text-rose-700">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8E3D9]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-[#FAF8F5] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Flag className="w-3.5 h-3.5" />
                      <span>Flag for Review</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
