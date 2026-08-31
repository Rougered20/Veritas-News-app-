import { ArticleComment, CommentReport, UserRole, CommentStatus, ReportReason } from '../src/types.js';
import { autoCorrectText } from './gchecker.js';

class CommentEngine {
  private comments: Map<string, ArticleComment> = new Map();
  private reports: Map<string, CommentReport> = new Map();

  constructor() {
    this.seedInitialComments();
  }

  private seedInitialComments() {
    const now = Date.now();

    // 1. Comments on ISRO SCE-200 Hot Fire Test ('art-init-india-1')
    const c1: ArticleComment = {
      id: 'comm-isro-1',
      articleId: 'art-init-india-1',
      author: {
        name: 'Dr. K. S. Ramanathan',
        role: 'journalist',
        verifiedCredibility: 96,
      },
      content: 'The 120-second continuous hot fire milestone for SCE-200 is huge for Indian aerospace autonomy. Moving away from Vikas hypergolic stages to semi-cryogenic LOX/Kerosene booster pairs drastically cuts launch costs and increases payload fraction to GTO.',
      createdAt: new Date(now - 1000 * 60 * 35).toISOString(),
      upvotes: 42,
      downvotes: 1,
      status: 'approved',
      reportsCount: 0,
      reports: [],
    };

    const c1_reply1: ArticleComment = {
      id: 'comm-isro-1-rep1',
      articleId: 'art-init-india-1',
      parentId: 'comm-isro-1',
      author: {
        name: 'AeroAstro_Tech',
        role: 'reader',
        verifiedCredibility: 88,
      },
      content: 'Agreed. Furthermore, the 2000 kN sea-level thrust rating puts it in direct comparison with Russian RD-191 and US BE-4 class engines. Does the Mahendragiri stand support gimbal testing as well?',
      createdAt: new Date(now - 1000 * 60 * 20).toISOString(),
      upvotes: 18,
      downvotes: 0,
      status: 'approved',
      reportsCount: 0,
      reports: [],
    };

    const c1_reply2: ArticleComment = {
      id: 'comm-isro-1-rep2',
      articleId: 'art-init-india-1',
      parentId: 'comm-isro-1',
      author: {
        name: 'Veritas Staff Editor',
        role: 'moderator',
        verifiedCredibility: 99,
      },
      content: 'Per the authenticated ISRO technical briefing documents in our dossier, the next qualification run scheduled at IPRC includes dynamic actuator gimbaling across +/- 8 degrees pitch/yaw.',
      createdAt: new Date(now - 1000 * 60 * 12).toISOString(),
      upvotes: 29,
      downvotes: 0,
      status: 'approved',
      reportsCount: 0,
      reports: [],
    };

    const c2_flagged: ArticleComment = {
      id: 'comm-isro-flagged',
      articleId: 'art-init-india-1',
      author: {
        name: 'CryptoRocket99',
        role: 'reader',
        verifiedCredibility: 35,
      },
      content: 'Fake news! Everyone knows cryogenic engines are impossible without imported turbopumps from third parties. Join my Telegram channel t.me/moonrockets for real stock tips and leaks.',
      createdAt: new Date(now - 1000 * 60 * 15).toISOString(),
      upvotes: 1,
      downvotes: 24,
      status: 'pending',
      reportsCount: 3,
      reports: [
        {
          id: 'rep-isro-1',
          commentId: 'comm-isro-flagged',
          articleId: 'art-init-india-1',
          articleTitle: 'ISRO Validates Semi-Cryogenic Booster Stage Hot Ignition Test',
          reporterName: 'Ananya Sharma',
          reason: 'spam',
          details: 'Telegram spam link and uncorroborated financial shilling.',
          timestamp: new Date(now - 1000 * 60 * 10).toISOString(),
          status: 'pending',
        },
        {
          id: 'rep-isro-2',
          commentId: 'comm-isro-flagged',
          articleId: 'art-init-india-1',
          articleTitle: 'ISRO Validates Semi-Cryogenic Booster Stage Hot Ignition Test',
          reporterName: 'Vikram Mehta',
          reason: 'misinformation',
          details: 'Disputes verified telemetry authenticated by Ministry of Space.',
          timestamp: new Date(now - 1000 * 60 * 8).toISOString(),
          status: 'pending',
        }
      ],
    };

    // 2. Comments on Nuclear Fusion Pilot Reactor ('art-init-1')
    const c3: ArticleComment = {
      id: 'comm-fusion-1',
      articleId: 'art-init-1',
      author: {
        name: 'Prof. Elena Rostova',
        role: 'journalist',
        verifiedCredibility: 95,
      },
      content: 'Sustaining Q=1.35 for 100 seconds without disruptive ELM spikes is the strongest validation yet for high-temperature superconducting (HTS) tape magnets. The magnetic field density allows much smaller tokamak volumes.',
      createdAt: new Date(now - 1000 * 60 * 45).toISOString(),
      upvotes: 56,
      downvotes: 2,
      status: 'approved',
      reportsCount: 0,
      reports: [],
    };

    const c3_reply1: ArticleComment = {
      id: 'comm-fusion-1-rep1',
      articleId: 'art-init-1',
      parentId: 'comm-fusion-1',
      author: {
        name: 'Marcus Vance',
        role: 'reader',
        verifiedCredibility: 90,
      },
      content: 'The key factor here is continuous calorimetry arrays. Previously, some labs only measured peak diagnostic neutrons. Independent calorimetric audit confirms thermal net gain beyond diagnostic noise.',
      createdAt: new Date(now - 1000 * 60 * 25).toISOString(),
      upvotes: 21,
      downvotes: 0,
      status: 'approved',
      reportsCount: 0,
      reports: [],
    };

    const c4_flagged: ArticleComment = {
      id: 'comm-fusion-flagged',
      articleId: 'art-init-1',
      author: {
        name: 'TrollBot_42',
        role: 'reader',
        verifiedCredibility: 20,
      },
      content: 'Total hoax created by corrupt researchers to siphon grant money. Anyone believing this is an idiot.',
      createdAt: new Date(now - 1000 * 60 * 18).toISOString(),
      upvotes: 0,
      downvotes: 19,
      status: 'pending',
      reportsCount: 2,
      reports: [
        {
          id: 'rep-fusion-1',
          commentId: 'comm-fusion-flagged',
          articleId: 'art-init-1',
          articleTitle: 'Commercial Fusion Pilot Reactor Achieves Sustained Net Plasma Gain',
          reporterName: 'David Chen',
          reason: 'uncivil',
          details: 'Direct insult and aggressive harassment of scientific community.',
          timestamp: new Date(now - 1000 * 60 * 14).toISOString(),
          status: 'pending',
        }
      ],
    };

    // Store in internal maps
    const all = [c1, c1_reply1, c1_reply2, c2_flagged, c3, c3_reply1, c4_flagged];
    for (const c of all) {
      this.comments.set(c.id, c);
      if (c.reports) {
        for (const r of c.reports) {
          this.reports.set(r.id, r);
        }
      }
    }
  }

  /**
   * Fetch hierarchical threaded comments for an article
   */
  public getCommentsByArticle(
    articleId: string,
    options: { includePending?: boolean; includeRejected?: boolean } = {}
  ): ArticleComment[] {
    const list: ArticleComment[] = [];
    const childMap = new Map<string, ArticleComment[]>();

    for (const comment of this.comments.values()) {
      if (comment.articleId !== articleId) continue;

      // Filter by moderation visibility
      if (comment.status === 'rejected' && !options.includeRejected) continue;
      if (comment.status === 'pending' && !options.includePending) continue;

      const clone: ArticleComment = { ...comment, replies: [] };

      if (comment.parentId) {
        if (!childMap.has(comment.parentId)) {
          childMap.set(comment.parentId, []);
        }
        childMap.get(comment.parentId)!.push(clone);
      } else {
        list.push(clone);
      }
    }

    // Attach nested replies
    const attachReplies = (items: ArticleComment[]) => {
      for (const item of items) {
        if (childMap.has(item.id)) {
          item.replies = childMap.get(item.id)!.sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          attachReplies(item.replies);
        }
      }
    };

    attachReplies(list);

    // Sort top-level by upvotes / recency
    return list.sort((a, b) => b.upvotes - a.upvotes || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Add a new comment or reply
   */
  public addComment(
    articleId: string,
    data: {
      parentId?: string | null;
      author: {
        name: string;
        avatar?: string;
        role?: UserRole;
        verifiedCredibility?: number;
      };
      content: string;
    }
  ): ArticleComment {
    if (!data.content || typeof data.content !== 'string' || data.content.trim().length === 0) {
      throw new Error('Comment content cannot be empty.');
    }

    // Invisible GChecker clean
    const cleanedContent = autoCorrectText(data.content.trim());
    const role: UserRole = data.author?.role || 'reader';

    // Auto-detect potential toxicity / spam for moderation flag
    const containsSpam = /telegram|t\.me|whatsapp|\bfree\s+crypto\b|\bguaranteed\s+profit\b/i.test(cleanedContent);
    const initialStatus: CommentStatus = containsSpam ? 'pending' : 'approved';

    const comment: ArticleComment = {
      id: 'comm-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      articleId,
      parentId: data.parentId || null,
      author: {
        name: data.author.name ? autoCorrectText(data.author.name) : 'Anonymous Reader',
        avatar: data.author.avatar,
        role,
        verifiedCredibility: role === 'journalist' ? 95 : role === 'moderator' || role === 'admin' ? 99 : 85,
      },
      content: cleanedContent,
      createdAt: new Date().toISOString(),
      upvotes: 1, // Start with 1 upvote from author
      downvotes: 0,
      userVote: 'up',
      status: initialStatus,
      reportsCount: containsSpam ? 1 : 0,
      reports: containsSpam
        ? [
            {
              id: 'rep-auto-' + Date.now(),
              commentId: '',
              articleId,
              reporterName: 'Veritas Automated Guard',
              reason: 'spam',
              details: 'Automated filter flagged potential promotional or link spam.',
              timestamp: new Date().toISOString(),
              status: 'pending',
            }
          ]
        : [],
    };

    if (comment.reports && comment.reports.length > 0) {
      comment.reports[0].commentId = comment.id;
      this.reports.set(comment.reports[0].id, comment.reports[0]);
    }

    this.comments.set(comment.id, comment);
    return comment;
  }

  /**
   * Upvote or downvote comment
   */
  public voteComment(
    commentId: string,
    voteType: 'up' | 'down',
    currentUserVote?: 'up' | 'down' | null
  ): ArticleComment {
    const comment = this.comments.get(commentId);
    if (!comment) throw new Error('Comment not found');

    // Calculate delta based on previous user vote
    if (currentUserVote === voteType) {
      // Toggle off / neutralize
      if (voteType === 'up') comment.upvotes = Math.max(0, comment.upvotes - 1);
      if (voteType === 'down') comment.downvotes = Math.max(0, comment.downvotes - 1);
      comment.userVote = null;
    } else {
      if (currentUserVote === 'up') {
        comment.upvotes = Math.max(0, comment.upvotes - 1);
      } else if (currentUserVote === 'down') {
        comment.downvotes = Math.max(0, comment.downvotes - 1);
      }

      if (voteType === 'up') {
        comment.upvotes += 1;
        comment.userVote = 'up';
      } else if (voteType === 'down') {
        comment.downvotes += 1;
        comment.userVote = 'down';
      }
    }

    this.comments.set(commentId, comment);
    return comment;
  }

  /**
   * Report a comment for moderation
   */
  public reportComment(
    commentId: string,
    data: {
      reason: ReportReason;
      details?: string;
      reporterName: string;
      articleTitle?: string;
    }
  ): { comment: ArticleComment; report: CommentReport } {
    const comment = this.comments.get(commentId);
    if (!comment) throw new Error('Comment not found');

    const report: CommentReport = {
      id: 'rep-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      commentId,
      articleId: comment.articleId,
      articleTitle: data.articleTitle || 'Wire Dispatch',
      reporterName: data.reporterName ? autoCorrectText(data.reporterName) : 'Concerned Reader',
      reason: data.reason,
      details: data.details ? autoCorrectText(data.details) : undefined,
      timestamp: new Date().toISOString(),
      status: 'pending',
    };

    if (!comment.reports) comment.reports = [];
    comment.reports.push(report);
    comment.reportsCount = comment.reports.length;

    // If report count reaches 2 or more, or reason is hate speech / harassment, move to pending review
    if (comment.reportsCount >= 2 || data.reason === 'hate_speech' || data.reason === 'harassment') {
      comment.status = 'pending';
    }

    this.reports.set(report.id, report);
    this.comments.set(commentId, comment);

    return { comment, report };
  }

  /**
   * Admin: Get all comments with filters
   */
  public getAllCommentsForModeration(params: {
    status?: string;
    search?: string;
    reportedOnly?: boolean;
    articleId?: string;
  } = {}): { comments: ArticleComment[]; total: number; metrics: any } {
    let result = Array.from(this.comments.values());

    if (params.articleId) {
      result = result.filter(c => c.articleId === params.articleId);
    }

    if (params.status && params.status !== 'all') {
      result = result.filter(c => c.status === params.status);
    }

    if (params.reportedOnly) {
      result = result.filter(c => c.reportsCount > 0);
    }

    if (params.search && params.search.trim()) {
      const q = params.search.toLowerCase();
      result = result.filter(
        c =>
          c.content.toLowerCase().includes(q) ||
          c.author.name.toLowerCase().includes(q) ||
          (c.reports && c.reports.some(r => r.reason.toLowerCase().includes(q) || (r.details && r.details.toLowerCase().includes(q))))
      );
    }

    // Sort: Pending & highly reported first, then newest
    result.sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (b.status === 'pending' && a.status !== 'pending') return 1;
      if (b.reportsCount !== a.reportsCount) return b.reportsCount - a.reportsCount;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const metrics = this.getModerationMetrics();

    return {
      comments: result,
      total: result.length,
      metrics,
    };
  }

  /**
   * Admin: Update status of a comment (approve, reject, pending)
   */
  public updateCommentStatus(commentId: string, status: CommentStatus): ArticleComment {
    const comment = this.comments.get(commentId);
    if (!comment) throw new Error('Comment not found');

    comment.status = status;
    // If approved, mark pending reports as resolved
    if (status === 'approved' && comment.reports) {
      for (const rep of comment.reports) {
        if (rep.status === 'pending') {
          rep.status = 'dismissed';
          this.reports.set(rep.id, rep);
        }
      }
    } else if (status === 'rejected' && comment.reports) {
      for (const rep of comment.reports) {
        if (rep.status === 'pending') {
          rep.status = 'resolved';
          this.reports.set(rep.id, rep);
        }
      }
    }

    this.comments.set(commentId, comment);
    return comment;
  }

  /**
   * Admin: Delete comment permanently
   */
  public deleteComment(commentId: string): boolean {
    const comment = this.comments.get(commentId);
    if (!comment) return false;

    // Delete associated reports
    if (comment.reports) {
      for (const r of comment.reports) {
        this.reports.delete(r.id);
      }
    }

    this.comments.delete(commentId);
    return true;
  }

  /**
   * Admin: Get all reports list
   */
  public getAllReports(): CommentReport[] {
    return Array.from(this.reports.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * Admin: Resolve or dismiss report
   */
  public resolveReport(reportId: string, resolution: 'resolved' | 'dismissed'): CommentReport {
    const report = this.reports.get(reportId);
    if (!report) throw new Error('Report not found');

    report.status = resolution;
    this.reports.set(reportId, report);

    // Update parent comment report item
    const comment = this.comments.get(report.commentId);
    if (comment && comment.reports) {
      const match = comment.reports.find(r => r.id === reportId);
      if (match) match.status = resolution;
    }

    return report;
  }

  /**
   * Summary metrics for moderation dashboard
   */
  public getModerationMetrics() {
    let total = 0;
    let pending = 0;
    let approved = 0;
    let rejected = 0;
    let totalReports = 0;
    let activeReports = 0;

    for (const c of this.comments.values()) {
      total++;
      if (c.status === 'pending') pending++;
      if (c.status === 'approved') approved++;
      if (c.status === 'rejected') rejected++;
      if (c.reportsCount > 0) totalReports += c.reportsCount;
    }

    for (const r of this.reports.values()) {
      if (r.status === 'pending') activeReports++;
    }

    return {
      totalComments: total,
      pendingReview: pending,
      approvedCount: approved,
      rejectedCount: rejected,
      totalReports,
      activeReports,
    };
  }
}

export const commentEngine = new CommentEngine();
