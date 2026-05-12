import { formatAdvancedTrainingForPrompt } from '../lib/advanced-training.js';

function compactMessages(messages = [], limit = 12) {
  return messages.slice(-limit).map((message) => ({
    role: message.role,
    content: message.content,
    created_date: message.created_date,
  }));
}

export function createMemoryPartitions({ face, sessionMessages, feedbackEntries, knowledgeItems, memoryItems = [] }) {
  const styleHints = feedbackEntries
    .filter((entry) => entry.feedback_type === 'style_hint' && entry.feedback_text)
    .map((entry) => entry.feedback_text);

  const retrievedMemory = knowledgeItems
    .filter((item) => item.extracted_summary || item.training_text)
    .map((item) => ({
      source: item.file_name || item.source_url || item.file_type,
      type: item.file_type,
      content: item.extracted_summary || item.training_text,
    }));

  const preferences = {
    name: face?.name,
    role: face?.role,
    model: face?.model,
    identityPrompt: face?.identity_prompt,
    knowledgeSummary: face?.knowledge_summary,
    stylePreferences: face?.style_preferences || {},
    advancedTraining: face?.advanced_training || {},
    styleHints,
  };

  return {
    session: {
      activeMessages: compactMessages(sessionMessages),
      lastUserMessage: compactMessages(sessionMessages).filter((m) => m.role === 'user').at(-1)?.content || '',
    },
    preferences,
    workflow: {
      retrievedMemory,
      knowledgeCount: knowledgeItems.length,
      feedbackCount: feedbackEntries.length,
      longTermMemories: memoryItems
        .filter((item) => item.status !== 'archived')
        .map((item) => ({
          type: item.memory_type,
          title: item.title,
          content: item.content,
          confidence: item.confidence,
          pinned: item.pinned,
          source: item.source,
        })),
    },
  };
}

export function buildGovernanceBoundaries(memory, userGoal) {
  const advancedTraining = formatAdvancedTrainingForPrompt(memory.preferences.advancedTraining);

  return {
    systemInstructions: [
      'SnapTrainer has one user-facing intelligence layer: the AIFace.',
      'Specialist agents may produce intermediate work, but the final response must be unified.',
      advancedTraining,
    ].filter(Boolean),
    userInstructions: [userGoal],
    retrievedMemory: [
      memory.preferences.identityPrompt,
      memory.preferences.knowledgeSummary,
      ...memory.preferences.styleHints,
      ...memory.workflow.longTermMemories.map((item) => `${item.title}: ${item.content}`),
    ].filter(Boolean),
    uploadedSourceMaterial: memory.workflow.retrievedMemory.map((item) => `[${item.type}] ${item.source}: ${item.content}`),
    agentGeneratedText: [],
  };
}

export function buildAgentContext({ runState, subtask, priorOutputs = [] }) {
  const { boundaries, memory } = runState;

  return [
    '<SYSTEM_INSTRUCTIONS>',
    boundaries.systemInstructions.join('\n'),
    '</SYSTEM_INSTRUCTIONS>',
    '<USER_GOAL>',
    runState.userGoal,
    '</USER_GOAL>',
    '<USER_PREFERENCES>',
    JSON.stringify(memory.preferences, null, 2),
    '</USER_PREFERENCES>',
    '<SESSION_MEMORY>',
    JSON.stringify(memory.session.activeMessages, null, 2),
    '</SESSION_MEMORY>',
    '<RETRIEVED_MEMORY>',
    boundaries.retrievedMemory.join('\n\n'),
    '</RETRIEVED_MEMORY>',
    '<SOURCE_MATERIAL>',
    boundaries.uploadedSourceMaterial.join('\n\n'),
    '</SOURCE_MATERIAL>',
    '<WORKFLOW_STATE>',
    JSON.stringify({
      runId: runState.runId,
      intent: runState.interpretedIntent,
      executionMode: runState.executionMode,
      subtask,
      priorOutputs,
    }, null, 2),
    '</WORKFLOW_STATE>',
  ].join('\n');
}
