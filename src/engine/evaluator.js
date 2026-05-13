import { EXECUTION_MODES } from './contracts.js';
import { validateEvaluationResult } from './validation.js';

function scoreIntentMatch(runState, finalOutput) {
  if (runState.interpretedIntent.needsClarification) {
    return finalOutput.includes('?') ? 0.85 : 0.35;
  }
  const goalTerms = runState.userGoal
    .toLowerCase()
    .split(/\W+/)
    .filter((word) => word.length > 4)
    .slice(0, 12);
  if (goalTerms.length === 0) return 0.65;
  const matched = goalTerms.filter((word) => finalOutput.toLowerCase().includes(word)).length;
  return Math.min(1, 0.45 + matched / goalTerms.length);
}

function scoreCompleteness(runState, finalOutput) {
  const completed = runState.subtasks.filter((task) => task.status === 'completed').length;
  const base = runState.subtasks.length ? completed / runState.subtasks.length : 0.6;
  const lengthBonus = finalOutput.length > 240 ? 0.15 : finalOutput.length > 80 ? 0.05 : -0.15;
  return Math.max(0, Math.min(1, base + lengthBonus));
}

function scoreCoherence(finalOutput) {
  if (!finalOutput.trim()) return 0;
  if (finalOutput.length < 40) return 0.45;
  const sentenceCount = finalOutput.split(/[.!?]\s/).filter(Boolean).length;
  return Math.min(1, 0.55 + sentenceCount * 0.08);
}

function scoreStyle(runState, finalOutput) {
  const prefs = runState.memory.preferences.stylePreferences || {};
  let score = 0.7;
  if (prefs.verbosity === 'kort' && finalOutput.length < 800) score += 0.1;
  if (prefs.verbosity === 'detaljeret' && finalOutput.length > 500) score += 0.1;
  if (prefs.language && finalOutput.toLowerCase().includes(String(prefs.language).toLowerCase())) score += 0.05;
  if (runState.memory.preferences.role && finalOutput.length > 60) score += 0.05;
  return Math.min(1, score);
}

export function evaluateRun(runState, finalOutput) {
  const confidenceFromAgents = runState.intermediateOutputs.length
    ? runState.intermediateOutputs.reduce((sum, output) => sum + output.confidence, 0) / runState.intermediateOutputs.length
    : 0.65;

  const result = {
    intentMatch: scoreIntentMatch(runState, finalOutput),
    completeness: scoreCompleteness(runState, finalOutput),
    coherence: scoreCoherence(finalOutput),
    userStyleAlignment: scoreStyle(runState, finalOutput),
    confidence: Math.max(0, Math.min(1, confidenceFromAgents)),
    uncertainty: confidenceFromAgents < 0.55 ? 'Agent confidence is low' : '',
    overall: 0,
    passed: false,
    recommendedAction: 'accept',
    notes: [],
  };

  result.overall = Number((
    result.intentMatch * 0.28 +
    result.completeness * 0.24 +
    result.coherence * 0.18 +
    result.userStyleAlignment * 0.15 +
    result.confidence * 0.15
  ).toFixed(2));

  const threshold = runState.executionMode === EXECUTION_MODES.DIRECT ? 0.62 : 0.72;
  result.passed = result.overall >= threshold;

  if (!result.passed) {
    if (runState.interpretedIntent.needsClarification) {
      result.recommendedAction = 'clarify';
      result.notes.push('Intent is underspecified; ask for clarification.');
    } else if (result.intentMatch < 0.5 && runState.executionMode !== EXECUTION_MODES.DIRECT) {
      result.recommendedAction = 'reroute';
      result.notes.push('Intent match is low; reroute through reviewer/synthesizer instead of asking a generic clarification.');
    } else if (result.completeness < 0.62) {
      result.recommendedAction = 'retry';
      result.notes.push('Completeness is too low; retry the weakest step.');
    } else {
      result.recommendedAction = 'reroute';
      result.notes.push('Reroute through reviewer/synthesizer loop.');
    }
  }

  return validateEvaluationResult(result);
}
