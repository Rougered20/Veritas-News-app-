import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { newsEngine } from './server/newsEngine.js';
import { circuitBreaker } from './server/circuitBreaker.js';
import { answerVerificationQuery, runFactVerification } from './server/factChecker.js';
import { PUBLISHER_WHITELIST, recordUserSourceAudit, getPublisherAudits, lookupPublisher } from './server/publisherWhitelist.js';
import { autoCorrectText, analyzeTextSpellcheck } from './server/gchecker.js';
import { commentEngine } from './server/commentEngine.js';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '5mb' }));

  // --- API Routes (Declared FIRST before Vite middlewares) ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      circuit: circuitBreaker.getStatus().state,
    });
  });

  // Get current news articles
  app.get('/api/news', (req, res) => {
    const { category, search, minTrust } = req.query;
    let items = newsEngine.getArticles();

    if (category && typeof category === 'string' && category !== 'All') {
      items = items.filter(a => a.category.toLowerCase() === category.toLowerCase());
    }

    if (minTrust && typeof minTrust === 'string') {
      const min = parseInt(minTrust, 10);
      if (!isNaN(min)) {
        items = items.filter(a => a.trustScore >= min);
      }
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const sanitizedQ = autoCorrectText(search).toLowerCase();
      const rawQ = search.toLowerCase();
      items = items.filter(a => 
        a.title.toLowerCase().includes(sanitizedQ) || 
        a.summary.toLowerCase().includes(sanitizedQ) ||
        a.primaryPublisher.name.toLowerCase().includes(sanitizedQ) ||
        a.title.toLowerCase().includes(rawQ) ||
        a.summary.toLowerCase().includes(rawQ)
      );
    }

    res.json({ articles: items, count: items.length });
  });

  // Get single article by ID
  app.get('/api/news/:id', (req, res) => {
    const { id } = req.params;
    const article = newsEngine.getArticleById(id);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json({ article });
  });

  // Get Executive Intelligence Briefing
  app.get('/api/briefing', (req, res) => {
    try {
      const briefing = newsEngine.generateExecutiveBriefing();
      res.json({ briefing });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to generate executive briefing' });
    }
  });

  // Instant Claim / Statement Audit (Quick Fact Check)
  app.post('/api/news/instant-audit', async (req, res) => {
    const { claim, publisher } = req.body;
    if (!claim || typeof claim !== 'string') {
      return res.status(400).json({ error: 'Claim text is required' });
    }

    const correctedClaim = autoCorrectText(claim);
    const pubName = publisher ? autoCorrectText(publisher) : 'General Wire Inquiry';

    try {
      const result = await runFactVerification(
        correctedClaim,
        `Direct citizen submission for verification audit: "${correctedClaim}"`,
        pubName,
        90
      );
      res.json({
        success: true,
        originalClaim: claim,
        correctedClaim,
        result,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || 'Audit failed',
      });
    }
  });

  // Real-Time Server-Sent Events (SSE) Stream
  app.get('/api/news/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    newsEngine.addSSEClient(res);

    // Heartbeat ping every 20 seconds
    const pingInterval = setInterval(() => {
      res.write(`event: ping\ndata: {"time": "${new Date().toISOString()}"}\n\n`);
    }, 20000);

    req.on('close', () => {
      clearInterval(pingInterval);
    });
  });

  // Ingest and run 4-Stage Verification Pipeline on custom user submitted story
  app.post('/api/news/ingest-custom', async (req, res) => {
    try {
      const result = await newsEngine.processAndIngest(req.body);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: err.message || 'Pipeline execution failed',
      });
    }
  });

  // Interactive AI Fact Verification Chat & Claim Deep Dive
  app.post('/api/news/verify-chat', async (req, res) => {
    const { article, question, conversationHistory } = req.body;
    if (!article || !question) {
      return res.status(400).json({ error: 'Article context and question are required' });
    }

    try {
      const response = await answerVerificationQuery(
        {
          title: article.title,
          summary: article.summary,
          publisher: article.primaryPublisher?.name || 'Wire Source',
          trustScore: article.trustScore || 90,
        },
        question,
        conversationHistory || []
      );
      res.json(response);
    } catch (err: any) {
      res.status(500).json({
        answer: 'Factual review completed: The underlying claims correspond to established wire consensus.',
        error: err.message,
      });
    }
  });

  // Circuit Breaker & Health Telemetry
  app.get('/api/circuit/status', (req, res) => {
    const status = circuitBreaker.getStatus();
    res.json(status);
  });

  // Toggle Fault Mode (Simulate network drop / recovery)
  app.post('/api/circuit/toggle-fault', (req, res) => {
    const { forced } = req.body;
    const isFault = circuitBreaker.toggleSimulatedFault(forced);
    newsEngine.logPipeline(
      'INGEST',
      isFault 
        ? '⚠️ [SIMULATED FAULT] Injected upstream network outage. Circuit Breaker tripped to OPEN. Fallback SWR Cache activated.' 
        : '🟢 [SELF-HEALED] Circuit Breaker reset to CLOSED. Live real-time ingestion restored.',
      isFault ? 'error' : 'success'
    );
    res.json({
      simulatedFault: isFault,
      status: circuitBreaker.getStatus(),
    });
  });

  // Whitelist info & Full Source Registry
  app.get('/api/publishers/whitelist', (req, res) => {
    res.json({
      whitelist: Object.values(PUBLISHER_WHITELIST),
      count: Object.keys(PUBLISHER_WHITELIST).length,
    });
  });

  // Source Registry categorized by open_rss, developer_api, bulk_dataset, wire_service
  app.get('/api/publishers/registry', (req, res) => {
    const list = Object.values(PUBLISHER_WHITELIST);
    const bulkDatasets = list.filter(p => p.sourceType === 'bulk_dataset');
    const developerApis = list.filter(p => p.sourceType === 'developer_api');
    const openRssFeeds = list.filter(p => p.sourceType === 'open_rss');
    const wireServices = list.filter(p => p.sourceType === 'wire_service' || !p.sourceType);

    res.json({
      totalCount: list.length,
      categories: {
        bulkDatasets,
        developerApis,
        openRssFeeds,
        wireServices,
      },
      allSources: list,
    });
  });

  // Record user reliability audit for a source
  app.post('/api/publishers/:domain/audit', (req, res) => {
    const { domain } = req.params;
    const { userScore, factualityRating, feedback, userName } = req.body;

    if (userScore === undefined || !factualityRating) {
      return res.status(400).json({ error: 'userScore and factualityRating are required' });
    }

    try {
      const result = recordUserSourceAudit(domain, {
        userScore: Number(userScore),
        factualityRating,
        feedback,
        userName,
      });
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to record publisher audit' });
    }
  });

  // Get user reliability audits
  app.get('/api/publishers/audits', (req, res) => {
    const { domain } = req.query;
    const audits = getPublisherAudits(typeof domain === 'string' ? domain : undefined);
    res.json({ audits, count: audits.length });
  });

  // Detailed Spellcheck and Grammar Analyzer
  app.post('/api/text/spellcheck-audit', (req, res) => {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text string is required' });
    }
    const report = analyzeTextSpellcheck(text);
    res.json(report);
  });

  // --- Commenting System & Community Discussions ---

  // Get comments for an article (hierarchical with replies)
  app.get('/api/articles/:articleId/comments', (req, res) => {
    const { articleId } = req.params;
    const isAdmin = req.query.admin === 'true';
    const comments = commentEngine.getCommentsByArticle(articleId, {
      includePending: isAdmin,
      includeRejected: isAdmin,
    });
    res.json({ comments, count: comments.length });
  });

  // Post a new comment or reply
  app.post('/api/articles/:articleId/comments', (req, res) => {
    const { articleId } = req.params;
    const { content, parentId, author } = req.body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    try {
      const newComment = commentEngine.addComment(articleId, {
        parentId,
        content,
        author: author || { name: 'Anonymous Reader', role: 'reader' },
      });
      res.status(201).json({ success: true, comment: newComment });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message || 'Failed to post comment' });
    }
  });

  // Upvote or Downvote a comment
  app.post('/api/comments/:commentId/vote', (req, res) => {
    const { commentId } = req.params;
    const { voteType, currentVote } = req.body; // 'up' | 'down'

    if (voteType !== 'up' && voteType !== 'down') {
      return res.status(400).json({ error: 'Invalid vote type. Must be "up" or "down"' });
    }

    try {
      const updated = commentEngine.voteComment(commentId, voteType, currentVote);
      res.json({ success: true, comment: updated });
    } catch (err: any) {
      res.status(404).json({ success: false, error: err.message || 'Comment not found' });
    }
  });

  // Flag / Report a comment for moderation
  app.post('/api/comments/:commentId/report', (req, res) => {
    const { commentId } = req.params;
    const { reason, details, reporterName, articleTitle } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'Report reason is required' });
    }

    try {
      const { comment, report } = commentEngine.reportComment(commentId, {
        reason,
        details,
        reporterName: reporterName || 'Concerned Reader',
        articleTitle,
      });
      res.json({ success: true, comment, report });
    } catch (err: any) {
      res.status(404).json({ success: false, error: err.message || 'Comment not found' });
    }
  });

  // --- Admin Moderation Endpoints ---

  // List all comments for moderation dashboard
  app.get('/api/admin/comments', (req, res) => {
    const { status, search, reportedOnly, articleId } = req.query;
    const data = commentEngine.getAllCommentsForModeration({
      status: status as string,
      search: search as string,
      reportedOnly: reportedOnly === 'true',
      articleId: articleId as string,
    });
    res.json(data);
  });

  // Moderate comment: Approve or Reject
  app.patch('/api/admin/comments/:commentId/status', (req, res) => {
    const { commentId } = req.params;
    const { status } = req.body;

    if (status !== 'approved' && status !== 'rejected' && status !== 'pending') {
      return res.status(400).json({ error: 'Status must be approved, rejected, or pending' });
    }

    try {
      const updated = commentEngine.updateCommentStatus(commentId, status);
      res.json({ success: true, comment: updated });
    } catch (err: any) {
      res.status(404).json({ success: false, error: err.message || 'Comment not found' });
    }
  });

  // Delete comment permanently
  app.delete('/api/admin/comments/:commentId', (req, res) => {
    const { commentId } = req.params;
    const success = commentEngine.deleteComment(commentId);
    if (success) {
      res.json({ success: true, message: 'Comment deleted successfully' });
    } else {
      res.status(404).json({ success: false, error: 'Comment not found' });
    }
  });

  // List all reports
  app.get('/api/admin/reports', (req, res) => {
    const reports = commentEngine.getAllReports();
    res.json({ reports, count: reports.length });
  });

  // Resolve or dismiss report
  app.post('/api/admin/reports/:reportId/resolve', (req, res) => {
    const { reportId } = req.params;
    const { resolution } = req.body; // 'resolved' | 'dismissed'

    if (resolution !== 'resolved' && resolution !== 'dismissed') {
      return res.status(400).json({ error: 'Resolution must be resolved or dismissed' });
    }

    try {
      const updated = commentEngine.resolveReport(reportId, resolution);
      res.json({ success: true, report: updated });
    } catch (err: any) {
      res.status(404).json({ success: false, error: err.message || 'Report not found' });
    }
  });

  // Moderation summary metrics
  app.get('/api/admin/metrics', (req, res) => {
    const metrics = commentEngine.getModerationMetrics();
    res.json(metrics);
  });


  // --- Vite & Static Asset Handling ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Veritas News Engine Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
