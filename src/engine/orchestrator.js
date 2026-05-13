import { EXECUTION_MODES } from './contracts.js';

const signals = {
  multiStep: ['plan', 'roadmap', 'step', 'workflow', 'sequence', 'first', 'then', 'after', 'trin', 'foerst', 'derefter'],
  parallel: ['compare', 'research', 'analyze', 'analyse', 'market', 'options', 'alternatives', 'pros and cons', 'sammenlign', 'muligheder'],
  memory: ['my style', 'my files', 'remember', 'previous', 'as before', 'my notes', 'min stil', 'mine filer', 'husk', 'tidligere'],
  unclear: ['make it better', 'fix this', 'what should i do', 'improve this', 'do it', 'goer det bedre', 'fiks det', 'forbedr dette'],
  conflict: ['but do not', 'ignore previous', 'even if', 'contradict', 'conflicting'],
  highRisk: ['legal', 'medical', 'financial advice', 'private', 'sensitive', 'security'],
  conversational: ['hi', 'hello', 'hey', 'thanks', 'thank you', 'ok', 'yes', 'no', 'hej', 'tak', 'ja', 'nej'],
  actionable: [
    'write', 'draft', 'create', 'make', 'build', 'explain', 'summarize', 'translate',
    'brainstorm', 'list', 'help me', 'show me', 'tell me', 'analyze', 'plan',
    'fix', 'improve', 'repair', 'rewrite', 'generate', 'understand',
    'skriv', 'lav', 'byg', 'forklar', 'opsummer', 'oversaet', 'hjaelp',
    'vis mig', 'fortael', 'analyser', 'planlaeg', 'fiks', 'forbedr', 'goer',
  ],
};

const spellingRepairs = new Map(Object.entries({
  ai: 'ai',
  aiface: 'aiface',
  analize: 'analyze',
  analyser: 'analyze',
  bedere: 'better',
  bedre: 'better',
  btr: 'better',
  buid: 'build',
  creat: 'create',
  creaet: 'create',
  derefter: 'then',
  draftt: 'draft',
  ekstreamt: 'extremely',
  ekstramt: 'extremely',
  explainn: 'explain',
  fikse: 'fix',
  fiks: 'fix',
  fr: 'for',
  foerst: 'first',
  forbedr: 'improve',
  fortael: 'tell',
  generat: 'generate',
  goer: 'make',
  gor: 'make',
  gør: 'make',
  hjaelp: 'help',
  hjælp: 'help',
  hlp: 'help',
  lauch: 'launch',
  lanuch: 'launch',
  lanch: 'launch',
  lav: 'make',
  mak: 'make',
  mke: 'make',
  mk: 'make',
  motoren: 'engine',
  plz: 'please',
  pls: 'please',
  prmpt: 'prompt',
  prmpts: 'prompts',
  promt: 'prompt',
  promts: 'prompts',
  promptz: 'prompts',
  r: 'are',
  rite: 'write',
  rwrite: 'rewrite',
  skriv: 'write',
  smmarize: 'summarize',
  snaptræner: 'snaptrainer',
  thng: 'thing',
  ths: 'this',
  ting: 'thing',
  twet: 'tweet',
  u: 'you',
  ur: 'your',
  wrtie: 'write',
  wtite: 'write',
}));

const shortAmbiguousActions = new Set(['do', 'make', 'fix', 'improve', 'help']);

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/7/g, 't')
    .replace(/[^a-z0-9?'\s-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function compactRepeatedLetters(value) {
  return value.replace(/([a-z])\1{2,}/g, '$1$1');
}

function tokenize(text) {
  return normalizeText(text)
    .split(/\s+/)
    .map((token) => token.replace(/^'+|'+$/g, ''))
    .filter(Boolean);
}

function editDistance(a, b) {
  if (a === b) return 0;
  if (!a || !b) return Math.max(a.length, b.length);

  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  const current = new Array(b.length + 1);

  for (let i = 1; i <= a.length; i += 1) {
    current[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + cost
      );
    }
    previous.splice(0, previous.length, ...current);
  }

  return previous[b.length];
}

function maxDistanceFor(term) {
  if (term.length <= 3) return 0;
  if (term.length <= 5) return 1;
  return 2;
}

function repairToken(token) {
  const compact = compactRepeatedLetters(token);
  return spellingRepairs.get(compact) || spellingRepairs.get(token) || compact;
}

function wordMatches(candidate, expected) {
  const repairedCandidate = repairToken(candidate);
  const repairedExpected = repairToken(expected);
  if (repairedCandidate === repairedExpected) return true;
  if (candidate.length <= 2 || expected.length <= 2) return false;
  return editDistance(repairedCandidate, repairedExpected) <= maxDistanceFor(repairedExpected);
}

function phraseMatches(tokens, phrase) {
  const phraseTokens = tokenize(phrase);
  if (phraseTokens.length === 0) return false;

  for (let start = 0; start <= tokens.length - phraseTokens.length; start += 1) {
    const matches = phraseTokens.every((term, offset) => wordMatches(tokens[start + offset], term));
    if (matches) return true;
  }

  return false;
}

function includesAny(profile, items) {
  return items.some((item) => {
    const normalizedItem = normalizeText(item);
    return profile.normalizedText.includes(normalizedItem)
      || profile.repairedText.includes(normalizedItem)
      || phraseMatches(profile.tokens, item)
      || phraseMatches(profile.repairedTokens, item);
  });
}

function createPromptProfile(userGoal) {
  const normalizedText = normalizeText(userGoal);
  const tokens = tokenize(normalizedText);
  const repairedTokens = tokens.map(repairToken);
  const repairedText = repairedTokens.join(' ');
  const noisyTokens = tokens.filter((token, index) => token !== repairedTokens[index]);
  const repeatedLetterTokens = tokens.filter((token) => /([a-z])\1{2,}/.test(token));
  const shorthandTokens = tokens.filter((token) => ['plz', 'pls', 'u', 'ur', 'r', 'ths', 'btr', 'mk', 'hlp'].includes(token));
  const vowelSparseTokens = tokens.filter((token) => token.length > 3 && !/[aeiouy]/.test(token));
  const noiseScore = new Set([
    ...noisyTokens,
    ...repeatedLetterTokens,
    ...shorthandTokens,
    ...vowelSparseTokens,
  ]).size;

  return {
    normalizedText,
    tokens,
    repairedTokens,
    repairedText,
    repairedGoal: repairedText || userGoal.trim(),
    isNoisy: noiseScore >= 1 || normalizedText !== compactRepeatedLetters(normalizedText),
    noiseScore,
  };
}

function countSignals(profile) {
  return [
    includesAny(profile, signals.multiStep),
    includesAny(profile, signals.parallel),
    includesAny(profile, signals.memory),
    includesAny(profile, signals.conflict),
    includesAny(profile, signals.highRisk),
  ].filter(Boolean).length;
}

function inferGoalType(profile) {
  if (includesAny(profile, signals.multiStep)) return 'workflow';
  if (includesAny(profile, signals.parallel)) return 'analysis';
  if (includesAny(profile, signals.memory)) return 'personalized_memory_task';
  if (includesAny(profile, ['write', 'draft', 'rewrite', 'translate', 'summarize', 'skriv', 'oversaet'])) return 'content_generation';
  if (includesAny(profile, ['fix', 'improve', 'repair', 'forbedr', 'better'])) return 'improvement_or_repair';
  return 'general_assistance';
}

function buildClarificationQuestion(profile) {
  const repairedAction = profile.repairedTokens.find((token) => shortAmbiguousActions.has(token));
  if (repairedAction) {
    return `What should I ${repairedAction}, and what outcome, audience, or constraints should I use?`;
  }
  return 'Can you share the intended outcome, audience, and any constraints before I proceed?';
}

function summarizeGoal(userGoal, profile, needsClarification) {
  if (needsClarification) return 'The request is underspecified and may require clarification.';
  if (profile.isNoisy && profile.repairedGoal && profile.repairedGoal !== profile.normalizedText) {
    return `The user likely wants: ${profile.repairedGoal.slice(0, 180)} (repaired from noisy wording).`;
  }
  return `The user wants: ${userGoal.slice(0, 180)}`;
}

export function interpretIntent(userGoal, memory) {
  const profile = createPromptProfile(userGoal);
  const trimmed = userGoal.trim();
  const constraints = [];
  if (includesAny(profile, signals.conflict)) constraints.push('conflicting_instructions');
  if (includesAny(profile, signals.highRisk)) constraints.push('high_risk_or_sensitive');
  if (memory.workflow.knowledgeCount > 0 || includesAny(profile, signals.memory)) constraints.push('memory_dependent');
  if (profile.isNoisy) constraints.push('noisy_prompt_repaired');

  const cleanMessage = profile.repairedText.replace(/[.!?]+$/, '');
  const isConversational = signals.conversational.includes(cleanMessage);
  const hasActionableSignal = includesAny(profile, signals.actionable)
    || includesAny(profile, signals.multiStep)
    || includesAny(profile, signals.parallel)
    || profile.normalizedText.includes('?');

  const wordCount = profile.tokens.length || trimmed.split(/\s+/).filter(Boolean).length;
  const onlyAmbiguousAction = wordCount <= 2
    && profile.repairedTokens.some((token) => shortAmbiguousActions.has(token))
    && !profile.repairedTokens.some((token) => ['this', 'that', 'prompt', 'text', 'tweet', 'plan'].includes(token));

  // Ask only when the prompt is too small or content-free to repair into an actionable intent.
  const needsClarification =
    !isConversational &&
    (
      (!hasActionableSignal && wordCount <= 2 && trimmed.length < 18)
      || onlyAmbiguousAction
    );

  const signalCount = countSignals(profile);

  const complexity = userGoal.length > 360 || signalCount >= 3
    ? 'high'
    : userGoal.length > 140 || signalCount >= 2
      ? 'medium'
      : 'low';
  const confidence = needsClarification
    ? 0.45
    : profile.isNoisy
      ? Math.max(0.62, complexity === 'high' ? 0.68 : 0.74)
      : complexity === 'high'
        ? 0.72
        : 0.82;

  return {
    summary: summarizeGoal(userGoal, profile, needsClarification),
    goalType: inferGoalType(profile),
    needsClarification,
    clarificationQuestion: needsClarification
      ? buildClarificationQuestion(profile)
      : '',
    complexity,
    confidence,
    constraints,
    normalizedGoal: profile.normalizedText,
    repairedGoal: profile.repairedGoal,
    promptQuality: profile.isNoisy ? 'noisy_repaired' : 'clear',
  };
}

export function chooseExecutionMode(intent, userGoal) {
  const profile = createPromptProfile(intent.repairedGoal || userGoal);
  if (intent.needsClarification) return EXECUTION_MODES.DIRECT;
  if (intent.complexity === 'high') return EXECUTION_MODES.REVIEWER_LOOP;
  if (includesAny(profile, signals.multiStep)) return EXECUTION_MODES.SEQUENTIAL;
  if (includesAny(profile, signals.parallel)) return EXECUTION_MODES.PARALLEL;
  if (intent.constraints.includes('memory_dependent')) return EXECUTION_MODES.DYNAMIC_HANDOFF;
  if (intent.complexity === 'medium') return EXECUTION_MODES.REVIEWER_LOOP;
  return EXECUTION_MODES.DIRECT;
}

function agentForGoal(goalType, title) {
  const text = `${goalType} ${title}`.toLowerCase();
  if (text.includes('research') || text.includes('market')) return 'research';
  if (text.includes('plan') || text.includes('workflow')) return 'planner';
  if (text.includes('write') || text.includes('draft')) return 'writer';
  if (text.includes('risk') || text.includes('review')) return 'reviewer';
  if (text.includes('memory') || text.includes('style')) return 'memory';
  return 'executor';
}

function objectiveFromIntent(userGoal, intent) {
  if (!intent.repairedGoal || intent.repairedGoal === intent.normalizedGoal) return userGoal;
  return `Original user wording: "${userGoal}". Interpreted repaired intent: "${intent.repairedGoal}".`;
}

export function decomposeTask(userGoal, intent, executionMode) {
  if (intent.needsClarification) {
    return [{
      id: 'clarify_request',
      title: 'Ask a concise clarification question',
      objective: intent.clarificationQuestion,
      assignedAgent: 'orchestrator',
      status: 'pending',
      dependencies: [],
      attempts: 0,
    }];
  }

  const base = [
    {
      id: 'understand_intent',
      title: 'Interpret goal and constraints',
      objective: intent.promptQuality === 'noisy_repaired'
        ? `Restate the repaired intent, original wording, constraints, and success criteria. Repaired intent: ${intent.repairedGoal}`
        : 'Restate the user goal, constraints, and success criteria.',
      assignedAgent: 'intent',
      status: 'pending',
      dependencies: [],
      attempts: 0,
    },
  ];

  if (executionMode === EXECUTION_MODES.DIRECT) {
    return [
      ...base,
      {
        id: 'direct_answer',
        title: 'Produce direct AIFace response',
        objective: objectiveFromIntent(userGoal, intent),
        assignedAgent: 'writer',
        status: 'pending',
        dependencies: ['understand_intent'],
        attempts: 0,
      },
    ];
  }

  if (executionMode === EXECUTION_MODES.PARALLEL) {
    return [
      ...base,
      {
        id: 'research_angle',
        title: 'Research and context angle',
        objective: 'Find relevant facts, assumptions, and context gaps.',
        assignedAgent: 'research',
        status: 'pending',
        dependencies: ['understand_intent'],
        attempts: 0,
      },
      {
        id: 'analysis_angle',
        title: 'Analysis and tradeoff angle',
        objective: 'Analyze options, tradeoffs, and implications.',
        assignedAgent: 'analyst',
        status: 'pending',
        dependencies: ['understand_intent'],
        attempts: 0,
      },
      {
        id: 'style_angle',
        title: 'User-style adaptation angle',
        objective: 'Adapt the result to the user style and preferences.',
        assignedAgent: 'writer',
        status: 'pending',
        dependencies: ['understand_intent'],
        attempts: 0,
      },
    ];
  }

  if (executionMode === EXECUTION_MODES.SEQUENTIAL || executionMode === EXECUTION_MODES.DYNAMIC_HANDOFF) {
    return [
      ...base,
      {
        id: 'plan_steps',
        title: 'Plan ordered subtasks',
        objective: 'Break the user goal into ordered, dependency-aware steps.',
        assignedAgent: 'planner',
        status: 'pending',
        dependencies: ['understand_intent'],
        attempts: 0,
      },
      {
        id: 'execute_steps',
        title: 'Execute planned steps',
        objective: `Execute the plan using prior output as structured handoff context. ${objectiveFromIntent(userGoal, intent)}`,
        assignedAgent: agentForGoal(intent.goalType, intent.repairedGoal || userGoal),
        status: 'pending',
        dependencies: ['plan_steps'],
        attempts: 0,
      },
      {
        id: 'organize_result',
        title: 'Organize final result',
        objective: 'Make the output structured, actionable, and aligned with the AIFace.',
        assignedAgent: 'organizer',
        status: 'pending',
        dependencies: ['execute_steps'],
        attempts: 0,
      },
    ];
  }

  return [
    ...base,
    {
      id: 'decompose_complex_goal',
      title: 'Decompose complex goal',
      objective: `Split the request into specialist workstreams and explicit success criteria. ${objectiveFromIntent(userGoal, intent)}`,
      assignedAgent: 'planner',
      status: 'pending',
      dependencies: ['understand_intent'],
      attempts: 0,
    },
    {
      id: 'execute_specialist_work',
      title: 'Execute specialist work',
      objective: 'Run the key specialist analysis needed for the user goal.',
      assignedAgent: 'analyst',
      status: 'pending',
      dependencies: ['decompose_complex_goal'],
      attempts: 0,
    },
    {
      id: 'synthesize_unified_answer',
      title: 'Synthesize unified AIFace output',
      objective: 'Aggregate specialist outputs into one answer through the AIFace.',
      assignedAgent: 'synthesizer',
      status: 'pending',
      dependencies: ['execute_specialist_work'],
      attempts: 0,
    },
    {
      id: 'review_before_final',
      title: 'Review before final output',
      objective: 'Evaluate output against intent, completeness, coherence, style, and uncertainty.',
      assignedAgent: 'reviewer',
      status: 'pending',
      dependencies: ['synthesize_unified_answer'],
      attempts: 0,
    },
  ];
}

export function buildPlan({ userGoal, memory }) {
  const interpretedIntent = interpretIntent(userGoal, memory);
  const executionMode = chooseExecutionMode(interpretedIntent, userGoal);
  const subtasks = decomposeTask(userGoal, interpretedIntent, executionMode);
  return { interpretedIntent, executionMode, subtasks };
}