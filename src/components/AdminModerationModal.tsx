import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  X,
  Ban,
  Trash2,
  Check,
  Search,
  SlidersHorizontal,
  RefreshCw,
  AlertTriangle,
  Flag,
  MessageSquare,
  Clock,
  ExternalLink,
  ThumbsUp,
  UserCheck,
  UserX,
  FileText,
  Filter,
  CheckSquare,
  AlertCircle
} from 'lucide-react';
import { ArticleComment, CommentReport, CommentStatus } from '../types.js';

interface AdminModerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectArticleById?: (articleId: string) => void;
}

export const AdminModerationModal: React.FC<AdminModerationModalProps> = ({
  isOpen,
  onClose,
  onSelectArticleById,
}) => {
  const [activeTab, setActiveTab] = useState<'flagged' | 'all' | 'reports' | 'rejected'>('flagged');
  const [comments, setComments] = useState<ArticleComment[]>([]);
  const [reports, setReports] = useState<CommentReport[]>([]);
  const [metrics, setMetrics] = useState<any>({
    totalComments: 0,
    pendingReview: 0,
    approvedCount: 0,
    rejectedCount: 0,
    totalReports: 0,
    activeReports: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Fetch comments and metrics for moderation
  const loadModerationData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Comments
      let statusParam = 'all';
      let reportedOnlyParam = false;

      if (activeTab === 'flagged') {
        // Fetch all, we will filter for pending or reported
      } else if (activeTab === 'rejected') {
        statusParam = 'rejected';
      }

      const res = await fetch(`/api/admin/comments?status=${statusParam}&search=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setComments(data.comments || []);
      if (data.metrics) {
        setMetrics(data.metrics);
      }

      // 2. Fetch Reports
      const repRes = await fetch('/api/admin/reports');
      const repData = await repRes.json();
      setReports(repData.reports || []);
    } catch (err) {
      console.error('Failed to load moderation data', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, searchQuery]);

  useEffect(() => {
    if (isOpen) {
      loadModerationData();
    }
  }, [isOpen, loadModerationData]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(null), 2500);
  };

  // Moderate comment
  const handleModerateStatus = async (commentId: string, status: CommentStatus) => {
    try {
      const res = await fetch(`/api/admin/comments/${commentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        showToast(`Comment marked as ${status.toUpperCase()}`);
        loadModerationData();
      }
    } catch (err) {
      console.error('Moderation action failed', err);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this comment?')) return;
    try {
      const res = await fetch(`/api/admin/comments/${commentId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast('Comment permanently deleted from wire');
        loadModerationData();
      }
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  // Resolve / Dismiss report
  const handleResolveReport = async (reportId: string, resolution: 'resolved' | 'dismissed') => {
    try {
      const res = await fetch(`/api/admin/reports/${reportId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolution }),
      });
      if (res.ok) {
        showToast(`Report ${resolution === 'resolved' ? 'Resolved' : 'Dismissed'}`);
        loadModerationData();
      }
    } catch (err) {
      console.error('Report resolution failed', err);
    }
  };

  // Filter comments based on active tab
  const displayedComments = comments.filter((c) => {
    if (activeTab === 'flagged') {
      return c.status === 'pending' || c.reportsCount > 0;
    }
    if (activeTab === 'rejected') {
      return c.status === 'rejected';
    }
    return true; // 'all'
  });

  const timeAgo = (dateStr: string) => {
    const timestamp = new Date(dateStr).getTime();
    if (isNaN(timestamp)) return 'Just now';
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60 || diff < 0) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className="relative w-full max-w-5xl bg-white border border-[#E8E3D9] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#E8E3D9] bg-[#FAF8F5] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-purple-100 border border-purple-300 flex items-center justify-center text-purple-700">
                <ShieldAlert className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">
                    Veritas Editorial Moderation Command Center
                  </h2>
                  <span className="px-2 py-0.5 rounded text-3xs font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
                    Staff Admin Privileges
                  </span>
                </div>
                <p className="text-2xs text-slate-500">
                  Manage citizen inquiries, flag false claims, and audit reported community perspectives
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadModerationData}
                disabled={isLoading}
                title="Refresh Moderation Queue"
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 bg-white hover:bg-[#EFECE6] border border-[#E8E3D9] transition-all cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#C2410C]' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-[#EFECE6] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 divide-x divide-[#E8E3D9] border-b border-[#E8E3D9] bg-white text-center text-xs">
            <div className="p-3">
              <span className="text-3xs font-bold uppercase tracking-wider text-slate-400 block">Total Comments</span>
              <span className="text-lg font-bold font-mono text-slate-900">{metrics.totalComments}</span>
            </div>
            <div className="p-3 bg-amber-50/40">
              <span className="text-3xs font-bold uppercase tracking-wider text-amber-700 block">Needs Review</span>
              <span className="text-lg font-bold font-mono text-amber-900">{metrics.pendingReview}</span>
            </div>
            <div className="p-3 bg-rose-50/40">
              <span className="text-3xs font-bold uppercase tracking-wider text-rose-700 block">Active Flagged Reports</span>
              <span className="text-lg font-bold font-mono text-rose-900">{metrics.activeReports}</span>
            </div>
            <div className="p-3">
              <span className="text-3xs font-bold uppercase tracking-wider text-emerald-700 block">Approved</span>
              <span className="text-lg font-bold font-mono text-emerald-900">{metrics.approvedCount}</span>
            </div>
            <div className="p-3 col-span-2 sm:col-span-1">
              <span className="text-3xs font-bold uppercase tracking-wider text-slate-400 block">Rejected / Spam</span>
              <span className="text-lg font-bold font-mono text-slate-600">{metrics.rejectedCount}</span>
            </div>
          </div>

          {/* Success Toast Banner */}
          {actionSuccessMessage && (
            <div className="px-6 py-2 bg-emerald-50 border-b border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionSuccessMessage}</span>
            </div>
          )}

          {/* Controls & Search */}
          <div className="px-6 py-3 border-b border-[#E8E3D9] bg-[#FAF8F5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
              <button
                id="admin-tab-flagged"
                onClick={() => setActiveTab('flagged')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'flagged'
                    ? 'bg-[#C2410C] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-[#EFECE6]'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Flagged Queue</span>
                {(metrics.pendingReview > 0 || metrics.activeReports > 0) && (
                  <span className="px-1.5 py-0.2 rounded-full text-3xs font-mono font-bold bg-white text-[#C2410C]">
                    {metrics.pendingReview + metrics.activeReports}
                  </span>
                )}
              </button>

              <button
                id="admin-tab-all"
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'all'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-[#EFECE6]'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>All Comments ({metrics.totalComments})</span>
              </button>

              <button
                id="admin-tab-reports"
                onClick={() => setActiveTab('reports')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'reports'
                    ? 'bg-purple-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-[#EFECE6]'
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
                <span>User Reports Registry ({reports.length})</span>
              </button>

              <button
                id="admin-tab-rejected"
                onClick={() => setActiveTab('rejected')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'rejected'
                    ? 'bg-rose-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-[#EFECE6]'
                }`}
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Rejected Archive ({metrics.rejectedCount})</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64 shrink-0">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search text, author, reason..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-[#E8E3D9] rounded-lg bg-white focus:outline-none focus:border-[#C2410C]"
              />
            </div>
          </div>

          {/* Main Body List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
            {activeTab === 'reports' ? (
              /* Reports Registry View */
              <div className="space-y-3">
                {reports.length === 0 ? (
                  <div className="py-12 text-center bg-white border border-dashed border-[#E8E3D9] rounded-2xl p-6">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-700">No active user violation reports.</p>
                    <p className="text-3xs text-slate-400">All submitted reports have been reviewed and resolved.</p>
                  </div>
                ) : (
                  reports.map((rep) => (
                    <div
                      key={rep.id}
                      className="p-4 bg-white border border-[#E8E3D9] rounded-xl shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-3xs font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
                            {rep.reason.replace('_', ' ')}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-3xs font-bold uppercase tracking-wider ${
                            rep.status === 'pending'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}>
                            Status: {rep.status}
                          </span>
                          <span className="text-3xs text-slate-400">• {timeAgo(rep.timestamp)}</span>
                        </div>

                        <div className="text-xs font-semibold text-slate-900">
                          Target Story: {rep.articleTitle || rep.articleId}
                        </div>

                        {rep.details && (
                          <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200 font-serif italic">
                            "{rep.details}"
                          </p>
                        )}

                        <div className="text-3xs text-slate-500">
                          Filed by reader: <strong>{rep.reporterName}</strong>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        {rep.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleResolveReport(rep.id, 'resolved')}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Resolve</span>
                            </button>
                            <button
                              onClick={() => handleResolveReport(rep.id, 'dismissed')}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Dismiss</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              /* Comments Moderation Cards */
              <div className="space-y-3">
                {displayedComments.length === 0 ? (
                  <div className="py-12 text-center bg-white border border-dashed border-[#E8E3D9] rounded-2xl p-6">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-700">Moderation queue is clear.</p>
                    <p className="text-3xs text-slate-400">No comments matching current filter parameters.</p>
                  </div>
                ) : (
                  displayedComments.map((comm) => (
                    <div
                      key={comm.id}
                      className={`p-4 rounded-xl border transition-all ${
                        comm.status === 'pending'
                          ? 'bg-amber-50/50 border-amber-300'
                          : comm.status === 'rejected'
                          ? 'bg-rose-50/40 border-rose-300'
                          : 'bg-white border-[#E8E3D9]'
                      }`}
                    >
                      {/* Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{comm.author.name}</span>
                          <span className="px-1.5 py-0.5 rounded text-3xs font-semibold capitalize bg-slate-100 text-slate-600">
                            {comm.author.role}
                          </span>
                          <span className="text-3xs font-mono text-slate-400">{timeAgo(comm.createdAt)}</span>

                          <span className={`px-2 py-0.5 rounded text-3xs font-bold uppercase tracking-wider ${
                            comm.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : comm.status === 'rejected'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {comm.status}
                          </span>

                          {comm.reportsCount > 0 && (
                            <span className="px-2 py-0.5 rounded text-3xs font-bold bg-rose-600 text-white flex items-center gap-1">
                              <Flag className="w-2.5 h-2.5" /> {comm.reportsCount} Flagged
                            </span>
                          )}
                        </div>

                        {/* Story Identifier */}
                        <div className="flex items-center gap-1 text-2xs text-slate-500 font-mono">
                          <span>Story ID: {comm.articleId}</span>
                          {onSelectArticleById && (
                            <button
                              onClick={() => {
                                onSelectArticleById(comm.articleId);
                                onClose();
                              }}
                              className="text-[#C2410C] hover:underline flex items-center gap-0.5 ml-1 cursor-pointer"
                            >
                              <span>View Dossier</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-3 bg-white/80 rounded-lg border border-slate-200 text-xs text-slate-800 mb-3 font-sans leading-relaxed">
                        {comm.content}
                      </div>

                      {/* User Reports on this comment */}
                      {comm.reports && comm.reports.length > 0 && (
                        <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 rounded-lg space-y-1.5">
                          <span className="text-2xs font-bold text-rose-800 block">
                            Filed User Complaints ({comm.reports.length}):
                          </span>
                          {comm.reports.map((r) => (
                            <div key={r.id} className="text-2xs text-rose-700 flex items-start gap-1">
                              <span className="font-semibold uppercase tracking-wider text-3xs bg-white px-1 rounded border border-rose-200">
                                {r.reason}
                              </span>
                              <span>by {r.reporterName}: {r.details || 'No additional notes'}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Action Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/70">
                        <div className="flex items-center gap-2 text-2xs text-slate-500">
                          <span className="flex items-center gap-1 font-mono">
                            <ThumbsUp className="w-3 h-3 text-emerald-600" /> {comm.upvotes}
                          </span>
                          <span>•</span>
                          <span className="font-mono">Votes Net: {comm.upvotes - comm.downvotes}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Approve Button */}
                          <button
                            onClick={() => handleModerateStatus(comm.id, 'approved')}
                            disabled={comm.status === 'approved'}
                            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                              comm.status === 'approved'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 opacity-60'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>

                          {/* Reject / Hide Button */}
                          <button
                            onClick={() => handleModerateStatus(comm.id, 'rejected')}
                            disabled={comm.status === 'rejected'}
                            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                              comm.status === 'rejected'
                                ? 'bg-rose-50 text-rose-700 border-rose-200 opacity-60'
                                : 'bg-rose-600 hover:bg-rose-700 text-white shadow-2xs'
                            }`}
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>Reject & Hide</span>
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteComment(comm.id)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-700 border border-slate-200 transition-colors cursor-pointer"
                            title="Delete Permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-[#E8E3D9] bg-[#FAF8F5] flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Veritas Automatic Integrity Engine Active</span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer"
            >
              Close Console
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
