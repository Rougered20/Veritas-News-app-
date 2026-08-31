import React, { useState } from 'react';
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Flag,
  ShieldCheck,
  Check,
  Ban,
  Trash2,
  CornerDownRight,
  AlertCircle,
  Clock,
  Sparkles,
  Send,
  Loader2
} from 'lucide-react';
import { ArticleComment, UserRole } from '../types.js';

interface CommentItemProps {
  comment: ArticleComment;
  articleId: string;
  articleTitle?: string;
  isAdmin?: boolean;
  currentUserRole?: UserRole;
  currentUserName?: string;
  onVote: (commentId: string, voteType: 'up' | 'down') => void;
  onReply: (parentId: string, content: string) => Promise<void>;
  onReport: (comment: ArticleComment) => void;
  onModerateStatus?: (commentId: string, status: 'approved' | 'rejected' | 'pending') => void;
  onDeleteComment?: (commentId: string) => void;
  depth?: number;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  articleId,
  articleTitle,
  isAdmin = false,
  currentUserRole = 'reader',
  currentUserName = 'Anonymous Reader',
  onVote,
  onReply,
  onReport,
  onModerateStatus,
  onDeleteComment,
  depth = 0,
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [isReportsExpanded, setIsReportsExpanded] = useState(false);

  const timeAgo = (dateStr: string) => {
    const timestamp = new Date(dateStr).getTime();
    if (isNaN(timestamp)) return 'Just now';
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60 || diff < 0) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || isSubmittingReply) return;

    setIsSubmittingReply(true);
    try {
      await onReply(comment.id, replyText);
      setReplyText('');
      setIsReplying(false);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-3xs font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
            <ShieldCheck className="w-2.5 h-2.5" /> Staff Admin
          </span>
        );
      case 'moderator':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-3xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
            <ShieldCheck className="w-2.5 h-2.5" /> Moderator
          </span>
        );
      case 'journalist':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-3xs font-bold uppercase tracking-wider bg-amber-50 text-[#C2410C] border border-amber-200">
            <Sparkles className="w-2.5 h-2.5" /> Wire Correspondent
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-3xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
            Reader
          </span>
        );
    }
  };

  const netScore = comment.upvotes - comment.downvotes;

  return (
    <div
      id={`comment-card-${comment.id}`}
      className={`relative group ${
        depth > 0 ? 'ml-3 sm:ml-6 pl-3 sm:pl-4 border-l-2 border-[#E8E3D9] mt-3' : 'mt-4'
      }`}
    >
      <div
        className={`p-4 rounded-xl border transition-all ${
          comment.status === 'pending'
            ? 'bg-amber-50/40 border-amber-300'
            : comment.status === 'rejected'
            ? 'bg-rose-50/40 border-rose-300 opacity-75'
            : 'bg-white border-[#E8E3D9] hover:border-slate-300 shadow-2xs'
        }`}
      >
        {/* Comment Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex flex-wrap items-center gap-2">
            {/* User Avatar Circle */}
            <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-3xs flex items-center justify-center shrink-0">
              {comment.author.name.charAt(0).toUpperCase()}
            </div>

            <span className="text-xs font-bold text-slate-900">
              {comment.author.name}
            </span>

            {getRoleBadge(comment.author.role)}

            {comment.author.verifiedCredibility && (
              <span className="text-3xs font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-semibold" title="Veritas Reader Reliability Rating">
                {comment.author.verifiedCredibility}% Rel
              </span>
            )}

            <span className="text-slate-300">•</span>

            <span className="text-3xs text-slate-400 flex items-center gap-1 font-medium">
              <Clock className="w-2.5 h-2.5" />
              {timeAgo(comment.createdAt)}
            </span>
          </div>

          {/* Status badge for moderation */}
          <div className="flex items-center gap-1.5">
            {comment.status === 'pending' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-3xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
                <AlertCircle className="w-2.5 h-2.5" /> Pending Review
              </span>
            )}
            {comment.status === 'rejected' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-3xs font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300">
                <Ban className="w-2.5 h-2.5" /> Flagged / Hidden
              </span>
            )}
            {comment.reportsCount > 0 && (
              <button
                onClick={() => setIsReportsExpanded(prev => !prev)}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-3xs font-bold bg-rose-50 text-rose-700 border border-rose-200 cursor-pointer hover:bg-rose-100"
                title="View Filed Reports"
              >
                <Flag className="w-2.5 h-2.5" /> {comment.reportsCount} {comment.reportsCount === 1 ? 'Report' : 'Reports'}
              </button>
            )}
          </div>
        </div>

        {/* Comment Body */}
        <div className="text-xs sm:text-sm text-slate-800 leading-relaxed font-sans break-words mb-3">
          {comment.content}
        </div>

        {/* Reports detail preview if expanded (for Admin/Moderator) */}
        {isReportsExpanded && comment.reports && comment.reports.length > 0 && (
          <div className="mb-3 p-2.5 bg-rose-50/70 border border-rose-200 rounded-lg text-2xs space-y-1.5">
            <div className="font-bold text-rose-800 flex items-center justify-between">
              <span>Filed Reports ({comment.reports.length})</span>
              <button
                onClick={() => setIsReportsExpanded(false)}
                className="text-rose-600 hover:text-rose-900 cursor-pointer text-3xs underline"
              >
                Hide
              </button>
            </div>
            {comment.reports.map((rep) => (
              <div key={rep.id} className="p-2 bg-white rounded border border-rose-200 text-slate-700">
                <div className="flex items-center justify-between text-3xs text-rose-600 font-semibold mb-0.5">
                  <span className="capitalize">Violation: {rep.reason.replace('_', ' ')}</span>
                  <span>{timeAgo(rep.timestamp)}</span>
                </div>
                <div className="text-3xs text-slate-500">Reporter: {rep.reporterName}</div>
                {rep.details && <div className="text-2xs text-slate-800 mt-1 italic font-serif">"{rep.details}"</div>}
              </div>
            ))}
          </div>
        )}

        {/* Comment Action Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#F2EFE9] text-xs">
          {/* Voting Controls */}
          <div className="flex items-center gap-1">
            <button
              id={`upvote-btn-${comment.id}`}
              onClick={() => onVote(comment.id, 'up')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                comment.userVote === 'up'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-2xs'
                  : 'bg-white hover:bg-[#FAF8F5] text-slate-600 border-[#E8E3D9]'
              }`}
              title="Upvote comment"
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${comment.userVote === 'up' ? 'fill-emerald-600' : ''}`} />
              <span>{comment.upvotes}</span>
            </button>

            <button
              id={`downvote-btn-${comment.id}`}
              onClick={() => onVote(comment.id, 'down')}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                comment.userVote === 'down'
                  ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-2xs'
                  : 'bg-white hover:bg-[#FAF8F5] text-slate-500 border-[#E8E3D9]'
              }`}
              title="Downvote comment"
            >
              <ThumbsDown className={`w-3.5 h-3.5 ${comment.userVote === 'down' ? 'fill-rose-600' : ''}`} />
              {comment.downvotes > 0 && <span>{comment.downvotes}</span>}
            </button>

            <span className="text-3xs font-mono text-slate-400 px-1">
              (Net: {netScore >= 0 ? `+${netScore}` : netScore})
            </span>
          </div>

          {/* Reply, Report & Admin Moderation Controls */}
          <div className="flex items-center gap-1.5">
            <button
              id={`reply-btn-${comment.id}`}
              onClick={() => setIsReplying(prev => !prev)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-2xs font-semibold border transition-all cursor-pointer ${
                isReplying
                  ? 'bg-[#C2410C] text-white border-[#C2410C]'
                  : 'bg-white hover:bg-[#FAF8F5] text-slate-700 border-[#E8E3D9]'
              }`}
            >
              <MessageSquare className="w-3 h-3" />
              <span>Reply</span>
            </button>

            <button
              id={`report-btn-${comment.id}`}
              onClick={() => onReport(comment)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-2xs font-semibold bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-[#E8E3D9] hover:border-rose-200 transition-all cursor-pointer"
              title="Report comment to moderators"
            >
              <Flag className="w-3 h-3" />
              <span className="hidden xs:inline">Flag</span>
            </button>

            {/* Administrator Moderation Buttons */}
            {isAdmin && onModerateStatus && (
              <div className="flex items-center gap-1 pl-1 border-l border-slate-200">
                {comment.status !== 'approved' && (
                  <button
                    onClick={() => onModerateStatus(comment.id, 'approved')}
                    className="p-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-pointer"
                    title="Approve Comment"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}

                {comment.status !== 'rejected' && (
                  <button
                    onClick={() => onModerateStatus(comment.id, 'rejected')}
                    className="p-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 cursor-pointer"
                    title="Reject / Hide Comment"
                  >
                    <Ban className="w-3.5 h-3.5" />
                  </button>
                )}

                {onDeleteComment && (
                  <button
                    onClick={() => onDeleteComment(comment.id)}
                    className="p-1 rounded bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-700 border border-slate-200 cursor-pointer"
                    title="Delete Comment Permanently"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Inline Reply Composer */}
        {isReplying && (
          <form onSubmit={handleSendReply} className="mt-3 pt-3 border-t border-[#E8E3D9] space-y-2">
            <div className="flex items-center gap-1.5 text-2xs text-slate-500 font-medium">
              <CornerDownRight className="w-3 h-3 text-[#C2410C]" />
              <span>Replying as <strong className="text-slate-800">{currentUserName}</strong></span>
            </div>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Write a thoughtful reply to ${comment.author.name}...`}
              rows={2}
              autoFocus
              className="w-full px-3 py-2 text-xs border border-[#E8E3D9] rounded-xl bg-white focus:outline-none focus:border-[#C2410C] focus:ring-1 focus:ring-[#C2410C]"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsReplying(false);
                  setReplyText('');
                }}
                className="px-2.5 py-1 text-2xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!replyText.trim() || isSubmittingReply}
                className="flex items-center gap-1 px-3 py-1 text-2xs font-semibold rounded-lg bg-[#C2410C] hover:bg-[#9A3412] text-white shadow-2xs transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmittingReply ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Send className="w-3 h-3" />
                )}
                <span>Send Reply</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Recursive Render of Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              articleId={articleId}
              articleTitle={articleTitle}
              isAdmin={isAdmin}
              currentUserRole={currentUserRole}
              currentUserName={currentUserName}
              onVote={onVote}
              onReply={onReply}
              onReport={onReport}
              onModerateStatus={onModerateStatus}
              onDeleteComment={onDeleteComment}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};
