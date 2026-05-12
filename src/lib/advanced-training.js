export const defaultAdvancedTrainingConfig = {
  enabled: false,
  mode: 'guided',
  training_objective: '',
  system_directives: '',
  output_contract: '',
  negative_constraints: '',
  few_shot_examples: '',
  evaluation_criteria: '',
  memory_policy: 'adaptive',
  context_strategy: 'balanced',
  preferred_collaboration_mode: 'auto',
  specialist_routing_notes: '',
  confidence_policy: 'state_uncertainty',
};

export function normalizeAdvancedTrainingConfig(config = {}) {
  return {
    ...defaultAdvancedTrainingConfig,
    ...config,
  };
}

export function summarizeAdvancedTrainingForPrompt(config = {}) {
  const training = normalizeAdvancedTrainingConfig(config);
  if (!training.enabled) return '';

  const parts = [
    `Advanced training: ${training.mode}`,
    training.training_objective && `Goal: ${training.training_objective}`,
    training.preferred_collaboration_mode !== 'auto' &&
      `Preferred orchestration: ${training.preferred_collaboration_mode}`,
    training.memory_policy && `Memory-policy: ${training.memory_policy}`,
    training.context_strategy && `Context strategy: ${training.context_strategy}`,
  ].filter(Boolean);

  return parts.join('\n');
}

export function formatAdvancedTrainingForPrompt(config = {}) {
  const training = normalizeAdvancedTrainingConfig(config);
  if (!training.enabled) return '';

  const sections = [
    ['Training objective', training.training_objective],
    ['Expert system directives', training.system_directives],
    ['Output contract', training.output_contract],
    ['Negative constraints', training.negative_constraints],
    ['Few-shot examples', training.few_shot_examples],
    ['Evaluation criteria', training.evaluation_criteria],
    ['Specialist routing notes', training.specialist_routing_notes],
  ]
    .filter(([, value]) => value?.trim())
    .map(([label, value]) => `${label}:\n${value}`);

  const policies = [
    `Mode: ${training.mode}`,
    `Memory policy: ${training.memory_policy}`,
    `Context strategy: ${training.context_strategy}`,
    `Preferred collaboration mode: ${training.preferred_collaboration_mode}`,
    `Confidence policy: ${training.confidence_policy}`,
  ].join('\n');

  return `Advanced training configuration:
${policies}

${sections.join('\n\n')}`;
}
