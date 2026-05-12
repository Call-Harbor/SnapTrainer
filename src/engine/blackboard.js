import { EXECUTION_MODES, LIFECYCLE_STAGES, RUN_STATUSES, RunStateSchema } from './contracts.js';

function createRunId() {
  return `run_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function createRunState({ userGoal, memory, boundaries }) {
  return {
    runId: createRunId(),
    userGoal,
    interpretedIntent: {
      summary: '',
      goalType: 'unknown',
      needsClarification: false,
      clarificationQuestion: '',
      complexity: 'low',
      confidence: 0,
      constraints: [],
    },
    executionMode: EXECUTION_MODES.DIRECT,
    status: RUN_STATUSES.PLANNING,
    lifecycleStage: LIFECYCLE_STAGES.PLAN,
    subtasks: [],
    checkpoints: [],
    intermediateOutputs: [],
    finalResult: '',
    retries: [],
    evaluationResults: [],
    telemetry: [],
    memory,
    boundaries,
    startedAt: new Date().toISOString(),
  };
}

export function validateRunState(state) {
  return RunStateSchema.parse(state);
}

export function checkpoint(state, label) {
  state.checkpoints.push({
    id: `checkpoint_${state.checkpoints.length + 1}`,
    label,
    ts: new Date().toISOString(),
    state: {
      status: state.status,
      lifecycleStage: state.lifecycleStage,
      subtasks: state.subtasks,
      intermediateOutputs: state.intermediateOutputs,
      finalResult: state.finalResult,
      evaluationResults: state.evaluationResults,
    },
  });
}

export function restoreCheckpoint(state, checkpointId) {
  const point = state.checkpoints.find((item) => item.id === checkpointId);
  if (!point) return state;

  return {
    ...state,
    ...point.state,
    telemetry: state.telemetry,
    retries: state.retries,
    checkpoints: state.checkpoints,
  };
}

export function attachTelemetry(state, telemetry) {
  state.telemetry = telemetry.events;
}
