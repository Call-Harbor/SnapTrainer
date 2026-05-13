import { EXECUTION_MODES, RUN_STATUSES } from './contracts.js';
import { recordRetry } from './retryPolicy.js';

export function decideRecovery(runState, evaluation) {
  if (evaluation.passed) return { action: 'accept' };

  const hasRetry = runState.retries.length > 0;
  if (evaluation.recommendedAction === 'clarify' && runState.interpretedIntent.needsClarification) {
    return {
      action: 'clarify',
      reason: evaluation.notes.join(' '),
    };
  }

  if (evaluation.recommendedAction === 'clarify') {
    return {
      action: hasRetry ? 'fallback' : 'retry',
      targetSubtaskId: [...runState.subtasks].reverse().find((task) => task.status === 'completed')?.id,
      reason: 'Clarification was requested by evaluator, but interpreted intent is actionable; retrying/falling back instead.',
    };
  }

  if (!hasRetry && evaluation.recommendedAction === 'retry') {
    const target = runState.subtasks.find((task) => task.status === 'failed')
      || [...runState.subtasks].reverse().find((task) => task.status === 'completed');
    return {
      action: 'retry',
      targetSubtaskId: target?.id,
      reason: evaluation.notes.join(' '),
    };
  }

  if (!hasRetry && evaluation.recommendedAction === 'reroute') {
    return {
      action: 'reroute',
      reason: evaluation.notes.join(' '),
      executionMode: EXECUTION_MODES.REVIEWER_LOOP,
    };
  }

  return {
    action: 'fallback',
    reason: 'Recovery attempts exhausted; fallback to a clear clarification-safe answer.',
  };
}

export function applyRecoveryState(runState, decision, telemetry) {
  if (decision.action === 'accept') return;

  runState.status = RUN_STATUSES.RECOVERING;
  recordRetry(runState, {
    target: decision.targetSubtaskId || decision.action,
    reason: decision.reason || '',
  }, telemetry);

  if (decision.executionMode) {
    runState.executionMode = decision.executionMode;
  }
}
