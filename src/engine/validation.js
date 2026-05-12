import { AgentOutputSchema, EvaluationResultSchema, RunStateSchema } from './contracts.js';

export function validateAgentOutput(output) {
  const parsed = AgentOutputSchema.safeParse(output);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.message,
      value: {
        agentId: output?.agentId || 'unknown',
        status: 'failed',
        output: '',
        confidence: 0,
        uncertainty: 'Malformed agent output schema',
        structured: {},
      },
    };
  }
  return { ok: true, value: parsed.data };
}

export function validateEvaluationResult(result) {
  return EvaluationResultSchema.parse(result);
}

export function validateFinalOutput(text) {
  const output = typeof text === 'string' ? text.trim() : '';
  if (!output) {
    return {
      ok: false,
      error: 'Final output is empty',
      output: '',
    };
  }
  return { ok: true, output };
}

export function validateRun(state) {
  return RunStateSchema.parse(state);
}
