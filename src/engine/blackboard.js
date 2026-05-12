import { ENGINE_EVENT_TYPES } from './orchestrationEvents.js';
import {
  createInitialRunState,
  recordEngineError,
  setClarificationNeeded,
  touchRunState,
  validateSnapTrainerRunState,
} from './runState.js';

export function createRunState({ userGoal, userId = null, sessionId = null, memory, boundaries }) {
  return createInitialRunState({ userGoal, userId, sessionId, memory, boundaries });
}

export function validateRunState(state) {
  return validateSnapTrainerRunState(state);
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
      evaluation: state.evaluation,
      errors: state.errors,
      retries: state.retries,
    },
  });
  touchRunState(state);
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
  touchRunState(state);
}

export function addSubtasks(state, subtasks, telemetry) {
  state.subtasks = subtasks;
  state.assignedAgents = [...new Set(subtasks.map((task) => task.assignedAgent))];
  subtasks.forEach((task) => {
    telemetry?.record({
      stage: state.currentStage,
      type: ENGINE_EVENT_TYPES.SUBTASK_CREATED,
      message: `Created subtask ${task.id}`,
      data: task,
    });
    telemetry?.record({
      stage: state.currentStage,
      type: ENGINE_EVENT_TYPES.AGENT_ASSIGNED,
      message: `Assigned ${task.assignedAgent} to ${task.id}`,
      data: { subtaskId: task.id, agentId: task.assignedAgent },
    });
  });
  touchRunState(state);
}

export function addRoutingDecision(state, decision, telemetry) {
  state.routingDecisions.push({
    ts: new Date().toISOString(),
    ...decision,
  });
  telemetry?.record({
    stage: state.currentStage,
    type: ENGINE_EVENT_TYPES.EXECUTION_MODE_SELECTED,
    message: `Selected execution mode ${decision.executionMode}`,
    data: decision,
  });
  touchRunState(state);
}

export function addIntermediateOutput(state, output, telemetry) {
  state.intermediateOutputs.push(output);
  state.boundaries.agentGeneratedText.push(output.output);
  touchRunState(state);
  telemetry?.record({
    stage: state.currentStage,
    type: ENGINE_EVENT_TYPES.STATE_TRANSITION,
    message: `Stored output from ${output.agentId}`,
    data: { agentId: output.agentId, subtaskId: output.subtaskId || output.structured?.subtaskId, status: output.status },
  });
}

export function addHandoff(state, handoff, telemetry) {
  const record = {
    ts: new Date().toISOString(),
    ...handoff,
  };
  state.handoffs.push(record);
  telemetry?.record({
    stage: state.currentStage,
    type: ENGINE_EVENT_TYPES.HANDOFF_OCCURRED,
    message: `Handoff to ${handoff.to}`,
    data: record,
  });
  touchRunState(state);
}

export function addFailure(state, failure, telemetry) {
  recordEngineError(state, failure);
  telemetry?.record({
    stage: state.currentStage,
    type: ENGINE_EVENT_TYPES.RUN_FAILED,
    message: failure.cause,
    data: failure,
  });
}

export function requireClarification(state, question, telemetry) {
  setClarificationNeeded(state, question);
  telemetry?.record({
    stage: state.currentStage,
    type: ENGINE_EVENT_TYPES.STATE_TRANSITION,
    message: 'Run requires clarification',
    data: { question: state.clarificationQuestion },
  });
}
