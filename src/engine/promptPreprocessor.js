const TYPO_FIXES = {
  teh: 'the',
  hte: 'the',
  adn: 'and',
  nad: 'and',
  recieve: 'receive',
  recieved: 'received',
  seperate: 'separate',
  occured: 'occurred',
  definately: 'definitely',
  alot: 'a lot',
  cant: "can't",
  wont: "won't",
  dont: "don't",
  doesnt: "doesn't",
  wasnt: "wasn't",
  wouldnt: "wouldn't",
  shouldnt: "shouldn't",
  isnt: "isn't",
  arent: "aren't",
  thier: 'their',
  recomend: 'recommend',
  recomendation: 'recommendation',
  buisness: 'business',
  begining: 'beginning',
  acheive: 'achieve',
  managment: 'management',
  developement: 'development',
  enviroment: 'environment',
  occurence: 'occurrence',
  untill: 'until',
  truely: 'truly',
  wierd: 'weird',
  wich: 'which',
  diffrent: 'different',
  diffrence: 'difference',
  langauge: 'language',
  proffesional: 'professional',
  responce: 'response',
  succesful: 'successful',
  thru: 'through',
  pls: 'please',
  plz: 'please',
  thx: 'thanks',
  u: 'you',
  ur: 'your',
  cuz: 'because',
  coz: 'because',
  bc: 'because',
  bcuz: 'because',
  abt: 'about',
  asap: 'as soon as possible',
};

const DANISH_TO_ENGLISH = {
  hej: 'hello',
  hejsa: 'hello',
  davs: 'hello',
  tak: 'thanks',
  ja: 'yes',
  nej: 'no',
  ok: 'ok',
  okay: 'ok',
  jeg: 'I',
  vil: 'want to',
  havde: 'have',
  have: 'have',
  motoren: 'the engine',
  motor: 'engine',
  bagved: 'behind',
  bedere: 'better',
  bedre: 'better',
  til: 'to',
  kunne: 'be able to',
  forstå: 'understand',
  forstaa: 'understand',
  dårlige: 'bad',
  daarlige: 'bad',
  dårlig: 'bad',
  daarlig: 'bad',
  promt: 'prompt',
  prompter: 'prompts',
  skriv: 'write',
  formuler: 'formulate',
  tekst: 'text',
  email: 'email',
  mail: 'mail',
  artikel: 'article',
  besked: 'message',
  lav: 'create',
  byg: 'build',
  hjælp: 'help',
  hjaelp: 'help',
  forklar: 'explain',
  opsummer: 'summarize',
  oversæt: 'translate',
  oversaet: 'translate',
  analyser: 'analyze',
  undersøg: 'research',
  undersoeg: 'research',
  marked: 'market',
  konkurrent: 'competitor',
  kilde: 'source',
  kilder: 'sources',
  data: 'data',
  sammenlign: 'compare',
  analyse: 'analysis',
  plan: 'plan',
  strategi: 'strategy',
  projekt: 'project',
  opdel: 'split',
  prioriter: 'prioritize',
  fase: 'phase',
  struktur: 'structure',
  todo: 'todo',
  opgave: 'task',
  brainstorm: 'brainstorm',
  idé: 'idea',
  ide: 'idea',
  koncept: 'concept',
  kreativ: 'creative',
  navn: 'name',
  brand: 'brand',
  vinkel: 'angle',
  variation: 'variation',
  kampagne: 'campaign',
  bør: 'should',
  boer: 'should',
  skal: 'should',
  vælge: 'choose',
  vaelge: 'choose',
  beslut: 'decide',
  alternativ: 'alternative',
  bedst: 'best',
  alt: 'all',
  komplet: 'complete',
  fuld: 'full',
  hele: 'whole',
  gennemgå: 'review',
  gennemgaa: 'review',
  kontroller: 'check',
  kvalitet: 'quality',
  feedback: 'feedback',
  forbedr: 'improve',
  kritik: 'critique',
  tjek: 'check',
  valider: 'validate',
  validér: 'validate',
  sikker: 'safe',
  risiko: 'risk',
  mine: 'my',
  min: 'my',
  filer: 'files',
  stil: 'style',
  tidligere: 'previous',
  sidst: 'last',
  husker: 'remember',
  noter: 'notes',
  upload: 'upload',
  tone: 'tone',
  profil: 'profile',
  først: 'first',
  foerst: 'first',
  derefter: 'then',
  så: 'then',
  saa: 'then',
  trin: 'step',
  kompleks: 'complex',
  forretning: 'business',
  arkitektur: 'architecture',
  system: 'system',
  produkt: 'product',
  persondata: 'personal data',
  privat: 'private',
  fortroligt: 'confidential',
  hemmeligt: 'secret',
  sikkerhed: 'security',
  compliance: 'compliance',
  samtykke: 'consent',
  begrænsning: 'limitation',
  begraensning: 'limitation',
  hvad: 'what',
  hvordan: 'how',
  hvorfor: 'why',
  hvor: 'where',
  hvornår: 'when',
  hvornaar: 'when',
  hvem: 'who',
  det: 'that',
  den: 'that',
  god: 'good',
  dårligt: 'badly',
  daarligt: 'badly',
};

const DANISH_DIACRITICS = /[æøåÆØÅ]/;
const DANISH_FUNCTION_WORDS = new Set([
  'jeg', 'du', 'vi', 'de', 'ikke', 'med', 'til', 'fra', 'som', 'for',
  'på', 'paa', 'er', 'har', 'kan', 'skal', 'vil', 'og', 'eller', 'men',
  'det', 'den', 'en', 'et', 'min', 'din', 'sin', 'vores', 'jer', 'dem',
  'havde', 'kunne', 'ville', 'skulle', 'bør', 'boer', 'lige', 'altid',
]);

const ULTRA_VAGUE_PHRASES = [
  'fix this', 'fix that', 'fix it', 'do it', 'do that', 'help me',
  'make it better', 'improve this', 'what should i do', 'what now', 'idk',
  'i dont know', "i don't know", 'just do', 'go', 'continue', 'whatever',
];

function stripPunctuation(token) {
  return token.replace(/^[^\p{L}\p{N}']+|[^\p{L}\p{N}']+$/gu, '');
}

function preserveCase(original, replacement) {
  if (!original || !replacement) return replacement;
  if (original === original.toUpperCase() && original.length > 1) return replacement.toUpperCase();
  if (original[0] === original[0]?.toUpperCase()) {
    return replacement[0].toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

function detectLanguageMix(tokens) {
  let danishHits = 0;
  let englishCommonHits = 0;
  const commonEnglish = new Set(['the', 'is', 'and', 'a', 'to', 'of', 'for', 'with', 'in', 'on', 'i', 'you', 'me', 'we']);
  for (const raw of tokens) {
    const t = stripPunctuation(raw).toLowerCase();
    if (!t) continue;
    if (DANISH_TO_ENGLISH[t] || DANISH_FUNCTION_WORDS.has(t)) danishHits += 1;
    if (commonEnglish.has(t)) englishCommonHits += 1;
  }
  const total = tokens.filter((t) => stripPunctuation(t)).length || 1;
  const danishRatio = danishHits / total;
  const englishRatio = englishCommonHits / total;
  let language = 'english';
  if (DANISH_DIACRITICS.test(tokens.join(' ')) || danishRatio >= 0.25) {
    language = danishRatio > 0 && englishRatio > 0 && Math.abs(danishRatio - englishRatio) < 0.25
      ? 'mixed'
      : 'danish';
  }
  return { language, danishRatio, englishRatio };
}

function normalizeTokens(tokens) {
  const corrections = [];
  const translations = [];
  const normalized = tokens.map((raw) => {
    const stripped = stripPunctuation(raw);
    if (!stripped) return raw;
    const lower = stripped.toLowerCase();
    let replacement = null;
    if (TYPO_FIXES[lower]) {
      replacement = TYPO_FIXES[lower];
      corrections.push({ from: stripped, to: replacement });
    } else if (DANISH_TO_ENGLISH[lower]) {
      replacement = DANISH_TO_ENGLISH[lower];
      translations.push({ from: stripped, to: replacement });
    }
    if (!replacement) return raw;
    const casedReplacement = preserveCase(stripped, replacement);
    return raw.replace(stripped, casedReplacement);
  });
  return { normalized, corrections, translations };
}

function isUltraVague(text) {
  const cleaned = text.trim().toLowerCase().replace(/[.!?]+$/, '');
  if (!cleaned) return true;
  const wordCount = cleaned.split(/\s+/).filter(Boolean).length;
  if (wordCount <= 1 && cleaned.length < 5) return true;
  return ULTRA_VAGUE_PHRASES.some((phrase) => cleaned === phrase || cleaned.startsWith(`${phrase} `));
}

function looksLikeQuestion(text) {
  if (text.includes('?')) return true;
  const lowered = text.toLowerCase().trim();
  // Wh-questions are easy; auxiliary-led questions require enough words to
  // actually look like a question rather than a command ("do it" should not
  // count as a question, but "do you know" should).
  if (/^(what|how|why|when|where|who|which)\b/.test(lowered)) return true;
  if (/^(can|could|should|is|are|do|does|would|will)\b/.test(lowered)) {
    return lowered.split(/\s+/).filter(Boolean).length >= 3;
  }
  return false;
}

function inputQualityScore({ text, corrections, language, isVague }) {
  let score = 1;
  if (text.trim().length < 8) score -= 0.35;
  else if (text.trim().length < 16) score -= 0.15;
  score -= Math.min(0.35, corrections.length * 0.07);
  if (language === 'danish') score -= 0.05;
  if (language === 'mixed') score -= 0.1;
  if (isVague) score -= 0.25;
  return Math.max(0, Math.min(1, Number(score.toFixed(2))));
}

export function preprocessPrompt(rawGoal) {
  const original = typeof rawGoal === 'string' ? rawGoal : '';
  const collapsed = original.replace(/\s+/g, ' ').trim();
  if (!collapsed) {
    return {
      original,
      normalized: '',
      enrichedGoal: '',
      corrections: [],
      translations: [],
      language: 'unknown',
      languageRatios: { danish: 0, english: 0 },
      isUltraVague: true,
      isQuestion: false,
      tokens: [],
      qualityScore: 0,
      hints: ['empty_input'],
    };
  }

  const tokens = collapsed.split(/\s+/);
  const languageInfo = detectLanguageMix(tokens);
  const { normalized, corrections, translations } = normalizeTokens(tokens);
  const normalizedText = normalized.join(' ');

  const ultraVague = isUltraVague(normalizedText) || isUltraVague(collapsed);
  const question = looksLikeQuestion(normalizedText) || looksLikeQuestion(collapsed);

  const hints = [];
  if (corrections.length > 0) hints.push(`fixed_typos:${corrections.length}`);
  if (translations.length > 0) hints.push(`translated_danish:${translations.length}`);
  if (languageInfo.language !== 'english') hints.push(`source_language:${languageInfo.language}`);
  if (ultraVague) hints.push('ultra_vague');
  if (question) hints.push('question_form');
  if (collapsed.length < 12) hints.push('short_input');

  const enrichmentNotes = [];
  if (corrections.length > 0) {
    enrichmentNotes.push(
      `Auto-corrections: ${corrections.map((c) => `"${c.from}" -> "${c.to}"`).join(', ')}.`,
    );
  }
  if (translations.length > 0) {
    enrichmentNotes.push(
      `Translated Danish terms: ${translations.map((t) => `"${t.from}" -> "${t.to}"`).join(', ')}.`,
    );
  }
  if (ultraVague) {
    enrichmentNotes.push(
      'Original message is very short or vague; assume the user wants the assistant to take a reasonable best-effort action and surface the assumptions made.',
    );
  }
  if (languageInfo.language === 'mixed') {
    enrichmentNotes.push('Input mixes Danish and English; respond in the dominant language.');
  }

  const enrichedGoal = enrichmentNotes.length > 0
    ? `${normalizedText}\n\n[Engine note: ${enrichmentNotes.join(' ')}]`
    : normalizedText;

  const qualityScore = inputQualityScore({
    text: collapsed,
    corrections,
    language: languageInfo.language,
    isVague: ultraVague,
  });

  return {
    original,
    normalized: normalizedText,
    enrichedGoal,
    corrections,
    translations,
    language: languageInfo.language,
    languageRatios: {
      danish: Number(languageInfo.danishRatio.toFixed(2)),
      english: Number(languageInfo.englishRatio.toFixed(2)),
    },
    isUltraVague: ultraVague,
    isQuestion: question,
    tokens,
    qualityScore,
    hints,
  };
}

export function buildEngineHintMessage(preprocessed) {
  if (!preprocessed || preprocessed.hints.length === 0) return '';
  const pieces = [];
  if (preprocessed.corrections.length > 0) {
    pieces.push(`auto-corrected ${preprocessed.corrections.length} typo(s)`);
  }
  if (preprocessed.translations.length > 0) {
    pieces.push(`translated ${preprocessed.translations.length} Danish term(s)`);
  }
  if (preprocessed.isUltraVague) {
    pieces.push('treated as vague request and applied best-effort interpretation');
  }
  if (preprocessed.language === 'mixed') {
    pieces.push('handled mixed Danish/English input');
  }
  if (pieces.length === 0) return '';
  return `SnapTrainer engine: ${pieces.join('; ')}.`;
}
