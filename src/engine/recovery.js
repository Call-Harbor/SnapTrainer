import { EXECUTION_MODES, RUN_STATUSES } from './contracts.js';

export function decideRecovery(runState, evaluation) {
  if (evaluation.passed) return { action: 'accept' };

  const hasRetry = runState.retries.length > 0;
  if (evaluation.recommendedAction === 'clarify') {
    return {
      action: 'clarify',
      reason: evaluation.notes.join(' '),
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

export function applyRecoveryState(runState, decision) {
  if (decision.action === 'accept') return;

  runState.status = RUN_STATUSES.RECOVERING;
  runState.retries.push({
    target: decision.targetSubtaskId || decision.action,
    reason: decision.reason || '',
    attempt: runState.retries.length + 1,
    ts: new Date().toISOString(),
  });

  if (decision.executionMode) {
    runState.executionMode = decision.executionMode;
  }
}
