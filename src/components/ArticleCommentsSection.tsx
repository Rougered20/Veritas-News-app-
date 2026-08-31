import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare,
  Send,
  Loader2,
  SlidersHorizontal,
  ShieldCheck,
  Sparkles,
  Info,
  User,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Clock,
  ArrowUpDown
} from 'lucide-react';
import { ArticleComment, UserRole } from '../types.js';
import { CommentItem } from './CommentItem.js';
import { ReportCommentModal } from './ReportCommentModal.js';
import { cleanTextSilently } from '../utils/gchecker.js';

interface ArticleCommentsSectionProps {
  articleId: string;
  articleTitle: string;
  isAdmin?: boolean;
  onCommentsCountChange?: (count: number) => void;
}

export const ArticleCommentsSection: React.FC<ArticleCommentsSectionProps> = ({
  articleId,
  articleTitle,
  isAdmin = false,
  onCommentsCountChange,
}) => {
  const [comments, setComments] = useState<ArticleComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New comment state
  const [newCommentText, setNewCommentText] = useState('');
  const [authorName, setAuthorName] = useState(() => localStorage.getItem('veritas_user_name') || 'Independent Reader');
  const [authorRole, setAuthorRole] = useState<UserRole>('reader');
  const [isPosting, setIsPosting] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);

  // Sorting
  const [sortBy, setSortBy] = useState<'top' | 'newest' | 'replies'>('top');

  // Reporting modal
  const [reportingComment, setReportingComment] = useState<ArticleComment | null>(null);

  // Fetch comments
  const fetchComments = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/articles/${articleId}/comments?admin=${isAdmin}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load comments');
      setComments(data.comments || []);
      if (onCommentsCountChange) {
        // Count total comments including replies
        const countTotal = (items: ArticleComment[]): number => {
          return items.reduce((acc, item) => acc + 1 + (item.replies ? countTotal(item.replies) : 0), 0);
        };
        onCommentsCountChange(countTotal(data.comments || []));
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching comments');
    } finally {
      setIsLoading(false);
    }
  }, [articleId, isAdmin, onCommentsCountChange]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Handle post new comment
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || isPosting) return;

    // Invisible GChecker clean
    const cleaned = cleanTextSilently(newCommentText.trim());
    setIsPosting(true);
    setError(null);

    // Save author name preference
    localStorage.setItem('veritas_user_name', authorName);

    try {
      const res = await fetch(`/api/articles/${articleId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: cleaned,
          author: {
            name: authorName.trim() || 'Anonymous Reader',
            role: authorRole,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to post comment');
      }

      setNewCommentText('');
      setPostSuccess(true);
      setTimeout(() => setPostSuccess(false), 3000);
      await fetchComments();
    } catch (err: any) {
      setError(err.message || 'Failed to submit comment');
    } finally {
      setIsPosting(false);
    }
  };

  // Handle Reply
  const handleReply = async (parentId: string, content: string) => {
    const cleaned = cleanTextSilently(content.trim());
    const res = await fetch(`/api/articles/${articleId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        parentId,
        content: cleaned,
        author: {
          name: authorName.trim() || 'Anonymous Reader',
          role: authorRole,
        },
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to post reply');
    }

    await fetchComments();
  };

  // Handle Vote
  const handleVote = async (commentId: string, voteType: 'up' | 'down') => {
    // Optimistic UI update helper
    const updateVoteInTree = (list: ArticleComment[]): ArticleComment[] => {
      return list.map(c => {
        if (c.id === commentId) {
          const currentVote = c.userVote;
          let newUp = c.upvotes;
          let newDown = c.downvotes;
          let newVote: 'up' | 'down' | null = null;

          if (currentVote === voteType) {
            if (voteType === 'up') newUp = Math.max(0, newUp - 1);
            if (voteType === 'down') newDown = Math.max(0, newDown - 1);
            newVote = null;
          } else {
            if (currentVote === 'up') newUp = Math.max(0, newUp - 1);
            if (currentVote === 'down') newDown = Math.max(0, newDown - 1);

            if (voteType === 'up') {
              newUp += 1;
              newVote = 'up';
            } else {
              newDown += 1;
              newVote = 'down';
            }
          }

          return {
            ...c,
            upvotes: newUp,
            downvotes: newDown,
            userVote: newVote,
          };
        }
        if (c.replies && c.replies.length > 0) {
          return { ...c, replies: updateVoteInTree(c.replies) };
        }
        return c;
      });
    };

    setComments(prev => updateVoteInTree(prev));

    try {
      await fetch(`/api/comments/${commentId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType }),
      });
    } catch (err) {
      console.error('Vote failed', err);
      // Revert if error
      fetchComments();
    }
  };

  // Handle Moderator Status Change
  const handleModerateStatus = async (commentId: string, status: 'approved' | 'rejected' | 'pending') => {
    try {
      const res = await fetch(`/api/admin/comments/${commentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        await fetchComments();
      }
    } catch (err) {
      console.error('Moderate status change failed', err);
    }
  };

  // Handle Delete Comment
  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Permanently delete this comment?')) return;
    try {
      const res = await fetch(`/api/admin/comments/${commentId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchComments();
      }
    } catch (err) {
      console.error('Delete comment failed', err);
    }
  };

  // Sorting
  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === 'top') {
      return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
    }
    if (sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === 'replies') {
      return (b.replies?.length || 0) - (a.replies?.length || 0);
    }
    return 0;
  });

  return (
    <div className="space-y-6">
      {/* Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E3D9]">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-[#C2410C]/10 flex items-center justify-center text-[#C2410C]">
            <MessageSquare className="w-4 h-4" />
          </span>
          <h3 className="text-sm font-bold text-slate-900">
            Citizen & Correspondent Discussions
          </h3>
          <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-[#FAF8F5] text-slate-700 border border-[#E8E3D9]">
            {comments.length}
          </span>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-lg border border-[#E8E3D9] text-xs">
            <button
              onClick={() => setSortBy('top')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                sortBy === 'top'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Flame className="w-3 h-3 text-amber-500" />
              <span>Top</span>
            </button>
            <button
              onClick={() => setSortBy('newest')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                sortBy === 'newest'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3 h-3 text-slate-500" />
              <span>Newest</span>
            </button>
            <button
              onClick={() => setSortBy('replies')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                sortBy === 'replies'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-3 h-3 text-blue-500" />
              <span>Threads</span>
            </button>
          </div>
        </div>
      </div>

      {/* Community Standard Banner */}
      <div className="p-3 bg-[#FAF8F5] border border-[#E8E3D9] rounded-xl flex items-start gap-2.5 text-2xs text-slate-600">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-800">Veritas Editorial Discourse Policy: </span>
          Comments are subjected to automatic sanity audit. Please cite verified data, maintain civil debate, and refrain from commercial promotions.
        </div>
      </div>

      {/* Post New Comment Composer */}
      <form
        onSubmit={handlePostComment}
        className="p-4 bg-white border border-[#E8E3D9] rounded-xl shadow-2xs space-y-3"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xs font-bold uppercase tracking-wider text-slate-500">
              Posting As:
            </span>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Your Name / Handle"
              className="px-2.5 py-1 text-xs font-semibold text-slate-900 border border-[#E8E3D9] rounded-lg bg-[#FAF8F5] focus:outline-none focus:border-[#C2410C]"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-2xs text-slate-400">Role:</span>
            <select
              value={authorRole}
              onChange={(e) => setAuthorRole(e.target.value as UserRole)}
              className="px-2 py-1 text-2xs font-semibold bg-[#FAF8F5] border border-[#E8E3D9] rounded-lg text-slate-700 focus:outline-none"
            >
              <option value="reader">Reader</option>
              <option value="journalist">Wire Correspondent</option>
              {isAdmin && <option value="moderator">Staff Moderator</option>}
              {isAdmin && <option value="admin">Staff Admin</option>}
            </select>
          </div>
        </div>

        <textarea
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
          placeholder="Share your corroborated perspective, technical analysis, or question on this dispatch..."
          rows={3}
          className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-[#E8E3D9] rounded-xl bg-[#FAF8F5] focus:bg-white focus:outline-none focus:border-[#C2410C] focus:ring-1 focus:ring-[#C2410C] transition-all"
        />

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <span className="text-3xs text-slate-400 font-mono">
            {newCommentText.length} characters • Markdown enabled
          </span>

          <div className="flex items-center gap-2">
            {postSuccess && (
              <span className="inline-flex items-center gap-1 text-2xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" /> Comment Published!
              </span>
            )}

            <button
              type="submit"
              disabled={!newCommentText.trim() || isPosting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-[#C2410C] text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPosting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Auditing & Publishing...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Post Perspective</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Error display */}
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-6 h-6 text-[#C2410C] animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Fetching verified discussions...</p>
        </div>
      ) : sortedComments.length === 0 ? (
        /* Empty State */
        <div className="py-12 text-center bg-[#FAF8F5] border border-dashed border-[#E8E3D9] rounded-2xl p-6 space-y-2">
          <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            No Discussion Yet
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Be the first citizen or correspondent to contribute an analytical perspective or inquiry on this story.
          </p>
        </div>
      ) : (
        /* Comment list */
        <div className="space-y-3">
          {sortedComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              articleId={articleId}
              articleTitle={articleTitle}
              isAdmin={isAdmin}
              currentUserRole={authorRole}
              currentUserName={authorName}
              onVote={handleVote}
              onReply={handleReply}
              onReport={(c) => setReportingComment(c)}
              onModerateStatus={handleModerateStatus}
              onDeleteComment={handleDeleteComment}
            />
          ))}
        </div>
      )}

      {/* Report Modal */}
      {reportingComment && (
        <ReportCommentModal
          comment={reportingComment}
          articleTitle={articleTitle}
          onClose={() => setReportingComment(null)}
          onReportSubmitted={() => {
            fetchComments();
          }}
        />
      )}
    </div>
  );
};
