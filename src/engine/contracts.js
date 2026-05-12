import { z } from 'zod';

export const EXECUTION_MODES = {
  DIRECT: 'direct_response',
  SEQUENTIAL: 'sequential_workflow',
  PARALLEL: 'parallel_workflow',
  DYNAMIC_HANDOFF: 'dynamic_handoff',
  REVIEWER_LOOP: 'reviewer_evaluator_loop',
};

export const RUN_STATUSES = {
  PLANNING: 'planning',
  EXECUTING: 'executing',
  EVALUATING: 'evaluating',
  RECOVERING: 'recovering',
  COMPLETED: 'completed',
  NEEDS_CLARIFICATION: 'needs_clarification',
  FAILED: 'failed',
};

export const LIFECYCLE_STAGES = {
  PLAN: 'plan',
  EXECUTE: 'execute',
  EVALUATE: 'evaluate',
};

export const AgentOutputSchema = z.object({
  agentId: z.string().min(1),
  status: z.enum(['success', 'failed', 'low_confidence']),
  output: z.string().default(''),
  confidence: z.number().min(0).max(1).default(0.7),
  uncertainty: z.string().optional().default(''),
  structured: z.record(z.any()).optional().default({}),
});

export const SubtaskSchema = z.object({
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

export const EvaluationResultSchema = z.object({
  intentMatch: z.number().min(0).max(1),
  completeness: z.number().min(0).max(1),
  coherence: z.number().min(0).max(1),
  userStyleAlignment: z.number().min(0).max(1),
  confidence: z.number().min(0).max(1),
  uncertainty: z.string().default(''),
  overall: z.number().min(0).max(1),
  passed: z.boolean(),
  recommendedAction: z.enum(['accept', 'retry', 'reroute', 'clarify']),
  notes: z.array(z.string()).default([]),
});

export const TelemetryEventSchema = z.object({
  id: z.string().min(1),
  runId: z.string().min(1),
  ts: z.string().min(1),
  stage: z.string().min(1),
  type: z.string().min(1),
  message: z.string().min(1),
  data: z.record(z.any()).default({}),
  latencyMs: z.number().optional(),
  tokenUsage: z.record(z.any()).optional(),
});

export const RunStateSchema = z.object({
  runId: z.string().min(1),
  userGoal: z.string().min(1),
  interpretedIntent: z.object({
    summary: z.string(),
    goalType: z.string(),
    needsClarification: z.boolean(),
    clarificationQuestion: z.string().optional().default(''),
    complexity: z.enum(['low', 'medium', 'high']),
    confidence: z.number().min(0).max(1),
    constraints: z.array(z.string()).default([]),
  }),
  executionMode: z.nativeEnum(EXECUTION_MODES),
  status: z.string(),
  lifecycleStage: z.string(),
  subtasks: z.array(SubtaskSchema),
  checkpoints: z.array(z.object({
    id: z.string(),
    label: z.string(),
    ts: z.string(),
    state: z.record(z.any()),
  })).default([]),
  intermediateOutputs: z.array(AgentOutputSchema).default([]),
  finalResult: z.string().default(''),
  retries: z.array(z.object({
    target: z.string(),
    reason: z.string(),
    attempt: z.number(),
    ts: z.string(),
  })).default([]),
  evaluationResults: z.array(EvaluationResultSchema).default([]),
  telemetry: z.array(TelemetryEventSchema).default([]),
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
  startedAt: z.string(),
  completedAt: z.string().optional(),
});

export function safeParseJsonObject(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
}
