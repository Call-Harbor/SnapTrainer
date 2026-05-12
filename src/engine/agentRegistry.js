export const AGENT_REGISTRY = {
  intent: {
    name: 'Intent parser',
    purpose: 'Interpret goals, ambiguity and constraints.',
    modelPreference: 'fast',
    outputContract: 'Return intent summary, constraints and uncertainty.',
  },
  memory: {
    name: 'Memory specialist',
    purpose: 'Select relevant long-term memories and source context.',
    modelPreference: 'fast',
    outputContract: 'Return only memory-grounded context and caveats.',
  },
  planner: {
    name: 'Planner',
    purpose: 'Create ordered, dependency-aware plans.',
    modelPreference: 'reasoning',
    outputContract: 'Return steps, dependencies and risks.',
  },
  research: {
    name: 'Research specialist',
    purpose: 'Extract facts, assumptions and knowledge gaps.',
    modelPreference: 'research',
    outputContract: 'Return factual findings and uncertainty.',
  },
  analyst: {
    name: 'Analyst',
    purpose: 'Evaluate tradeoffs, causes and decision points.',
    modelPreference: 'reasoning',
    outputContract: 'Return analysis, tradeoffs and recommendation candidates.',
  },
  writer: {
    name: 'Writer',
    purpose: 'Produce user-facing content in the AIFace style.',
    modelPreference: 'writing',
    outputContract: 'Return polished text aligned with style preferences.',
  },
  organizer: {
    name: 'Organizer',
    purpose: 'Make outputs structured and actionable.',
    modelPreference: 'fast',
    outputContract: 'Return organized sections and next steps.',
  },
  reviewer: {
    name: 'Reviewer',
    purpose: 'Check correctness, completeness, style and uncertainty.',
    modelPreference: 'reasoning',
    outputContract: 'Return review findings and pass/fail rationale.',
  },
  synthesizer: {
    name: 'Synthesizer',
    purpose: 'Unify multiple specialist outputs into one AIFace answer.',
    modelPreference: 'reasoning',
    outputContract: 'Return one coherent final response.',
  },
  executor: {
    name: 'Executor',
    purpose: 'Complete direct work when no specialist is required.',
    modelPreference: 'fast',
    outputContract: 'Return task output and uncertainty.',
  },
};

export function getAgentDefinition(agentId) {
  return AGENT_REGISTRY[agentId] || {
    name: agentId,
    purpose: 'General specialist task execution.',
    modelPreference: 'fast',
    outputContract: 'Return useful intermediate work.',
  };
}

export function resolveAgentModel(agentId, baseModel) {
  const definition = getAgentDefinition(agentId);
  if (definition.modelPreference === 'writing' && baseModel?.includes('claude')) return baseModel;
  if (definition.modelPreference === 'reasoning' && baseModel) return baseModel;
  if (definition.modelPreference === 'research' && baseModel) return baseModel;
  return baseModel || 'gpt_5_mini';
}
