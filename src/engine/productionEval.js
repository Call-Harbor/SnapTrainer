export function buildProductionEvalRecord({ aifaceId, ownerFields = {}, aifaceOwnerFields = {}, runState, evaluation }) {
  if (!evaluation) return null;
  return {
    aiface_id: aifaceId,
    ...ownerFields,
    ...aifaceOwnerFields,
    run_id: runState.runId,
    suite: 'production',
    case_id: runState.interpretedIntent.goalType,
    scores: {
      intentMatch: evaluation.intentMatch,
      completeness: evaluation.completeness,
      coherence: evaluation.coherence,
      userStyleAlignment: evaluation.userStyleAlignment,
      confidence: evaluation.confidence,
      overall: evaluation.overall,
    },
    passed: evaluation.passed,
    notes: evaluation.notes.join('\n'),
    raw_result: {
      evaluation,
      executionMode: runState.executionMode,
      complexity: runState.interpretedIntent.complexity,
      retries: runState.retries,
      errors: runState.errors,
    },
  };
}
