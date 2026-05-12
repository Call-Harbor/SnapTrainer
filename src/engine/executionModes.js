export const EXECUTION_MODES = Object.freeze({
  DIRECT: 'direct_response',
  SEQUENTIAL: 'sequential_workflow',
  PARALLEL: 'parallel_workflow',
  DYNAMIC_HANDOFF: 'dynamic_handoff',
  REVIEWER_LOOP: 'reviewer_evaluator_loop',
});

export const RUN_STATUSES = Object.freeze({
  CREATED: 'created',
  PLANNING: 'planning',
  EXECUTING: 'executing',
  EVALUATING: 'evaluating',
  RECOVERING: 'recovering',
  COMPLETED: 'completed',
  NEEDS_CLARIFICATION: 'needs_clarification',
  FAILED: 'failed',
});

export const RUN_STAGES = Object.freeze({
  PLAN: 'plan',
  EXECUTE: 'execute',
  EVALUATE: 'evaluate',
});

export function isParallelExecutionMode(mode) {
  return mode === EXECUTION_MODES.PARALLEL;
}
