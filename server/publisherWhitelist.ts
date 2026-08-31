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

export const PUBLISHER_WHITELIST: Record<string, PublisherProfile> = {
  // --- Public Bulk Archives & Datasets ---
  'commoncrawl.org': {
    name: 'Common Crawl News Archive',
    domain: 'commoncrawl.org',
    tier: 1,
    reputationScore: 97,
    biasRating: 'Neutral',
    factualityRecord: 'Very High',
    description: 'Open, petabyte-scale web crawl news archive documenting raw historical dispatches and multi-lingual news streams.',
    sourceType: 'bulk_dataset',
    endpointUrl: 'https://data.commoncrawl.org/crawl-data/CC-NEWS/',
    userTrustRating: 96,
    userVotesCount: 342,
  },
  'gdeltproject.org': {
    name: 'GDELT Project (Global Knowledge Graph)',
    domain: 'gdeltproject.org',
    tier: 1,
    reputationScore: 98,
    biasRating: 'Neutral',
    factualityRecord: 'Very High',
    description: 'Global Database of Events, Language, and Tone indexing worldwide broadcast, print, and web news with translingual event telemetry.',
    sourceType: 'bulk_dataset',
    endpointUrl: 'https://api.gdeltproject.org/api/v2/doc/doc',
    userTrustRating: 97,
    userVotesCount: 512,
  },
  'wikinews.org': {
    name: 'Wikinews Open Platform',
    domain: 'wikinews.org',
    tier: 2,
    reputationScore: 91,
    biasRating: 'Neutral',
    factualityRecord: 'Very High',
    description: 'Wikimedia Foundation peer-reviewed open news source operating under strict neutral point-of-view (NPOV) consensus.',
    sourceType: 'bulk_dataset',
    endpointUrl: 'https://en.wikinews.org/w/api.php',
    userTrustRating: 92,
    userVotesCount: 280,
  },

  // --- Free Developer APIs ---
  'newsapi.org': {
    name: 'NewsAPI.org Stream',
    domain: 'newsapi.org',
    tier: 2,
    reputationScore: 90,
    biasRating: 'Neutral',
    factualityRecord: 'High',
    description: 'Developer news aggregation platform delivering structured JSON streams from 80,000 worldwide publications.',
    sourceType: 'developer_api',
    endpointUrl: 'https://newsapi.org/v2/top-headlines',
    userTrustRating: 91,
    userVotesCount: 420,
  },
  'theguardian.com': {
    name: 'The Guardian Open Platform',
    domain: 'theguardian.com',
    tier: 2,
    reputationScore: 92,
    biasRating: 'Center-Left',
    factualityRecord: 'High',
    description: 'Open API providing complete searchable archives and real-time dispatches from The Guardian newsroom.',
    sourceType: 'developer_api',
    endpointUrl: 'https://content.guardianapis.com/search',
    userTrustRating: 90,
    userVotesCount: 389,
  },
  'gnews.io': {
    name: 'GNews API Global Stream',
    domain: 'gnews.io',
    tier: 2,
    reputationScore: 89,
    biasRating: 'Neutral',
    factualityRecord: 'High',
    description: 'Fast, lightweight international news API streaming categorized headlines with country and language filters.',
    sourceType: 'developer_api',
    endpointUrl: 'https://gnews.io/api/v4/top-headlines',
    userTrustRating: 88,
    userVotesCount: 195,
  },
  'currentsapi.services': {
    name: 'Currents API Real-Time Wire',
    domain: 'currentsapi.services',
    tier: 2,
    reputationScore: 88,
    biasRating: 'Neutral',
    factualityRecord: 'High',
    description: 'Real-time multi-lingual news API aggregating verified dispatches across continuous global topics.',
    sourceType: 'developer_api',
    endpointUrl: 'https://api.currentsapi.services/v1/latest-news',
    userTrustRating: 87,
    userVotesCount: 154,
  },
  'newsdata.io': {
    name: 'NewsData.io Global Feed',
    domain: 'newsdata.io',
    tier: 2,
    reputationScore: 89,
    biasRating: 'Neutral',
    factualityRecord: 'High',
    description: 'Global news ingestion engine indexing real-time articles, archives, and regional breaking alerts.',
    sourceType: 'developer_api',
    endpointUrl: 'https://newsdata.io/api/1/news',
    userTrustRating: 89,
    userVotesCount: 210,
  },

  // --- Public Outlets with Open RSS Feeds ---
  'bbc.com': {
    name: 'BBC News Open RSS',
    domain: 'bbc.com',
    tier: 1,
    reputationScore: 96,
    biasRating: 'Neutral',
    factualityRecord: 'Very High',
    description: 'Public service broadcaster adhering to strict impartiality and dual-sourcing requirements via syndicated XML feeds.',
    sourceType: 'open_rss',
    endpointUrl: 'http://feeds.bbci.co.uk/news/rss.xml',
    userTrustRating: 95,
    userVotesCount: 850,
  },
  'npr.org': {
    name: 'NPR (National Public Radio)',
    domain: 'npr.org',
    tier: 1,
    reputationScore: 95,
    biasRating: 'Neutral',
    factualityRecord: 'Very High',
    description: 'US public radio syndicate providing rigorously audited investigative, domestic, and international news feeds.',
    sourceType: 'open_rss',
    endpointUrl: 'https://feeds.npr.org/1001/rss.xml',
    userTrustRating: 94,
    userVotesCount: 620,
  },
  'pbs.org': {
    name: 'PBS NewsHour Open Feed',
    domain: 'pbs.org',
    tier: 1,
    reputationScore: 97,
    biasRating: 'Neutral',
    factualityRecord: 'Very High',
    description: 'Award-winning public broadcasting journal recognized for high-standard factual integrity and depth.',
    sourceType: 'open_rss',
    endpointUrl: 'https://www.pbs.org/newshour/feeds/rss/headlines',
    userTrustRating: 97,
    userVotesCount: 540,
  },
  'reuters.com': {
    name: 'Reuters Global Wire',
    domain: 'reuters.com',
    tier: 1,
    reputationScore: 98,
    biasRating: 'Neutral',
    factualityRecord: 'Very High',
    description: 'International wire service and financial market data provider with rigorous editorial verification.',
    sourceType: 'open_rss',
    endpointUrl: 'https://www.reutersagency.com/feed/?best-topics=world',
    userTrustRating: 98,
    userVotesCount: 1120,
  },
  'cnn.com': {
    name: 'CNN Live RSS',
    domain: 'cnn.com',
    tier: 2,
    reputationScore: 89,
    biasRating: 'Center-Left',
    factualityRecord: 'High',
    description: 'Global 24-hour cable news network broadcasting real-time world events and breaking alerts.',
    sourceType: 'open_rss',
    endpointUrl: 'http://rss.cnn.com/rss/edition.rss',
    userTrustRating: 86,
    userVotesCount: 780,
  },

  // --- Additional Premier Wires & Indian National Wires ---
  'apnews.com': {
    name: 'Associated Press (AP)',
    domain: 'apnews.com',
    tier: 1,
    reputationScore: 98,
    biasRating: 'Neutral',
    factualityRecord: 'Very High',
    description: 'Primary global news agency supplying verified reporting to thousands of international outlets.',
    sourceType: 'wire_service',
    userTrustRating: 97,
    userVotesCount: 940,
  },
  'bloomberg.com': {
    name: 'Bloomberg News',
    domain: 'bloomberg.com',
    tier: 1,
    reputationScore: 95,
    biasRating: 'Neutral',
    factualityRecord: 'Very High',
    description: 'Global business and financial journalism with stringent data validation standards.',
    sourceType: 'wire_service',
    userTrustRating: 95,
    userVotesCount: 680,
  },
  'ft.com': {
    name: 'Financial Times',
    domain: 'ft.com',
    tier: 1,
    reputationScore: 95,
    biasRating: 'Neutral',
    factualityRecord: 'Very High',
    description: 'International daily newspaper focused on business and economic affairs with deep verification.',
    sourceType: 'wire_service',
    userTrustRating: 95,
    userVotesCount: 460,
  },
  'nature.com': {
    name: 'Nature Scientific',
    domain: 'nature.com',
    tier: 1,
    reputationScore: 99,
    biasRating: 'Neutral',
    factualityRecord: 'Very High',
    description: 'Peer-reviewed multidisciplinary scientific journal with rigorous academic screening.',
    sourceType: 'wire_service',
    userTrustRating: 99,
    userVotesCount: 890,
  },
  'afp.com': {
    name: 'Agence France-Presse (AFP)',
    domain: 'afp.com',
    tier: 1,
    reputationScore: 96,
    biasRating: 'Neutral',
    factualityRecord: 'Very High',
    description: 'Global news agency with global investigative and fact-checking network.',
    sourceType: 'wire_service',
    userTrustRating: 95,
    userVotesCount: 380,
  },
  'wsj.com': {
    name: 'Wall Street Journal',
    domain: 'wsj.com',
    tier: 2,
    reputationScore: 91,
    biasRating: 'Center-Right',
    factualityRecord: 'Very High',
    description: 'American business-focused international daily newspaper.',
    sourceType: 'wire_service',
    userTrustRating: 90,
    userVotesCount: 520,
  },
  'nytimes.com': {
    name: 'The New York Times',
    domain: 'nytimes.com',
    tier: 2,
    reputationScore: 90,
    biasRating: 'Center-Left',
    factualityRecord: 'High',
    description: 'Major US newspaper of record with global reporting bureaus.',
    sourceType: 'wire_service',
    userTrustRating: 89,
    userVotesCount: 710,
  },
  'ptinews.com': {
    name: 'Press Trust of India (PTI)',
    domain: 'ptinews.com',
    tier: 1,
    reputationScore: 97,
    biasRating: 'Neutral',
    factualityRecord: 'Very High',
    description: "India's premier non-profit news wire cooperative providing syndicated verified dispatches across the subcontinent.",
    sourceType: 'open_rss',
    userTrustRating: 96,
    userVotesCount: 610,
  },
  'thehindu.com': {
    name: 'The Hindu',
    domain: 'thehindu.com',
    tier: 1,
    reputationScore: 95,
    biasRating: 'Center-Left',
    factualityRecord: 'Very High',
    description: "India's national newspaper of record renowned for strict editorial verification and independent ombudsman.",
    sourceType: 'open_rss',
    userTrustRating: 95,
    userVotesCount: 580,
  },
  'indianexpress.com': {
    name: 'The Indian Express',
    domain: 'indianexpress.com',
    tier: 1,
    reputationScore: 94,
    biasRating: 'Neutral',
    factualityRecord: 'Very High',
    description: 'Leading Indian investigative daily known for rigorous public-interest reporting and judicial journalism.',
    sourceType: 'open_rss',
    userTrustRating: 94,
    userVotesCount: 490,
  },
  'livemint.com': {
    name: 'Mint',
    domain: 'livemint.com',
    tier: 1,
    reputationScore: 94,
    biasRating: 'Neutral',
    factualityRecord: 'Very High',
    description: 'Indian financial and business daily published in partnership with The Wall Street Journal with audited economic metrics.',
    sourceType: 'open_rss',
    userTrustRating: 93,
    userVotesCount: 390,
  },
  'business-standard.com': {
    name: 'Business Standard',
    domain: 'business-standard.com',
    tier: 1,
    reputationScore: 93,
    biasRating: 'Neutral',
    factualityRecord: 'Very High',
    description: 'Authoritative Indian financial daily focusing on macroeconomic policy, industrial trade, and banking regulation.',
    sourceType: 'open_rss',
    userTrustRating: 92,
    userVotesCount: 310,
  },
  'isro.gov.in': {
    name: 'ISRO Dispatch',
    domain: 'isro.gov.in',
    tier: 1,
    reputationScore: 99,
    biasRating: 'Neutral',
    factualityRecord: 'Very High',
    description: 'Official technical communiques and mission telemetry from the Indian Space Research Organisation.',
    sourceType: 'open_rss',
    userTrustRating: 99,
    userVotesCount: 890,
  },
  'rbi.org.in': {
    name: 'Reserve Bank of India (RBI)',
    domain: 'rbi.org.in',
    tier: 1,
    reputationScore: 99,
    biasRating: 'Neutral',
    factualityRecord: 'Very High',
    description: 'Official monetary policy resolutions, liquidity frameworks, and banking directives from India’s central bank.',
    sourceType: 'open_rss',
    userTrustRating: 99,
    userVotesCount: 760,
  },
  'pib.gov.in': {
    name: 'Press Information Bureau (PIB)',
    domain: 'pib.gov.in',
    tier: 1,
    reputationScore: 96,
    biasRating: 'Neutral',
    factualityRecord: 'Very High',
    description: 'Nodal agency of the Government of India for official policy dissemination and fact-checking unit.',
    sourceType: 'open_rss',
    userTrustRating: 95,
    userVotesCount: 640,
  },
  'aninews.in': {
    name: 'Asian News International (ANI)',
    domain: 'aninews.in',
    tier: 2,
    reputationScore: 90,
    biasRating: 'Neutral',
    factualityRecord: 'High',
    description: 'Major South Asian multimedia news agency providing video feeds and dispatches.',
    sourceType: 'open_rss',
    userTrustRating: 88,
    userVotesCount: 420,
  },
  'ndtv.com': {
    name: 'NDTV News',
    domain: 'ndtv.com',
    tier: 2,
    reputationScore: 89,
    biasRating: 'Neutral',
    factualityRecord: 'High',
    description: 'Pioneering Indian news broadcaster providing round-the-clock national and international reportage.',
    sourceType: 'open_rss',
    userTrustRating: 88,
    userVotesCount: 510,
  },
  'hindustantimes.com': {
    name: 'Hindustan Times',
    domain: 'hindustantimes.com',
    tier: 2,
    reputationScore: 89,
    biasRating: 'Neutral',
    factualityRecord: 'High',
    description: 'Established Indian national English daily newspaper covering politics, science, and world developments.',
    sourceType: 'open_rss',
    userTrustRating: 88,
    userVotesCount: 390,
  },
  'economictimes.indiatimes.com': {
    name: 'The Economic Times',
    domain: 'economictimes.indiatimes.com',
    tier: 2,
    reputationScore: 91,
    biasRating: 'Neutral',
    factualityRecord: 'High',
    description: 'Leading business newspaper in India covering markets, startups, and economic trends.',
    sourceType: 'open_rss',
    userTrustRating: 90,
    userVotesCount: 460,
  }
};

// In-Memory User Reliability Audits Store
const userAuditsStore: UserSourceAudit[] = [
  {
    id: 'audit-1',
    domain: 'bbc.com',
    publisherName: 'BBC News',
    userScore: 96,
    factualityRating: 'Very High',
    feedback: 'Consistent dual-sourcing across breaking geopolitical developments.',
    userName: 'Senior Media Auditor',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: 'audit-2',
    domain: 'reuters.com',
    publisherName: 'Reuters',
    userScore: 99,
    factualityRating: 'Very High',
    feedback: 'Gold standard for financial quotes and initial wire advisories.',
    userName: 'Economic Analyst',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
  },
  {
    id: 'audit-3',
    domain: 'gdeltproject.org',
    publisherName: 'GDELT Project',
    userScore: 98,
    factualityRating: 'Very High',
    feedback: 'Unrivaled geo-spatial event telemetry and multi-lingual cross-checking.',
    userName: 'Data Science Fellow',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'audit-4',
    domain: 'pbs.org',
    publisherName: 'PBS NewsHour',
    userScore: 97,
    factualityRating: 'Very High',
    feedback: 'In-depth investigative segments with minimal sensationalism.',
    userName: 'Public Policy Researcher',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
  },
];

export function lookupPublisher(domainOrName: string): PublisherProfile {
  const cleanDomain = domainOrName.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
  
  // Exact domain match
  if (PUBLISHER_WHITELIST[cleanDomain]) {
    return PUBLISHER_WHITELIST[cleanDomain];
  }
  
  // Partial domain or name search
  for (const [domain, profile] of Object.entries(PUBLISHER_WHITELIST)) {
    if (cleanDomain.includes(domain) || domain.includes(cleanDomain) || 
        profile.name.toLowerCase().includes(domainOrName.toLowerCase())) {
      return profile;
    }
  }

  // Fallback for unlisted/emergent publisher
  return {
    name: domainOrName.split('.')[0]?.toUpperCase() || 'Independent Source',
    domain: cleanDomain || 'unverified-source.org',
    tier: 3,
    reputationScore: 68,
    biasRating: 'Neutral',
    factualityRecord: 'Moderate',
    description: 'Uncataloged or independent publisher requiring heightened multi-source corroboration.',
    sourceType: 'wire_service',
    userTrustRating: 65,
    userVotesCount: 12,
  };
}

export function recordUserSourceAudit(domain: string, audit: {
  userScore: number;
  factualityRating: 'Very High' | 'High' | 'Moderate' | 'Unreliable';
  feedback?: string;
  userName?: string;
}): { success: boolean; publisher: PublisherProfile; audit: UserSourceAudit } {
  const pub = lookupPublisher(domain);
  const targetDomain = pub.domain in PUBLISHER_WHITELIST ? pub.domain : domain.toLowerCase();

  const newAudit: UserSourceAudit = {
    id: 'audit-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    domain: targetDomain,
    publisherName: pub.name,
    userScore: Math.max(0, Math.min(100, Math.round(audit.userScore))),
    factualityRating: audit.factualityRating,
    feedback: audit.feedback?.trim(),
    userName: audit.userName?.trim() || 'Verified Reader',
    timestamp: new Date().toISOString(),
  };

  userAuditsStore.unshift(newAudit);

  // Recalculate dynamic user trust rating
  const domainAudits = userAuditsStore.filter(a => a.domain === targetDomain);
  const avgUserScore = Math.round(
    domainAudits.reduce((acc, curr) => acc + curr.userScore, 0) / domainAudits.length
  );

  if (PUBLISHER_WHITELIST[targetDomain]) {
    const existing = PUBLISHER_WHITELIST[targetDomain];
    existing.userVotesCount = (existing.userVotesCount || 0) + 1;
    existing.userTrustRating = avgUserScore;
  }

  return {
    success: true,
    publisher: pub,
    audit: newAudit,
  };
}

export function getPublisherAudits(domain?: string): UserSourceAudit[] {
  if (!domain) return userAuditsStore;
  const clean = domain.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
  return userAuditsStore.filter(a => a.domain.includes(clean) || clean.includes(a.domain));
}

