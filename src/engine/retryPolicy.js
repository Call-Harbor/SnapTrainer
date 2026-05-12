import { ENGINE_EVENT_TYPES } from './orchestrationEvents.js';
import { touchRunState } from './runState.js';

export const DEFAULT_RETRY_LIMITS = Object.freeze({
  perStep: 1,
  perRun: 2,
});

export function countRetriesForTarget(runState, target) {
  return runState.retries.filter((retry) => retry.target === target).length;
}

export function canRetry(runState, target, limits = DEFAULT_RETRY_LIMITS) {
  return (
    runState.retries.length < limits.perRun &&
    countRetriesForTarget(runState, target) < limits.perStep
  );
}

export function recordRetry(runState, { target, reason }, telemetry, limits = DEFAULT_RETRY_LIMITS) {
  if (!canRetry(runState, target, limits)) {
    return false;
  }

  const retry = {
    target,
    reason,
    attempt: countRetriesForTarget(runState, target) + 1,
    ts: new Date().toISOString(),
  };
  runState.retries.push(retry);
  touchRunState(runState);
  telemetry?.record({
    stage: runState.currentStage,
    type: ENGINE_EVENT_TYPES.RETRY_TRIGGERED,
    message: `Retry triggered for ${target}`,
    data: retry,
  });
  return true;
}
