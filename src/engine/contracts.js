import { z } from 'zod';
import { EXECUTION_MODES, RUN_STAGES, RUN_STATUSES } from './executionModes.js';
import {
  EvaluationSchema,
  SnapTrainerRunStateSchema,
  SubtaskStateSchema,
} from './runState.js';

export { EXECUTION_MODES, RUN_STAGES, RUN_STATUSES };
export const LIFECYCLE_STAGES = RUN_STAGES;

export const AgentOutputSchema = z.object({
  agentId: z.string().min(1),
  subtaskId: z.string().optional().default(''),
  status: z.enum(['success', 'failed', 'low_confidence']),
  output: z.string().default(''),
  confidence: z.number().min(0).max(1).default(0.7),
  uncertainty: z.string().optional().default(''),
  structured: z.record(z.any()).optional().default({}),
});

export const SubtaskSchema = SubtaskStateSchema;

export const EvaluationResultSchema = EvaluationSchema;

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

export const RunStateSchema = SnapTrainerRunStateSchema.extend({
  telemetry: z.array(TelemetryEventSchema).default([]),
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
