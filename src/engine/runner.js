import {
  addHandoff,
  addIntermediateOutput,
  addRoutingDecision,
  addSubtasks,
  attachTelemetry,
  checkpoint,
  createRunState,
  requireClarification,
  validateRunState,
} from './blackboard.js';
import { executeAgent } from './agents.js';
import { buildPlan } from './orchestrator.js';
import { createMemoryPartitions, buildGovernanceBoundaries } from './memory.js';
import { createTelemetry, summarizeLatency } from './telemetry.js';
import { EXECUTION_MODES, RUN_STATUSES } from './executionModes.js';
import { evaluateRun } from './evaluator.js';
import { applyRecoveryState, decideRecovery } from './recovery.js';
import { validateFinalOutput } from './validation.js';
import { markRunCompleted, transitionStage } from './runLifecycle.js';
import { setFinalOutput } from './runState.js';
import { validateStructuredFinalOutput } from './outputValidation.js';
import { ENGINE_EVENT_TYPES } from './orchestrationEvents.js';

function dependenciesMet(subtask, subtasks) {
  return subtask.dependencies.every((id) => subtasks.find((candidate) => candidate.id === id)?.status === 'completed');
}

function priorOutputsFor(subtask, outputs) {
  if (subtask.dependencies.length === 0) return outputs;
  return outputs.filter((output) => subtask.dependencies.includes(output.structured?.subtaskId));
}

async function executeSequential(runState, invokeLLM, telemetry) {
  for (const subtask of runState.subtasks) {
    if (!dependenciesMet(subtask, runState.subtasks)) {
      subtask.status = 'skipped';
      telemetry.record({
        stage: 'execute',
        type: 'state.transition',
        message: `Skipped ${subtask.id}; dependencies not met`,
        data: { dependencies: subtask.dependencies },
      });
      continue;
    }
    const output = await executeAgent({
      runState,
      subtask,
      priorOutputs: priorOutputsFor(subtask, runState.intermediateOutputs),
      invokeLLM,
      telemetry,
    });
    addIntermediateOutput(runState, output, telemetry);
    addHandoff(runState, {
      from: subtask.dependencies.join(', ') || 'run_context',
      to: subtask.id,
      agentId: subtask.assignedAgent,
      payloadRefs: output.structured,
    }, telemetry);
    checkpoint(runState, `after_${subtask.id}`);
  }
}

async function executeParallel(runState, invokeLLM, telemetry) {
  const first = runState.subtasks[0];
  const firstOutput = await executeAgent({
    runState,
    subtask: first,
    priorOutputs: [],
    invokeLLM,
    telemetry,
  });
  addIntermediateOutput(runState, firstOutput, telemetry);
  first.status = firstOutput.status === 'success' ? 'completed' : 'failed';

  const ready = runState.subtasks.slice(1).filter((subtask) => dependenciesMet(subtask, runState.subtasks));
  const outputs = await Promise.all(
    ready.map((subtask) =>
      executeAgent({
        runState,
        subtask,
        priorOutputs: priorOutputsFor(subtask, runState.intermediateOutputs),
        invokeLLM,
        telemetry,
      })
    )
  );
  outputs.forEach((output) => {
    addIntermediateOutput(runState, output, telemetry);
    addHandoff(runState, {
      from: output.structured?.subtaskId || 'parallel_context',
      to: 'parallel_aggregation',
      agentId: output.agentId,
      payloadRefs: output.structured,
    }, telemetry);
  });
  checkpoint(runState, 'after_parallel_execution');
}

function aggregateOutputs(runState) {
  const successful = runState.intermediateOutputs.filter((output) => output.status === 'success' && output.output);
  if (runState.interpretedIntent.needsClarification) {
    return runState.interpretedIntent.clarificationQuestion;
  }
  if (successful.length === 0) {
    return 'I need a bit more information before I can complete this reliably. What outcome should the AIFace optimize for?';
  }

  return successful
    .map((output) => `### ${output.agentId}\n${output.output}`)
    .join('\n\n');
}

async function synthesizeFinal({ runState, invokeLLM, telemetry }) {
  const aggregate = aggregateOutputs(runState);
  if (runState.interpretedIntent.needsClarification) return aggregate;

  const prompt = `${runState.boundaries.systemInstructions.join('\n')}

User goal:
${runState.userGoal}

Interpreted intent:
${runState.interpretedIntent.summary}
${runState.interpretedIntent.repairedGoal ? `Repaired wording: ${runState.interpretedIntent.repairedGoal}` : ''}

Structured intermediate outputs:
${aggregate}

Create the final unified AIFace response. Do not expose raw agent labels unless useful. Preserve user style and state uncertainty clearly.`;

  return telemetry.time(
    {
      stage: 'execute',
      type: 'tool.llm',
      message: 'LLM call for final synthesis',
      data: { runId: runState.runId },
    },
    () => invokeLLM({ prompt, agentId: 'synthesizer', subtask: { id: 'final_synthesis' } })
  );
}

export async function executeSnapTrainerRun({
  userGoal,
  userId = null,
  sessionId = null,
  face,
  sessionMessages,
  feedbackEntries,
  knowledgeItems,
  memoryItems = [],
  invokeLLM,
  onEvent,
}) {
  const memory = createMemoryPartitions({ face, sessionMessages, feedbackEntries, knowledgeItems, memoryItems });
  const boundaries = buildGovernanceBoundaries(memory, userGoal);
  const runState = createRunState({ userGoal, userId, sessionId, memory, boundaries });
  const telemetry = createTelemetry(runState.runId);
  const emit = (event) => {
    telemetry.events.push(event);
    onEvent?.(event, runState);
  };
  const originalRecord = telemetry.record;
  telemetry.record = (eventBase) => {
    const event = originalRecord(eventBase);
    onEvent?.(event, runState);
    return event;
  };

  telemetry.record({
    stage: 'plan',
    type: ENGINE_EVENT_TYPES.RUN_CREATED,
    message: 'Created SnapTrainer run state',
    data: { runId: runState.runId, userId, sessionId },
  });

  transitionStage(runState, 'plan', telemetry, { reason: 'run_initialized' });
  const plan = buildPlan({ userGoal, memory });
  runState.interpretedIntent = plan.interpretedIntent;
  runState.executionMode = plan.executionMode;
  runState.clarificationNeeded = plan.interpretedIntent.needsClarification;
  runState.clarificationQuestion = plan.interpretedIntent.clarificationQuestion || '';
  addSubtasks(runState, plan.subtasks, telemetry);
  addRoutingDecision(runState, {
    executionMode: plan.executionMode,
    complexity: plan.interpretedIntent.complexity,
    needsClarification: plan.interpretedIntent.needsClarification,
    assignedAgents: runState.assignedAgents,
  }, telemetry);
  attachTelemetry(runState, telemetry);
  checkpoint(runState, 'planned');

  telemetry.record({
    stage: 'plan',
    type: ENGINE_EVENT_TYPES.INTENT_INTERPRETED,
    message: 'Intent interpreted',
    data: runState.interpretedIntent,
  });

  telemetry.record({
    stage: 'plan',
    type: ENGINE_EVENT_TYPES.EXECUTION_MODE_SELECTED,
    message: `Selected ${runState.executionMode}`,
    data: {
      complexity: runState.interpretedIntent.complexity,
      needsClarification: runState.interpretedIntent.needsClarification,
      subtasks: runState.subtasks.map((task) => ({ id: task.id, agent: task.assignedAgent })),
    },
  });

  transitionStage(runState, 'execute', telemetry, { reason: 'plan_completed' });

  if (runState.executionMode === EXECUTION_MODES.PARALLEL) {
    await executeParallel(runState, invokeLLM, telemetry);
  } else {
    await executeSequential(runState, invokeLLM, telemetry);
  }

  const finalCandidate = await synthesizeFinal({ runState, invokeLLM, telemetry });
  const finalValidation = validateFinalOutput(finalCandidate);
  const structuredFinalValidation = validateStructuredFinalOutput(finalCandidate);
  if (!structuredFinalValidation.success) {
    telemetry.record({
      stage: 'execute',
      type: ENGINE_EVENT_TYPES.OUTPUT_VALIDATION_FAILED,
      message: 'Final output failed structured validation',
      data: { error: structuredFinalValidation.error.message },
    });
  }
  setFinalOutput(runState, finalValidation.ok ? finalValidation.output : '');

  transitionStage(runState, 'evaluate', telemetry, { reason: 'execution_completed' });
  const evaluation = evaluateRun(runState, runState.finalResult);
  runState.evaluation = evaluation;
  runState.evaluationResults.push(evaluation);

  telemetry.record({
    stage: 'evaluate',
    type: ENGINE_EVENT_TYPES.EVALUATION_COMPLETED,
    message: `Evaluation ${evaluation.passed ? 'passed' : 'failed'} with ${evaluation.overall}`,
    data: evaluation,
  });

  const recovery = decideRecovery(runState, evaluation);
  if (recovery.action !== 'accept') {
    applyRecoveryState(runState, recovery, telemetry);
    telemetry.record({
      stage: 'recover',
      type: 'recovery.decision',
      message: `Recovery action: ${recovery.action}`,
      data: recovery,
    });

    if (recovery.action === 'clarify') {
      runState.status = RUN_STATUSES.NEEDS_CLARIFICATION;
      setFinalOutput(runState, runState.interpretedIntent.clarificationQuestion);
    } else if (recovery.action === 'retry' && recovery.targetSubtaskId) {
      const target = runState.subtasks.find((task) => task.id === recovery.targetSubtaskId);
      if (target) {
        target.status = 'pending';
        const output = await executeAgent({
          runState,
          subtask: target,
          priorOutputs: priorOutputsFor(target, runState.intermediateOutputs),
          invokeLLM,
          telemetry,
        });
        addIntermediateOutput(runState, output, telemetry);
        const retryFinal = validateFinalOutput(await synthesizeFinal({ runState, invokeLLM, telemetry }));
        setFinalOutput(runState, retryFinal.output || runState.finalOutput);
      }
    } else if (recovery.action === 'fallback') {
      setFinalOutput(runState, runState.finalResult || 'I cannot complete this reliably yet. Please clarify the desired outcome, constraints, and audience.');
    }
  }

  if (runState.interpretedIntent.needsClarification) {
    requireClarification(runState, runState.interpretedIntent.clarificationQuestion, telemetry);
    runState.status = RUN_STATUSES.NEEDS_CLARIFICATION;
  }

  markRunCompleted(runState, telemetry);
  telemetry.record({
    stage: 'complete',
    type: ENGINE_EVENT_TYPES.RUN_COMPLETED,
    message: 'Run completed',
    data: {
      status: runState.status,
      totalLatencyMs: summarizeLatency(telemetry.events),
      retries: runState.retries.length,
    },
  });
  attachTelemetry(runState, telemetry);

  const validated = validateRunState(runState);
  emit({
    id: `evt_final_${runState.runId}`,
    runId: runState.runId,
    ts: new Date().toISOString(),
    stage: 'complete',
    type: 'run.validated',
    message: 'Run state schema validated',
    data: {},
  });

  return {
    finalOutput: validated.finalResult,
    runState: validated,
    evaluation: validated.evaluationResults.at(-1),
  };
}
