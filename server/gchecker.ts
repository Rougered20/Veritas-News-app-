/**
 * Comprehensive Invisible GChecker (Grammar, Prose, Typo, & Typographical Engine)
 * Automatically and silently corrects grammar, spelling, punctuation, capitalization,
 * and typographical flaws across incoming news payloads and user queries.
 */

// Common spelling mistakes dictionary (frequently occurring typos across wires & datasets)
const SPELLING_CORRECTIONS: Record<string, string> = {
  'proffesional': 'professional',
  'proffesionals': 'professionals',
  'goverment': 'government',
  'govermental': 'governmental',
  'occured': 'occurred',
  'occuring': 'occurring',
  'occurance': 'occurrence',
  'seperate': 'separate',
  'seperated': 'separated',
  'seperately': 'separately',
  'definately': 'definitely',
  'definitly': 'definitely',
  'recieved': 'received',
  'recieving': 'receiving',
  'beleive': 'believe',
  'beleived': 'believed',
  'untill': 'until',
  'accomodate': 'accommodate',
  'accomodation': 'accommodation',
  'acheive': 'achieve',
  'acheived': 'achieved',
  'acheivement': 'achievement',
  'wierd': 'weird',
  'enviroment': 'environment',
  'enviromental': 'environmental',
  'independant': 'independent',
  'independantly': 'independently',
  'neccessary': 'necessary',
  'publically': 'publicly',
  'millitary': 'military',
  'technolgy': 'technology',
  'technlogy': 'technology',
  'artifical': 'artificial',
  'inteligence': 'intelligence',
  'breaktrough': 'breakthrough',
  'breakthru': 'breakthrough',
  'cliamte': 'climate',
  'econmy': 'economy',
  'corrobrate': 'corroborate',
  'corroboratd': 'corroborated',
  'consensous': 'consensus',
  'foriegn': 'foreign',
  'supercede': 'supersede',
  'truely': 'truly',
  'unforseen': 'unforeseen',
  'commited': 'committed',
  'commitee': 'committee',
  'priviledge': 'privilege',
  'maintainance': 'maintenance',
  'tendancy': 'tendency',
  'reuterss': 'Reuters',
  'bloombrg': 'Bloomberg',
  'wikinew': 'Wikinews',
  'wikinews': 'Wikinews',
  'gdelt': 'GDELT',
  'gnews': 'GNews',
  'currents': 'Currents',
  'newsapi': 'NewsAPI',
  'newsdata': 'NewsData',
  'commoncrawl': 'Common Crawl',
  'newshour': 'NewsHour',
  'journalizm': 'journalism',
  'analsis': 'analysis',
  'statstics': 'statistics',
  'infrastucture': 'infrastructure',
  'subsidary': 'subsidiary',
  'agrement': 'agreement',
  'bilaterel': 'bilateral',
  'unanimousely': 'unanimously',
  'consistant': 'consistent',
  'resilence': 'resilience',
};

// Proper entities and acronyms that must always retain standard capitalization
const PROPER_ENTITIES: Record<string, string> = {
  'reuters': 'Reuters',
  'bloomberg': 'Bloomberg',
  'who': 'WHO',
  'mit': 'MIT',
  'nasa': 'NASA',
  'iea': 'IEA',
  'bis': 'BIS',
  'copernicus': 'Copernicus',
  'eu': 'EU',
  'un': 'UN',
  'gavi': 'Gavi',
  'afp': 'AFP',
  'cdc': 'CDC',
  'ieee': 'IEEE',
  'tsmc': 'TSMC',
  'ai': 'AI',
  'sec': 'SEC',
  'us': 'US',
  'uk': 'UK',
  'nato': 'NATO',
  'ft': 'FT',
  'wsj': 'WSJ',
  'r21': 'R21',
  'cie': 'UCIe',
  'uciew': 'UCIe',
  'iso': 'ISO',
  'gdp': 'GDP',
  'isro': 'ISRO',
  'rbi': 'RBI',
  'pti': 'PTI',
  'pib': 'PIB',
  'icmr': 'ICMR',
  'drdo': 'DRDO',
  'aiims': 'AIIMS',
  'sebi': 'SEBI',
  'upi': 'UPI',
  'cbdc': 'CBDC',
  'nglv': 'NGLV',
  'ani': 'ANI',
  'ndtv': 'NDTV',
  'bengaluru': 'Bengaluru',
  'delhi': 'Delhi',
  'mumbai': 'Mumbai',
  'dholera': 'Dholera',
  'iit': 'IIT',
  'iisc': 'IISc',
  'gdelt': 'GDELT',
  'wikinews': 'Wikinews',
  'bbc': 'BBC',
  'npr': 'NPR',
  'pbs': 'PBS',
  'cnn': 'CNN',
  'newshour': 'NewsHour',
};

// Common missing apostrophe contractions
const CONTRACTION_CORRECTIONS: Record<string, string> = {
  'dont': "don't",
  'doesnt': "doesn't",
  'didnt': "didn't",
  'cant': "can't",
  'wont': "won't",
  'couldnt': "couldn't",
  'shouldnt': "shouldn't",
  'wouldnt': "wouldn't",
  'isnt': "isn't",
  'arent': "aren't",
  'wasnt': "wasn't",
  'werent': "weren't",
  'hasnt': "hasn't",
  'havent': "haven't",
  'hadnt': "hadn't",
  'thats': "that's",
  'whats': "what's",
  'theres': "there's",
  'heres': "here's",
  'theyre': "they're",
  'youre': "you're",
  'weve': "we've",
  'theyve': "they've",
};

export interface SpellcheckAnalysisReport {
  originalText: string;
  correctedText: string;
  fixesCount: number;
  fixes: Array<{
    original: string;
    corrected: string;
    type: 'spelling' | 'casing' | 'contraction' | 'typography';
  }>;
  cleanlinessScore: number; // 0 - 100
}

/**
 * Detailed spellcheck and grammar audit
 */
export function analyzeTextSpellcheck(input: string): SpellcheckAnalysisReport {
  if (!input || typeof input !== 'string') {
    return {
      originalText: '',
      correctedText: '',
      fixesCount: 0,
      fixes: [],
      cleanlinessScore: 100,
    };
  }

  const fixes: SpellcheckAnalysisReport['fixes'] = [];
  let text = input.trim();

  // Whitespace & typographical glyphs
  const preClean = text;
  text = text
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, ' ');

  if (preClean !== text) {
    fixes.push({
      original: 'Typographical quotes/whitespace',
      corrected: 'Standardized glyphs & single spacing',
      type: 'typography',
    });
  }

  // Duplicate punctuation
  text = text
    .replace(/,{2,}/g, ',')
    .replace(/\.{4,}/g, '...')
    .replace(/\s+([,.:;?!])/g, '$1')
    .replace(/([,.:;?!])(?=[A-Za-z0-9])/g, '$1 ');

  // Word-by-word analysis
  const tokens = text.split(/(\s+|[.,!?:;"()]+)/);
  const correctedTokens = tokens.map(chunk => {
    if (!chunk || /^\s+$/.test(chunk) || /^[.,!?:;"()]+$/.test(chunk)) {
      return chunk;
    }

    const lower = chunk.toLowerCase();

    // 1. Spelling
    if (SPELLING_CORRECTIONS[lower]) {
      const match = SPELLING_CORRECTIONS[lower];
      const target = (chunk[0] === chunk[0].toUpperCase() && match[0] === match[0].toLowerCase())
        ? match.charAt(0).toUpperCase() + match.slice(1)
        : match;
      if (chunk !== target) {
        fixes.push({ original: chunk, corrected: target, type: 'spelling' });
      }
      return target;
    }

    // 2. Contractions
    if (CONTRACTION_CORRECTIONS[lower]) {
      const match = CONTRACTION_CORRECTIONS[lower];
      const target = chunk[0] === chunk[0].toUpperCase()
        ? match.charAt(0).toUpperCase() + match.slice(1)
        : match;
      if (chunk !== target) {
        fixes.push({ original: chunk, corrected: target, type: 'contraction' });
      }
      return target;
    }

    // 3. Proper entities
    if (PROPER_ENTITIES[lower]) {
      const target = PROPER_ENTITIES[lower];
      if (chunk !== target) {
        fixes.push({ original: chunk, corrected: target, type: 'casing' });
      }
      return target;
    }

    return chunk;
  });

  text = correctedTokens.join('');

  // Sentence capitalization
  text = text.replace(/(^\s*|[.!?]\s+)([a-z])/g, (_, prefix, letter) => {
    return prefix + letter.toUpperCase();
  });

  const totalWords = input.split(/\s+/).length || 1;
  const errorRatio = fixes.length / totalWords;
  const cleanlinessScore = Math.max(70, Math.round(100 - errorRatio * 50));

  return {
    originalText: input,
    correctedText: text.trim(),
    fixesCount: fixes.length,
    fixes,
    cleanlinessScore,
  };
}

/**
 * Invisibly cleans and auto-corrects text
 */
export function autoCorrectText(input: string): string {
  return analyzeTextSpellcheck(input).correctedText;
}

/**
 * Invisibly polishes an entire news article payload
 */
export function autoCorrectNewsPayload(data: {
  title: string;
  summary: string;
  fullContent?: string;
  publisherName?: string;
}): {
  title: string;
  summary: string;
  fullContent?: string;
  publisherName?: string;
  spellcheckReport: {
    totalFixes: number;
    score: number;
  };
} {
  const titleReport = analyzeTextSpellcheck(data.title);
  const summaryReport = analyzeTextSpellcheck(data.summary);
  const contentReport = data.fullContent ? analyzeTextSpellcheck(data.fullContent) : null;
  const pubReport = data.publisherName ? analyzeTextSpellcheck(data.publisherName) : null;

  const totalFixes = titleReport.fixesCount + summaryReport.fixesCount + (contentReport?.fixesCount || 0) + (pubReport?.fixesCount || 0);
  const avgScore = Math.round((titleReport.cleanlinessScore + summaryReport.cleanlinessScore) / 2);

  return {
    title: titleReport.correctedText,
    summary: summaryReport.correctedText,
    fullContent: contentReport?.correctedText,
    publisherName: pubReport?.correctedText,
    spellcheckReport: {
      totalFixes,
      score: avgScore,
    },
  };
}

