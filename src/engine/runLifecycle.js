import { RUN_STAGES, RUN_STATUSES } from './executionModes.js';
import { ENGINE_EVENT_TYPES } from './orchestrationEvents.js';
import { touchRunState } from './runState.js';

const allowedStageTransitions = {
  [RUN_STAGES.PLAN]: new Set([RUN_STAGES.EXECUTE]),
  [RUN_STAGES.EXECUTE]: new Set([RUN_STAGES.EVALUATE]),
  [RUN_STAGES.EVALUATE]: new Set([]),
};

const stageStatus = {
  [RUN_STAGES.PLAN]: RUN_STATUSES.PLANNING,
  [RUN_STAGES.EXECUTE]: RUN_STATUSES.EXECUTING,
  [RUN_STAGES.EVALUATE]: RUN_STATUSES.EVALUATING,
};

export function transitionStage(runState, nextStage, telemetry, data = {}) {
  const current = runState.currentStage || runState.lifecycleStage || RUN_STAGES.PLAN;
  const allowed = allowedStageTransitions[current]?.has(nextStage);

  if (current !== nextStage && !allowed) {
    const message = `Invalid lifecycle transition ${current} -> ${nextStage}`;
    telemetry?.record({
      stage: current,
      type: ENGINE_EVENT_TYPES.RUN_FAILED,
      message,
      data: { current, nextStage, ...data },
    });
    throw new Error(message);
  }

  runState.currentStage = nextStage;
  runState.lifecycleStage = nextStage;
  runState.status = stageStatus[nextStage] || runState.status;
  touchRunState(runState);

  telemetry?.record({
    stage: nextStage,
    type: ENGINE_EVENT_TYPES.LIFECYCLE_STAGE_CHANGED,
    message: `Lifecycle stage changed to ${nextStage}`,
    data: { from: current, to: nextStage, ...data },
  });
}

export function markRunCompleted(runState, telemetry) {
  runState.status = runState.clarificationNeeded
    ? RUN_STATUSES.NEEDS_CLARIFICATION
    : RUN_STATUSES.COMPLETED;
  runState.completedAt = new Date().toISOString();
  touchRunState(runState);
  telemetry?.record({
    stage: runState.currentStage,
    type: ENGINE_EVENT_TYPES.RUN_COMPLETED,
    message: 'Run completed',
    data: { status: runState.status },
  });
}

export function markRunFailed(runState, telemetry, error) {
  runState.status = RUN_STATUSES.FAILED;
  runState.completedAt = new Date().toISOString();
  touchRunState(runState);
  telemetry?.record({
    stage: runState.currentStage,
    type: ENGINE_EVENT_TYPES.RUN_FAILED,
    message: error?.message || 'Run failed',
    data: { error: error?.message || String(error) },
  });
}
