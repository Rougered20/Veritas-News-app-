export type VerificationStatus =
  | 'VERIFIED_HIGH_CONFIDENCE'
  | 'VERIFIED_MULTI_SOURCE'
  | 'DEVELOPING_CAUTION'
  | 'DISPUTED_OR_UNVERIFIED';

export type ClickbaitRating = 'LOW' | 'MODERATE' | 'HIGH';

export interface VerifiedClaim {
  claim: string;
  status: 'VERIFIED' | 'CONTEXT_NEEDED' | 'UNVERIFIED' | 'DISPUTED';
  evidence: string;
  corroboratingSource?: string;
}

export interface VerificationBreakdown {
  domainAuthority: number; // 0 - 100
  sourceCorroboration: number; // 0 - 100
  factualConsistency: number; // 0 - 100
  neutralTone: number; // 0 - 100
}

export interface CorroboratingSourceNode {
  publisher: string;
  tier: 1 | 2 | 3;
  domainScore: number;
  reportedTime: string;
  headlineMatch: string;
  url?: string;
  independent: boolean;
}

export type NewsRegion = 'all' | 'india' | 'international';

export interface DiscrepancyDiffItem {
  id: string;
  topic: string;
  divergenceType: 'FIGURES_AND_CASUALTIES' | 'TIMELINE_OR_EVENT_ORDER' | 'OFFICIAL_ATTRIBUTION' | 'POLITICAL_FRAMING';
  severity: 'HIGH_DISCREPANCY' | 'MODERATE_VARIANCE' | 'SUBTLE_NUANCE';
  outletA: {
    name: string;
    claim: string;
    tier: number;
  };
  outletB: {
    name: string;
    claim: string;
    tier: number;
  };
  consensusVerdict: string;
}

export interface TriFactorProvenance {
  sourceAuthority: {
    score: number; // 0-100
    tier: number;
    rating: string;
    domainReputation: number;
    notes: string;
  };
  crossCorroboration: {
    score: number; // 0-100
    independentOutletsCount: number;
    consensusDegree: 'HIGH_CONSENSUS' | 'PARTIAL_CONSENSUS' | 'SINGLE_SOURCE_EXCLUSIVE';
    notes: string;
  };
  primaryGrounding: {
    score: number; // 0-100
    hasOfficialTranscripts: boolean;
    hasDirectQuotes: boolean;
    hasCourtOrGovDocuments: boolean;
    notes: string;
  };
}

export interface ExecutiveBriefing {
  id: string;
  generatedAt: string;
  title: string;
  executiveSummary: string;
  globalKeyThemes: Array<{
    theme: string;
    urgency: 'CRITICAL' | 'ELEVATED' | 'ROUTINE';
    summary: string;
    impactSector: string;
  }>;
  topVerifiedStories: Array<{
    id: string;
    title: string;
    category: string;
    publisher: string;
    trustScore: number;
    oneLineTakeaway: string;
  }>;
  discrepancyAlerts: DiscrepancyDiffItem[];
  riskRadar: Array<{
    area: string;
    riskLevel: 'HIGH' | 'MODERATE' | 'LOW';
    outlook: string;
  }>;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  fullContent?: string;
  category: 'World' | 'Technology' | 'Economy' | 'Science' | 'Climate' | 'Geopolitics';
  region?: 'india' | 'international';
  primaryPublisher: {
    name: string;
    domain: string;
    tier: 1 | 2 | 3;
    reputationScore: number;
    sourceType?: 'bulk_dataset' | 'developer_api' | 'open_rss' | 'wire_service';
    userTrustRating?: number;
  };
  publishedAt: string;
  readTime: string;
  imageUrl?: string;
  
  // Structured Narrative Breakdown (Upscaled Master Prompt Format)
  structuredStory?: {
    whatHappened: string;
    keyContext: string;
    whatsNext: string;
    verifiedSources?: Array<{ name: string; url: string; outletTier?: number }>;
  };
  
  // Verification Engine Metrics
  trustScore: number; // 0 - 100
  verdict: VerificationStatus;
  clickbaitRating: ClickbaitRating;
  breakdown: VerificationBreakdown;
  claims: VerifiedClaim[];
  corroboratingSources: CorroboratingSourceNode[];
  
  // Advanced Discrepancy & Tri-Factor Metrics
  discrepancies?: DiscrepancyDiffItem[];
  triFactor?: TriFactorProvenance;

  biasAnalysis: {
    politicalLean: 'Neutral / Objective' | 'Center-Left' | 'Center-Right' | 'Disputed Bias';
    sensationalismIndex: number; // 0 - 100 (lower is better)
    logicalConsistencyRating: number; // 0 - 100
  };
  groundingSources?: Array<{ title: string; url: string }>;
  verifiedAt: string;
  isBreaking?: boolean;
}

export interface CircuitHealthStatus {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failuresCount: number;
  failureThreshold: number;
  lastFailureTime: string | null;
  lastSuccessTime: string;
  latencyMs: number;
  cacheStatus: 'ACTIVE_LIVE' | 'STALE_CACHE_FALLBACK' | 'DEGRADED';
  activeSSEClients: number;
  sanitizationPassRate: number;
  totalArticlesProcessed: number;
  whitelistedPublishersCount: number;
  pipelineStages: {
    ingestion: 'HEALTHY' | 'DEGRADED' | 'FAILED';
    factCheckLLM: 'HEALTHY' | 'DEGRADED' | 'FAILED';
    crossReferencing: 'HEALTHY' | 'DEGRADED' | 'FAILED';
    sseBroadcaster: 'HEALTHY' | 'DEGRADED' | 'FAILED';
  };
}

export interface IngestionPipelineLog {
  id: string;
  timestamp: string;
  stage: 'INGEST' | 'SOURCE_AUDIT' | 'CROSS_REF' | 'LLM_VERIFY' | 'SANITIZE_EMIT';
  message: string;
  level: 'info' | 'success' | 'warn' | 'error';
  articleTitle?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  groundingSources?: Array<{ title: string; url: string }>;
}

export type UserRole = 'reader' | 'journalist' | 'moderator' | 'admin';

export type CommentStatus = 'approved' | 'pending' | 'rejected';

export type ReportReason =
  | 'misinformation'
  | 'harassment'
  | 'hate_speech'
  | 'spam'
  | 'uncivil'
  | 'other';

export interface CommentReport {
  id: string;
  commentId: string;
  articleId: string;
  articleTitle?: string;
  reporterName: string;
  reason: ReportReason;
  details?: string;
  timestamp: string;
  status: 'pending' | 'resolved' | 'dismissed';
}

export interface ArticleComment {
  id: string;
  articleId: string;
  parentId?: string | null;
  author: {
    name: string;
    avatar?: string;
    role: UserRole;
    verifiedCredibility?: number; // 0-100
  };
  content: string;
  createdAt: string;
  upvotes: number;
  downvotes: number;
  userVote?: 'up' | 'down' | null;
  status: CommentStatus;
  reportsCount: number;
  reports?: CommentReport[];
  replies?: ArticleComment[];
}

export interface PublisherProfile {
  name: string;
  domain: string;
  tier: 1 | 2 | 3;
  reputationScore: number;
  biasRating: 'Neutral' | 'Center-Left' | 'Center-Right';
  factualityRecord: 'Very High' | 'High' | 'Moderate';
  description: string;
  sourceType?: 'bulk_dataset' | 'developer_api' | 'open_rss' | 'wire_service';
  endpointUrl?: string;
  userTrustRating?: number;
  userVotesCount?: number;
}

export interface UserSourceAudit {
  id: string;
  domain: string;
  publisherName: string;
  userScore: number; // 0 - 100
  factualityRating: 'Very High' | 'High' | 'Moderate' | 'Unreliable';
  feedback?: string;
  userName: string;
  timestamp: string;
}

export interface SourceRegistryData {
  totalCount: number;
  categories: {
    bulkDatasets: PublisherProfile[];
    developerApis: PublisherProfile[];
    openRssFeeds: PublisherProfile[];
    wireServices: PublisherProfile[];
  };
  allSources: PublisherProfile[];
}


