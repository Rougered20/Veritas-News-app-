/**
 * Client-Side Invisible GChecker Engine
 * Invisibly corrects spelling mistakes, missing apostrophes, capitalization of agencies,
 * and punctuation before submitting queries, comments, or filtering.
 */

const SPELLING_MAP: Record<string, string> = {
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

export interface ClientSpellcheckReport {
  originalText: string;
  correctedText: string;
  fixesCount: number;
  fixes: Array<{
    original: string;
    corrected: string;
    type: 'spelling' | 'casing' | 'contraction' | 'typography';
  }>;
  cleanlinessScore: number;
}

export function analyzeTextClientSpellcheck(input: string): ClientSpellcheckReport {
  if (!input || typeof input !== 'string') {
    return {
      originalText: '',
      correctedText: '',
      fixesCount: 0,
      fixes: [],
      cleanlinessScore: 100,
    };
  }

  const fixes: ClientSpellcheckReport['fixes'] = [];
  let text = input.trim();

  // Whitespace & quotes
  const preClean = text;
  text = text
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, ' ');

  if (preClean !== text) {
    fixes.push({
      original: 'Glyphs/whitespace',
      corrected: 'Standard typographic clean',
      type: 'typography',
    });
  }

  // Duplicate punctuation
  text = text
    .replace(/,{2,}/g, ',')
    .replace(/\.{4,}/g, '...')
    .replace(/\s+([,.:;?!])/g, '$1')
    .replace(/([,.:;?!])(?=[A-Za-z0-9])/g, '$1 ');

  // Token analysis
  const tokens = text.split(/(\s+|[.,!?:;"()]+)/);
  const correctedTokens = tokens.map(token => {
    if (!token || /^\s+$/.test(token) || /^[.,!?:;"()]+$/.test(token)) {
      return token;
    }
    const lower = token.toLowerCase();

    // 1. Spelling
    if (SPELLING_MAP[lower]) {
      const rep = SPELLING_MAP[lower];
      const target = (token[0] === token[0].toUpperCase() && rep[0] === rep[0].toLowerCase())
        ? rep.charAt(0).toUpperCase() + rep.slice(1)
        : rep;
      if (token !== target) {
        fixes.push({ original: token, corrected: target, type: 'spelling' });
      }
      return target;
    }

    // 2. Contractions
    if (CONTRACTION_CORRECTIONS[lower]) {
      const match = CONTRACTION_CORRECTIONS[lower];
      const target = token[0] === token[0].toUpperCase()
        ? match.charAt(0).toUpperCase() + match.slice(1)
        : match;
      if (token !== target) {
        fixes.push({ original: token, corrected: target, type: 'contraction' });
      }
      return target;
    }

    // 3. Proper entities
    if (PROPER_ENTITIES[lower]) {
      const target = PROPER_ENTITIES[lower];
      if (token !== target) {
        fixes.push({ original: token, corrected: target, type: 'casing' });
      }
      return target;
    }

    return token;
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

export function cleanTextSilently(text: string): string {
  return analyzeTextClientSpellcheck(text).correctedText;
}

