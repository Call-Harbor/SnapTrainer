export const agentCatalog = {
  intent: {
    name: 'Intent-agent',
    capability: 'Parse',
    description: 'Decodes the explicit request, implicit need and hidden constraints.',
  },
  orchestrator: {
    name: 'Orchestrator',
    capability: 'Dynamic routing',
    description: 'Selects collaboration mode, agents, dependencies and handoff strategy.',
  },
  memory: {
    name: 'Memory-agent',
    capability: 'Knowledge sweep',
    description: 'Selects relevant profile, feedback, files and conversation history as working context.',
  },
  context: {
    name: 'Context-agent',
    capability: 'Context hydration',
    description: 'Hydrates the task with current AIFace state, user preferences and session direction.',
  },
  planner: {
    name: 'Planner-agent',
    capability: 'Task decomposition',
    description: 'Breaks goals into subtasks, dependencies, order and checkpoints.',
  },
  research: {
    name: 'Research-agent',
    capability: 'Research',
    description: 'Finds relevant angles, assumptions, knowledge gaps and information needs.',
  },
  analyst: {
    name: 'Analyst-agent',
    capability: 'Causal reasoning',
    description: 'Looks for causes, tradeoffs and consequences instead of surface-level answers.',
  },
  strategist: {
    name: 'Strategy-agent',
    capability: 'Decision framing',
    description: 'Evaluates options, prioritization, risks and long-term consequences.',
  },
  writer: {
    name: 'Writer-agent',
    capability: 'Personalized output',
    description: 'Shapes the answer in the user’s preferred tone, language, length and level.',
  },
  creative: {
    name: 'Creative-agent',
    capability: 'Ideation',
    description: 'Creates alternative angles, wording and concepts when the task needs variation.',
  },
  organizer: {
    name: 'Organizer-agent',
    capability: 'Execution structure',
    description: 'Makes output actionable with structure, follow-up and next actions.',
  },
  reviewer: {
    name: 'Reviewer-agent',
    capability: 'Verification',
    description: 'Checks output for relevance, clarity, gaps and hallucination risk.',
  },
  guardrail: {
    name: 'Guardrail-agent',
    capability: 'Governance',
    description: 'Separates user data from instructions and flags uncertainty or clarification needs.',
  },
  synthesizer: {
    name: 'Synthesizer-agent',
    capability: 'Unified synthesis',
    description: 'Combines multiple agent outputs into one consistent answer through the AIFace voice.',
  },
  proactive: {
    name: 'Proactive-agent',
    capability: 'Proactive insight',
    description: 'Adds the most important relevant observation the user did not explicitly ask for.',
  },
  executor: {
    name: 'Executor-agent',
    capability: 'Task execution',
    description: 'Executes concrete subtasks and produces raw output for synthesis.',
  },
};

export const orchestrationModes = {
  auto: {
    label: 'Auto-routing',
    description: 'The orchestrator automatically selects the most relevant agents when the user does not specify a workflow.',
  },
  parallel: {
    label: 'Parallel execution',
    description: 'Multiple independent specialist perspectives run at the same time and are synthesized into one answer.',
  },
  sequential: {
    label: 'Sequential chain',
    description: 'Agents run in order, with each output becoming context for the next step.',
  },
  debate: {
    label: 'Agent debate',
    description: 'Multiple agents evaluate the same decision from different angles before a balanced answer is assembled.',
  },
  hierarchical: {
    label: 'Hierarchical',
    description: 'A supervisor decomposes complex goals, delegates and aggregates the results.',
  },
  broadcast: {
    label: 'Broadcast sweep',
    description: 'The task is sent broadly through many specialist angles for maximum coverage and fewer blind spots.',
  },
};

export const intelligenceLifecycle = [
  {
    id: 'parse',
    title: 'Parse',
    description: 'Decode what the user is actually trying to achieve, not only the words in the prompt.',
  },
  {
    id: 'knowledge_sweep',
    title: 'Knowledge sweep',
    description: 'Find relevant user profile, files, feedback, examples and previous conversations.',
  },
  {
    id: 'context_sweep',
    title: 'Context sweep',
    description: 'Hydrate the task with current session, role, model choice and constraints.',
  },
  {
    id: 'causal_reasoning',
    title: 'Causal reasoning',
    description: 'Look for causes, tradeoffs and consequences before shaping the conclusion.',
  },
  {
    id: 'synthesize',
    title: 'Synthesize',
    description: 'Combine specialist results into one output in the consistent AIFace voice.',
  },
  {
    id: 'proact',
    title: 'Proact',
    description: 'Add the most important helpful observation or follow-up if relevant.',
  },
];

const taskSignals = {
  research: [
    'research', 'undersøg', 'marked', 'konkurrent', 'kilde', 'kilder', 'trend',
    'data', 'find ud af', 'sammenlign', 'analyse', 'analyser', 'hvad ved vi',
  ],
  planning: [
    'plan', 'roadmap', 'strategi', 'workflow', 'projekt', 'opdel', 'prioriter',
    'næste skridt', 'milestone', 'fase', 'struktur', 'todo', 'opgave',
  ],
  writing: [
    'skriv', 'formuler', 'tekst', 'email', 'mail', 'post', 'artikel', 'pitch',
    'kampagne', 'landing page', 'linkedin', 'annonce', 'copy', 'besked',
  ],
  decision: [
    'bør', 'skal jeg', 'vælge', 'beslut', 'tradeoff', 'for og imod', 'pros',
    'cons', 'alternativ', 'bedst', 'prioritet',
  ],
  comprehensive: [
    'alt', 'alle vinkler', 'no blind spots', 'ingen blinde vinkler', 'komplet',
    'fuld', 'dybdegående', '360', 'hele', 'maksimal',
  ],
  review: [
    'review', 'gennemgå', 'kontroller', 'kvalitet', 'feedback', 'forbedr',
    'kritik', 'tjek', 'validér', 'valider', 'sikker', 'risiko',
  ],
  creative: [
    'idé', 'ide', 'brainstorm', 'koncept', 'kreativ', 'navn', 'brand', 'vinkel',
    'variation', 'kampagne',
  ],
  memory: [
    'mine filer', 'min stil', 'tidligere', 'sidst', 'husker', 'noter', 'upload',
    'vores samtale', 'min tone', 'min profil',
  ],
  governance: [
    'persondata', 'privat', 'fortroligt', 'hemmeligt', 'sikkerhed', 'compliance',
    'samtykke', 'må ikke', 'begrænsning',
  ],
};

function hasSignal(text, signals) {
  return signals.some((signal) => text.includes(signal));
}

function uniqueBy(items, key) {
  return items.filter((item, index, list) => list.findIndex((candidate) => candidate[key] === item[key]) === index);
}

function makeSubtask(id, title, agentId, options = {}) {
  return {
    id,
    title,
    agent_id: agentId,
    execution: options.execution || 'sequential',
    lane: options.lane || 'main',
    depends_on: options.depends_on || [],
    stance: options.stance || '',
    lifecycle_stage: options.lifecycle_stage || 'causal_reasoning',
  };
}

function makeStep(task) {
  const agent = agentCatalog[task.agent_id];
  return {
    agent_id: task.agent_id,
    agent_name: agent.name,
    phase: task.id,
    lane: task.lane,
    execution: task.execution,
    depends_on: task.depends_on,
    stance: task.stance,
    status: 'klar',
    output: task.title,
    capability: agent.capability,
    description: agent.description,
  };
}

function getSignals(content, options) {
  const text = content.toLowerCase();
  return {
    research: hasSignal(text, taskSignals.research),
    planning: hasSignal(text, taskSignals.planning),
    writing: hasSignal(text, taskSignals.writing),
    decision: hasSignal(text, taskSignals.decision),
    comprehensive: hasSignal(text, taskSignals.comprehensive),
    review: hasSignal(text, taskSignals.review),
    creative: hasSignal(text, taskSignals.creative),
    memory: hasSignal(text, taskSignals.memory) || Boolean(options.hasKnowledge || options.hasFeedback),
    governance: hasSignal(text, taskSignals.governance),
    dependency: /\b(først|derefter|så |then|after|step by step|trin for trin)\b/i.test(content),
  };
}

function selectCollaborationMode(content, signals, signalCount) {
  const isLong = content.length > 320;
  const isComplex = isLong || signalCount >= 4 || /\b(kompleks|end-to-end|produkt|forretning|arkitektur|system)\b/i.test(content);

  if (signals.comprehensive && signalCount >= 3) return 'broadcast';
  if (signals.decision && (signals.research || signals.planning || signals.review)) return 'debate';
  if (isComplex || (signals.comprehensive && signals.planning)) return 'hierarchical';
  if (signals.dependency || (signals.planning && signals.writing)) return 'sequential';
  if ([signals.research, signals.decision, signals.creative, signals.review, signals.governance].filter(Boolean).length >= 2) {
    return 'parallel';
  }

  return 'auto';
}

function getDomainAgents(signals) {
  const agents = [];

  if (signals.memory) agents.push('memory');
  if (signals.planning) agents.push('planner');
  if (signals.research) agents.push('research');
  if (signals.decision || signals.research || signals.review) agents.push('analyst');
  if (signals.decision || signals.planning) agents.push('strategist');
  if (signals.creative) agents.push('creative');
  if (signals.writing || signals.creative || agents.length === 0) agents.push('writer');
  if (signals.planning) agents.push('organizer');
  if (signals.governance) agents.push('guardrail');
  agents.push('reviewer');

  return uniqueBy(agents.map((agent_id) => ({ agent_id })), 'agent_id').map((item) => item.agent_id);
}

function buildFoundationTasks() {
  return [
    makeSubtask('parse_intent', 'Parse goals, implicit needs and constraints', 'intent', {
      lifecycle_stage: 'parse',
    }),
    makeSubtask('route_work', 'Select collaboration mode, specialist agents and handoff strategy', 'orchestrator', {
      depends_on: ['parse_intent'],
      lifecycle_stage: 'parse',
    }),
    makeSubtask('knowledge_sweep', 'Retrieve relevant profile, uploads, feedback and examples', 'memory', {
      depends_on: ['route_work'],
      lifecycle_stage: 'knowledge_sweep',
    }),
    makeSubtask('context_sweep', 'Hydrate the task with session, role, style and current constraints', 'context', {
      depends_on: ['knowledge_sweep'],
      lifecycle_stage: 'context_sweep',
    }),
  ];
}

function buildModeTasks(mode, signals) {
  const agents = getDomainAgents(signals);
  const start = 'context_sweep';

  if (mode === 'parallel') {
    const parallelTasks = agents
      .filter((agent) => !['memory', 'reviewer'].includes(agent))
      .map((agent, index) =>
        makeSubtask(`parallel_${agent}`, `${agentCatalog[agent].capability}: independent specialist angle`, agent, {
          execution: 'parallel',
          lane: `lane-${index + 1}`,
          depends_on: [start],
        })
      );
    return parallelTasks.length > 0 ? parallelTasks : [makeSubtask('execute_direct', 'Solve the core task directly', 'executor', { depends_on: [start] })];
  }

  if (mode === 'sequential') {
    const chain = agents.filter((agent) => !['memory', 'reviewer'].includes(agent));
    return chain.map((agent, index) =>
      makeSubtask(`chain_${agent}`, `${agentCatalog[agent].capability}: build on the previous output`, agent, {
        depends_on: [index === 0 ? start : `chain_${chain[index - 1]}`],
      })
    );
  }

  if (mode === 'debate') {
    return [
      makeSubtask('debate_user_fit', 'Evaluate the solution from the user style, goals and preferences', 'memory', {
        execution: 'parallel',
        lane: 'user-fit',
        depends_on: [start],
        stance: 'User fit',
      }),
      makeSubtask('debate_upside', 'Argue for the strongest option and its upside', 'strategist', {
        execution: 'parallel',
        lane: 'upside',
        depends_on: [start],
        stance: 'For',
      }),
      makeSubtask('debate_risk', 'Argumenter imod og find risici, usikkerheder og skjulte omkostninger', 'reviewer', {
        execution: 'parallel',
        lane: 'risk',
        depends_on: [start],
        stance: 'Against',
      }),
      makeSubtask('debate_balance', 'Find a balanced conclusion and clear recommendations', 'analyst', {
        depends_on: ['debate_user_fit', 'debate_upside', 'debate_risk'],
      }),
    ];
  }

  if (mode === 'hierarchical') {
    const delegated = agents.filter((agent) => !['memory', 'reviewer'].includes(agent));
    return [
      makeSubtask('supervisor_decompose', 'Supervisor decomposes the goal into specialist tracks and success criteria', 'planner', {
        depends_on: [start],
      }),
      ...delegated.map((agent, index) =>
        makeSubtask(`delegated_${agent}`, `Delegate to ${agentCatalog[agent].name}`, agent, {
          execution: 'parallel',
          lane: `specialist-${index + 1}`,
          depends_on: ['supervisor_decompose'],
        })
      ),
      makeSubtask('supervisor_aggregate', 'Aggreger specialistresultater og prioriter output', 'strategist', {
        depends_on: delegated.map((agent) => `delegated_${agent}`),
      }),
    ];
  }

  if (mode === 'broadcast') {
    const sweepAgents = ['planner', 'research', 'analyst', 'strategist', 'creative', 'writer', 'organizer', 'guardrail'];
    return sweepAgents.map((agent, index) =>
      makeSubtask(`broadcast_${agent}`, `Bred sweep: ${agentCatalog[agent].capability}`, agent, {
        execution: 'parallel',
        lane: `sweep-${index + 1}`,
        depends_on: [start],
      })
    );
  }

  return [
    makeSubtask('auto_primary', 'Auto-route til mest relevante specialistspor', agents[0] || 'executor', {
      depends_on: [start],
    }),
    ...agents.slice(1, 4).map((agent, index) =>
      makeSubtask(`auto_support_${agent}`, `Suppler med ${agentCatalog[agent].capability}`, agent, {
        execution: index === 0 ? 'parallel' : 'sequential',
        lane: index === 0 ? 'support' : 'main',
        depends_on: index === 0 ? [start] : ['auto_primary'],
      })
    ),
  ];
}

function buildSynthesisTasks(mode, previousTasks) {
  const lastIds = previousTasks.slice(-3).map((task) => task.id);
  const synthesisDeps = mode === 'parallel' || mode === 'broadcast' || mode === 'debate'
    ? previousTasks.filter((task) => task.execution === 'parallel' || task.id.includes('balance')).map((task) => task.id)
    : lastIds;

  return [
    makeSubtask('causal_reasoning', 'Find causes, consequences and tradeoffs before the final answer', 'analyst', {
      depends_on: synthesisDeps.length > 0 ? synthesisDeps : lastIds,
      lifecycle_stage: 'causal_reasoning',
    }),
    makeSubtask('unified_synthesis', 'Combine everything into one answer through the AIFace voice', 'synthesizer', {
      depends_on: ['causal_reasoning'],
      lifecycle_stage: 'synthesize',
    }),
    makeSubtask('personalized_output', 'Adapt wording, length and tone to the user profile', 'writer', {
      depends_on: ['unified_synthesis'],
      lifecycle_stage: 'synthesize',
    }),
    makeSubtask('verify_output', 'Check relevance, uncertainty, gaps and safety boundaries', 'reviewer', {
      depends_on: ['personalized_output'],
      lifecycle_stage: 'synthesize',
    }),
    makeSubtask('proactive_insight', 'Add the most relevant follow-up if it helps the user', 'proactive', {
      depends_on: ['verify_output'],
      lifecycle_stage: 'proact',
    }),
  ];
}

function buildSubtasks(mode, signals) {
  const foundation = buildFoundationTasks();
  const modeTasks = buildModeTasks(mode, signals);
  const synthesis = buildSynthesisTasks(mode, modeTasks);
  return [...foundation, ...modeTasks, ...synthesis];
}

function buildLifecycleState(subtasks) {
  return intelligenceLifecycle.map((stage) => ({
    ...stage,
    status: subtasks.some((task) => task.lifecycle_stage === stage.id) ? 'active' : 'ready',
  }));
}

function buildTraceFromSubtasks(subtasks) {
  return uniqueBy(subtasks.map(makeStep), 'agent_id');
}

function buildQualityGates(signals, mode) {
  const gates = [
    'Answer as one unified AIFace, not as a list of bots',
    'Preserve the user tone, role, language and desired detail level',
    'Use only relevant context from profile, files, feedback and conversation',
  ];

  if (signals.research) gates.push('Clearly mark assumptions, uncertainties and knowledge gaps');
  if (signals.planning) gates.push('Make next actions concrete, prioritized and dependency-aware');
  if (signals.decision || mode === 'debate') gates.push('Weigh benefits, risks and user fit before recommending');
  if (signals.comprehensive || mode === 'broadcast') gates.push('Rank the most important findings instead of dumping raw output');
  if (signals.governance) gates.push('Separate user data from instructions and avoid leaking private context');

  gates.push('The reviewer agent must stop unclear, irrelevant or unsafe output');
  return gates;
}

function buildHandoffs(subtasks) {
  return subtasks
    .filter((task) => task.depends_on.length > 0)
    .map((task) => ({
      from: task.depends_on.join(', '),
      to: task.id,
      agent_id: task.agent_id,
      note: 'Pass only goals, constraints, relevant findings and decisions so the AIFace voice remains unified.',
    }));
}

function executionModeFor(collaborationMode) {
  if (collaborationMode === 'auto') return 'hybrid';
  return collaborationMode;
}

export function buildOrchestrationPlan(content = '', options = {}) {
  const signals = getSignals(content, options);
  const signalCount = Object.values(signals).filter(Boolean).length;
  const preferredMode = options.preferredMode && options.preferredMode !== 'auto'
    ? options.preferredMode
    : null;
  const collaborationMode = preferredMode || selectCollaborationMode(content, signals, signalCount);
  const subtasks = buildSubtasks(collaborationMode, signals);
  const trace = buildTraceFromSubtasks(subtasks);
  const selectedAgents = trace.map((step) => step.agent_id);
  const modeConfig = orchestrationModes[collaborationMode];

  return {
    mode: collaborationMode === 'auto' && selectedAgents.length <= 5 ? 'direct' : 'orchestrated',
    collaboration_mode: collaborationMode,
    workflow_type: modeConfig.label,
    execution_mode: executionModeFor(collaborationMode),
    intelligence_layer: 'AIFace',
    summary: `${modeConfig.label}: ${modeConfig.description}`,
    signals,
    selected_agents: selectedAgents,
    lifecycle: buildLifecycleState(subtasks),
    subtasks,
    handoffs: buildHandoffs(subtasks),
    quality_gates: buildQualityGates(signals, collaborationMode),
    recovery_policy: {
      retry: 'If a specialist returns unclear output, repeat the same step with narrower scope and clearer constraints.',
      fallback: 'If an agent angle does not contribute, remove it and let the synthesizer agent assemble the answer directly.',
      escalation: 'If the task requires missing data, private consent or a sensitive choice, ask the user briefly before acting.',
    },
    proactive_insight_policy:
      'Add at most one extra observation if it is clearly relevant and does not distract from the user goal.',
    trace,
  };
}

export function buildOrchestrationPrompt(plan) {
  if (!plan?.subtasks?.length) return '';

  const lifecycle = (plan.lifecycle || [])
    .map((stage, index) => `${index + 1}. ${stage.title}: ${stage.description}`)
    .join('\n');

  const workflow = plan.subtasks
    .map((task, index) => {
      const agent = agentCatalog[task.agent_id];
      const depends = task.depends_on.length > 0 ? ` Depends on: ${task.depends_on.join(', ')}.` : '';
      const stance = task.stance ? ` Stance: ${task.stance}.` : '';
      return `${index + 1}. ${agent.name} [${task.execution}]: ${task.title}.${depends}${stance}`;
    })
    .join('\n');

  const gates = plan.quality_gates.map((gate) => `- ${gate}`).join('\n');

  return `Orchestration model:
SnapTrainer exposes one user-facing intelligence layer: the AIFace. Internally, use the selected specialist agents, but return one unified result.
Collaboration mode: ${plan.collaboration_mode} (${plan.workflow_type})
Execution mode: ${plan.execution_mode}

Intelligence lifecycle:
${lifecycle}

Workflow:
${workflow}

Context handoff rule:
Pass only goals, constraints, relevant findings and decisions between agents. Do not let specialist voices leak into the final answer.

Quality gates:
${gates}

Recovery:
- Retry: ${plan.recovery_policy.retry}
- Fallback: ${plan.recovery_policy.fallback}
- Escalation: ${plan.recovery_policy.escalation}

Proactive policy:
${plan.proactive_insight_policy}

Final response requirement:
Only answer with the unified final output in the AIFace personal style. Use the agent process internally; mention it only briefly if it helps the user.`;
}
