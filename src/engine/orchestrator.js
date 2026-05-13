import { EXECUTION_MODES } from './contracts.js';

const signals = {
  multiStep: ['plan', 'roadmap', 'step', 'workflow', 'sequence', 'first', 'then', 'after'],
  parallel: ['compare', 'research', 'analyze', 'market', 'options', 'alternatives', 'pros and cons'],
  memory: ['my style', 'my files', 'remember', 'previous', 'as before', 'my notes'],
  unclear: ['make it better', 'fix this', 'what should i do', 'improve this', 'do it'],
  conflict: ['but do not', 'ignore previous', 'even if', 'contradict', 'conflicting'],
  highRisk: ['legal', 'medical', 'financial advice', 'private', 'sensitive', 'security'],
  conversational: ['hi', 'hello', 'hey', 'thanks', 'thank you', 'ok', 'yes', 'no'],
  actionable: [
    'write', 'draft', 'create', 'make', 'build', 'explain', 'summarize', 'translate',
    'brainstorm', 'list', 'help me', 'show me', 'tell me', 'analyze', 'plan',
  ],
};

function includesAny(text, items) {
  return items.some((item) => text.includes(item));
}

export function interpretIntent(userGoal, memory) {
  const text = userGoal.toLowerCase();
  const trimmed = userGoal.trim();
  const constraints = [];
  if (includesAny(text, signals.conflict)) constraints.push('conflicting_instructions');
  if (includesAny(text, signals.highRisk)) constraints.push('high_risk_or_sensitive');
  if (memory.workflow.knowledgeCount > 0 || includesAny(text, signals.memory)) constraints.push('memory_dependent');

  const isConversational = signals.conversational.includes(text.trim().replace(/[.!?]+$/, ''));
  const hasActionableSignal = includesAny(text, signals.actionable)
    || includesAny(text, signals.multiStep)
    || includesAny(text, signals.parallel)
    || text.includes('?');

  // Only ask for clarification if the message is extremely short (1-2 words) AND has no actionable signal
  const needsClarification =
    !isConversational &&
    trimmed.split(/\s+/).length <= 2 &&
    !hasActionableSignal &&
    trimmed.length < 12;

  const signalCount = [
    includesAny(text, signals.multiStep),
    includesAny(text, signals.parallel),
    includesAny(text, signals.memory),
    includesAny(text, signals.conflict),
    includesAny(text, signals.highRisk),
  ].filter(Boolean).length;

  const complexity = userGoal.length > 360 || signalCount >= 3
    ? 'high'
    : userGoal.length > 140 || signalCount >= 2
      ? 'medium'
      : 'low';

  return {
    summary: needsClarification
      ? 'The request is underspecified and may require clarification.'
      : `The user wants: ${userGoal.slice(0, 180)}`,
    goalType: includesAny(text, signals.multiStep)
      ? 'workflow'
      : includesAny(text, signals.parallel)
        ? 'analysis'
        : includesAny(text, signals.memory)
          ? 'personalized_memory_task'
          : 'general_assistance',
    needsClarification,
    clarificationQuestion: needsClarification
      ? 'Can you share the intended outcome, audience, and any constraints before I proceed?'
      : '',
    complexity,
    confidence: needsClarification ? 0.45 : complexity === 'high' ? 0.72 : 0.82,
    constraints,
  };
}

export function chooseExecutionMode(intent, userGoal) {
  const text = userGoal.toLowerCase();
  if (intent.needsClarification) return EXECUTION_MODES.DIRECT;
  if (intent.complexity === 'high') return EXECUTION_MODES.REVIEWER_LOOP;
  if (includesAny(text, signals.multiStep)) return EXECUTION_MODES.SEQUENTIAL;
  if (includesAny(text, signals.parallel)) return EXECUTION_MODES.PARALLEL;
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
      objective: 'Restate the user goal, constraints, and success criteria.',
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
        objective: userGoal,
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
        objective: 'Execute the plan using prior output as structured handoff context.',
        assignedAgent: agentForGoal(intent.goalType, userGoal),
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
      objective: 'Split the request into specialist workstreams and explicit success criteria.',
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