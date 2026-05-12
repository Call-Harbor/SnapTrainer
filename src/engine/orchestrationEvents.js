export const ENGINE_EVENT_TYPES = Object.freeze({
  RUN_CREATED: 'run.created',
  INTENT_INTERPRETED: 'intent.interpreted',
  EXECUTION_MODE_SELECTED: 'execution_mode.selected',
  LIFECYCLE_STAGE_CHANGED: 'lifecycle.stage_changed',
  SUBTASK_CREATED: 'subtask.created',
  AGENT_ASSIGNED: 'agent.assigned',
  HANDOFF_OCCURRED: 'handoff.occurred',
  RETRY_TRIGGERED: 'retry.triggered',
  EVALUATION_COMPLETED: 'evaluation.completed',
  RUN_COMPLETED: 'run.completed',
  RUN_FAILED: 'run.failed',
  OUTPUT_VALIDATION_FAILED: 'output.validation_failed',
  CHECKPOINT_CREATED: 'checkpoint.created',
  STATE_TRANSITION: 'state.transition',
});

export function createEngineEvent({ runId, stage, type, message, data = {}, latencyMs, tokenUsage }) {
  return {
    id: `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    runId,
    ts: new Date().toISOString(),
    stage,
    type,
    message,
    data,
    ...(typeof latencyMs === 'number' ? { latencyMs } : {}),
    ...(tokenUsage ? { tokenUsage } : {}),
  };
}
