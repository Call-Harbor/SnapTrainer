import { attachTelemetry, checkpoint, createRunState, validateRunState } from './blackboard.js';
import { executeAgent } from './agents.js';
import { buildPlan } from './orchestrator.js';
import { createMemoryPartitions, buildGovernanceBoundaries } from './memory.js';
import { createTelemetry, summarizeLatency } from './telemetry.js';
import { EXECUTION_MODES, LIFECYCLE_STAGES, RUN_STATUSES } from './contracts.js';
import { evaluateRun } from './evaluator.js';
import { applyRecoveryState, decideRecovery } from './recovery.js';
import { validateFinalOutput } from './validation.js';

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
    runState.intermediateOutputs.push(output);
    runState.boundaries.agentGeneratedText.push(output.output);
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
  runState.intermediateOutputs.push(firstOutput);
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
    runState.intermediateOutputs.push(output);
    runState.boundaries.agentGeneratedText.push(output.output);
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
  face,
  sessionMessages,
  feedbackEntries,
  knowledgeItems,
  invokeLLM,
  onEvent,
}) {
  const memory = createMemoryPartitions({ face, sessionMessages, feedbackEntries, knowledgeItems });
  const boundaries = buildGovernanceBoundaries(memory, userGoal);
  const runState = createRunState({ userGoal, memory, boundaries });
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
    type: 'run.created',
    message: 'Created SnapTrainer run state',
    data: { runId: runState.runId },
  });

  const plan = buildPlan({ userGoal, memory });
  runState.interpretedIntent = plan.interpretedIntent;
  runState.executionMode = plan.executionMode;
  runState.subtasks = plan.subtasks;
  attachTelemetry(runState, telemetry);
  checkpoint(runState, 'planned');

  telemetry.record({
    stage: 'plan',
    type: 'orchestration.decision',
    message: `Selected ${runState.executionMode}`,
    data: {
      complexity: runState.interpretedIntent.complexity,
      needsClarification: runState.interpretedIntent.needsClarification,
      subtasks: runState.subtasks.map((task) => ({ id: task.id, agent: task.assignedAgent })),
    },
  });

  runState.status = RUN_STATUSES.EXECUTING;
  runState.lifecycleStage = LIFECYCLE_STAGES.EXECUTE;

  if (runState.executionMode === EXECUTION_MODES.PARALLEL) {
    await executeParallel(runState, invokeLLM, telemetry);
  } else {
    await executeSequential(runState, invokeLLM, telemetry);
  }

  const finalCandidate = await synthesizeFinal({ runState, invokeLLM, telemetry });
  const finalValidation = validateFinalOutput(finalCandidate);
  runState.finalResult = finalValidation.ok ? finalValidation.output : '';

  runState.status = RUN_STATUSES.EVALUATING;
  runState.lifecycleStage = LIFECYCLE_STAGES.EVALUATE;
  const evaluation = evaluateRun(runState, runState.finalResult);
  runState.evaluationResults.push(evaluation);

  telemetry.record({
    stage: 'evaluate',
    type: 'evaluation.score',
    message: `Evaluation ${evaluation.passed ? 'passed' : 'failed'} with ${evaluation.overall}`,
    data: evaluation,
  });

  const recovery = decideRecovery(runState, evaluation);
  if (recovery.action !== 'accept') {
    applyRecoveryState(runState, recovery);
    telemetry.record({
      stage: 'recover',
      type: 'recovery.decision',
      message: `Recovery action: ${recovery.action}`,
      data: recovery,
    });

    if (recovery.action === 'clarify') {
      runState.status = RUN_STATUSES.NEEDS_CLARIFICATION;
      runState.finalResult = runState.interpretedIntent.clarificationQuestion;
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
        runState.intermediateOutputs.push(output);
        runState.finalResult = validateFinalOutput(await synthesizeFinal({ runState, invokeLLM, telemetry })).output;
      }
    } else if (recovery.action === 'fallback') {
      runState.finalResult = runState.finalResult || 'I cannot complete this reliably yet. Please clarify the desired outcome, constraints, and audience.';
    }
  }

  if (runState.interpretedIntent.needsClarification) {
    runState.status = RUN_STATUSES.NEEDS_CLARIFICATION;
  }

  runState.status = runState.status === RUN_STATUSES.NEEDS_CLARIFICATION
    ? RUN_STATUSES.NEEDS_CLARIFICATION
    : RUN_STATUSES.COMPLETED;
  runState.completedAt = new Date().toISOString();
  telemetry.record({
    stage: 'complete',
    type: 'run.completed',
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
