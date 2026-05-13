import { z } from 'zod';
import { EXECUTION_MODES, RUN_STAGES, RUN_STATUSES } from './executionModes.js';

export const InterpretedIntentSchema = z.object({
  summary: z.string(),
  goalType: z.string(),
  needsClarification: z.boolean(),
  clarificationQuestion: z.string().optional().default(''),
  complexity: z.enum(['low', 'medium', 'high']),
  confidence: z.number().min(0).max(1),
  constraints: z.array(z.string()).default([]),
  normalizedGoal: z.string().optional().default(''),
  repairedGoal: z.string().optional().default(''),
  promptQuality: z.enum(['clear', 'noisy_repaired']).optional().default('clear'),
});

export const SubtaskStateSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  objective: z.string().min(1),
  assignedAgent: z.string().min(1),
  status: z.enum(['pending', 'running', 'completed', 'failed', 'skipped']).default('pending'),
  dependencies: z.array(z.string()).default([]),
  attempts: z.number().int().min(0).default(0),
  intermediateOutput: z.string().optional().default(''),
  confidence: z.number().min(0).max(1).optional().default(0),
});

export const IntermediateOutputSchema = z.object({
  agentId: z.string().min(1),
  subtaskId: z.string().optional().default(''),
  status: z.enum(['success', 'failed', 'low_confidence']),
  output: z.string().default(''),
  confidence: z.number().min(0).max(1).default(0.7),
  uncertainty: z.string().optional().default(''),
  structured: z.record(z.any()).optional().default({}),
});

export const EvaluationSchema = z.object({
  intentMatch: z.number().min(0).max(1).default(0),
  completeness: z.number().min(0).max(1).default(0),
  coherence: z.number().min(0).max(1).default(0),
  userStyleAlignment: z.number().min(0).max(1).default(0),
  confidence: z.number().min(0).max(1).default(0),
  uncertainty: z.string().default(''),
  overall: z.number().min(0).max(1).default(0),
  passed: z.boolean().default(false),
  recommendedAction: z.enum(['accept', 'retry', 'reroute', 'clarify']).default('accept'),
  notes: z.array(z.string()).default([]),
});

export const EngineErrorSchema = z.object({
  id: z.string(),
  stage: z.string(),
  stepId: z.string().optional().default(''),
  agentId: z.string().optional().default(''),
  cause: z.string(),
  recoverable: z.boolean().default(true),
  ts: z.string(),
});

export const RetryRecordSchema = z.object({
  target: z.string(),
  reason: z.string(),
  attempt: z.number().int().min(1),
  ts: z.string(),
});

export const RunCheckpointSchema = z.object({
  id: z.string(),
  label: z.string(),
  ts: z.string(),
  state: z.record(z.any()),
});

export const SnapTrainerRunStateSchema = z.object({
  runId: z.string().min(1),
  userId: z.string().nullable().default(null),
  sessionId: z.string().nullable().default(null),
  userGoal: z.string().min(1),
  interpretedIntent: InterpretedIntentSchema,
  executionMode: z.nativeEnum(EXECUTION_MODES),
  status: z.nativeEnum(RUN_STATUSES),
  currentStage: z.nativeEnum(RUN_STAGES),
  lifecycleStage: z.nativeEnum(RUN_STAGES),
  subtasks: z.array(SubtaskStateSchema).default([]),
  assignedAgents: z.array(z.string()).default([]),
  intermediateOutputs: z.array(IntermediateOutputSchema).default([]),
  evaluation: EvaluationSchema.nullable().default(null),
  evaluationResults: z.array(EvaluationSchema).default([]),
  retries: z.array(RetryRecordSchema).default([]),
  startedAt: z.string(),
  updatedAt: z.string(),
  completedAt: z.string().nullable().default(null),
  finalOutput: z.string().default(''),
  finalResult: z.string().default(''),
  errors: z.array(EngineErrorSchema).default([]),
  clarificationNeeded: z.boolean().default(false),
  clarificationQuestion: z.string().default(''),
  checkpoints: z.array(RunCheckpointSchema).default([]),
  routingDecisions: z.array(z.record(z.any())).default([]),
  handoffs: z.array(z.record(z.any())).default([]),
  telemetry: z.array(z.record(z.any())).default([]),
  memory: z.object({
    session: z.record(z.any()).default({}),
    preferences: z.record(z.any()).default({}),
    workflow: z.record(z.any()).default({}),
  }),
  boundaries: z.object({
    systemInstructions: z.array(z.string()).default([]),
    userInstructions: z.array(z.string()).default([]),
    retrievedMemory: z.array(z.string()).default([]),
    uploadedSourceMaterial: z.array(z.string()).default([]),
    agentGeneratedText: z.array(z.string()).default([]),
  }),
});

function createRunId() {
  return `run_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function createInitialRunState({ userGoal, userId = null, sessionId = null, memory, boundaries }) {
  const now = new Date().toISOString();
  return {
    runId: createRunId(),
    userId,
    sessionId,
    userGoal,
    interpretedIntent: {
      summary: '',
      goalType: 'unknown',
      needsClarification: false,
      clarificationQuestion: '',
      complexity: 'low',
      confidence: 0,
      constraints: [],
      normalizedGoal: '',
      repairedGoal: '',
      promptQuality: 'clear',
    },
    executionMode: EXECUTION_MODES.DIRECT,
    status: RUN_STATUSES.CREATED,
    currentStage: RUN_STAGES.PLAN,
    lifecycleStage: RUN_STAGES.PLAN,
    subtasks: [],
    assignedAgents: [],
    intermediateOutputs: [],
    evaluation: null,
    evaluationResults: [],
    retries: [],
    startedAt: now,
    updatedAt: now,
    completedAt: null,
    finalOutput: '',
    finalResult: '',
    errors: [],
    clarificationNeeded: false,
    clarificationQuestion: '',
    checkpoints: [],
    routingDecisions: [],
    handoffs: [],
    telemetry: [],
    memory,
    boundaries,
  };
}

export function touchRunState(runState) {
  runState.updatedAt = new Date().toISOString();
  return runState;
}

export function validateSnapTrainerRunState(runState) {
  return SnapTrainerRunStateSchema.parse(runState);
}

export function setFinalOutput(runState, output) {
  runState.finalOutput = output;
  runState.finalResult = output;
  touchRunState(runState);
}

export function setClarificationNeeded(runState, question) {
  runState.clarificationNeeded = true;
  runState.clarificationQuestion = question || runState.interpretedIntent.clarificationQuestion || '';
  touchRunState(runState);
}

export function recordEngineError(runState, { stage, stepId = '', agentId = '', cause, recoverable = true }) {
  runState.errors.push({
    id: `err_${runState.errors.length + 1}`,
    stage,
    stepId,
    agentId,
    cause,
    recoverable,
    ts: new Date().toISOString(),
  });
  touchRunState(runState);
}
