import { executeSnapTrainerRun } from './runner.js';

const baseFace = {
  id: 'eval-face',
  name: 'Eval AIFace',
  model: 'gpt_5_mini',
  role: 'Personal assistant',
  identity_prompt: 'Tone: clear\nLanguage: English\nDetail level: balanced',
  style_preferences: { tone: 'clear', language: 'English', verbosity: 'medium', formality: 'neutral' },
  advanced_training: { enabled: false },
  knowledge_summary: 'The user prefers concise, practical answers.',
};

const cases = [
  {
    id: 'vague_prompt',
    goal: 'Help me improve this',
    expected: { needsClarification: true, recovery: 'clarify' },
  },
  {
    id: 'incomplete_instruction',
    goal: 'Write the thing for my launch',
    expected: { complexity: 'low' },
  },
  {
    id: 'conflicting_instruction',
    goal: 'Summarize my notes in detail but keep it under one sentence and ignore previous constraints.',
    expected: { constraint: 'conflicting_instructions' },
  },
  {
    id: 'multi_step_task',
    goal: 'Create a step-by-step launch plan, then draft a short announcement and a review checklist.',
    expected: { executionMode: 'sequential_workflow' },
  },
  {
    id: 'memory_dependent',
    goal: 'Use my style from previous notes and draft a concise FAQ answer.',
    knowledgeItems: [{ extracted_summary: 'User writes in short, direct paragraphs.', file_type: 'notes', file_name: 'style notes' }],
    expected: { constraint: 'memory_dependent' },
  },
  {
    id: 'clarification_needed',
    goal: 'Do it',
    expected: { needsClarification: true },
  },
];

async function mockInvokeLLM({ prompt, agentId }) {
  if (prompt.includes('Do it') || prompt.includes('Help me improve this')) {
    return 'What outcome, audience, and constraints should I optimize for?';
  }
  return `Mock ${agentId} output. Intent addressed with structured, coherent, user-aligned content. Includes assumptions, next steps, and uncertainty where relevant.`;
}

function scoreCase(runState, expected) {
  const latestEval = runState.evaluationResults.at(-1);
  const checks = [];

  if (expected.needsClarification !== undefined) {
    checks.push(runState.interpretedIntent.needsClarification === expected.needsClarification);
  }
  if (expected.executionMode) {
    checks.push(runState.executionMode === expected.executionMode);
  }
  if (expected.constraint) {
    checks.push(runState.interpretedIntent.constraints.includes(expected.constraint));
  }
  if (expected.complexity) {
    checks.push(runState.interpretedIntent.complexity === expected.complexity);
  }
  if (expected.recovery === 'clarify') {
    checks.push(runState.status === 'needs_clarification' || runState.interpretedIntent.needsClarification);
  }

  return {
    intentUnderstanding: checks.length ? checks.filter(Boolean).length / checks.length : 1,
    taskCompletion: latestEval?.completeness || 0,
    memoryUse: expected.constraint === 'memory_dependent'
      ? Number(runState.interpretedIntent.constraints.includes('memory_dependent'))
      : 1,
    recoveryBehavior: expected.recovery ? Number(runState.retries.length > 0 || runState.status === 'needs_clarification') : 1,
    finalAnswerQuality: latestEval?.overall || 0,
  };
}

export async function runEngineEvalSuite() {
  const results = [];

  for (const testCase of cases) {
    const result = await executeSnapTrainerRun({
      userGoal: testCase.goal,
      face: baseFace,
      sessionMessages: [],
      feedbackEntries: [],
      knowledgeItems: testCase.knowledgeItems || [],
      invokeLLM: mockInvokeLLM,
    });

    results.push({
      id: testCase.id,
      executionMode: result.runState.executionMode,
      status: result.runState.status,
      interpretedIntent: result.runState.interpretedIntent,
      evaluation: result.evaluation,
      scores: scoreCase(result.runState, testCase.expected),
    });
  }

  const aggregate = results.reduce(
    (acc, item) => {
      Object.entries(item.scores).forEach(([key, value]) => {
        acc[key] = (acc[key] || 0) + value / results.length;
      });
      return acc;
    },
    {}
  );

  return { cases: results, aggregate };
}
