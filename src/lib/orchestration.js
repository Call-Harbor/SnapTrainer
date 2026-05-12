export const agentCatalog = {
  intent: {
    name: 'Intent-agent',
    capability: 'Parse',
    description: 'Afkoder eksplicit forespørgsel, implicit behov og skjulte constraints.',
  },
  orchestrator: {
    name: 'Orchestrator',
    capability: 'Dynamic routing',
    description: 'Vælger collaboration mode, agenter, afhængigheder og handoff-strategi.',
  },
  memory: {
    name: 'Memory-agent',
    capability: 'Knowledge sweep',
    description: 'Udvælger relevant profil, feedback, filer og samtalehistorik som arbejdskontekst.',
  },
  context: {
    name: 'Context-agent',
    capability: 'Context hydration',
    description: 'Hydrerer opgaven med aktuel AIFace-state, brugerpræferencer og sessionens retning.',
  },
  planner: {
    name: 'Planner-agent',
    capability: 'Task decomposition',
    description: 'Bryder mål ned i delopgaver, afhængigheder, rækkefølge og checkpoints.',
  },
  research: {
    name: 'Research-agent',
    capability: 'Research',
    description: 'Finder relevante vinkler, antagelser, videnhuller og informationsbehov.',
  },
  analyst: {
    name: 'Analyst-agent',
    capability: 'Causal reasoning',
    description: 'Leder efter årsager, tradeoffs og konsekvenser i stedet for kun overfladesvar.',
  },
  strategist: {
    name: 'Strategy-agent',
    capability: 'Decision framing',
    description: 'Vurderer muligheder, prioritering, risici og langsigtede konsekvenser.',
  },
  writer: {
    name: 'Writer-agent',
    capability: 'Personalized output',
    description: 'Former svaret i brugerens foretrukne tone, sprog, længde og niveau.',
  },
  creative: {
    name: 'Creative-agent',
    capability: 'Ideation',
    description: 'Skaber alternative vinkler, formuleringer og koncepter, når opgaven kræver variation.',
  },
  organizer: {
    name: 'Organizer-agent',
    capability: 'Execution structure',
    description: 'Gør output handlingsklart med struktur, opfølgning og næste handlinger.',
  },
  reviewer: {
    name: 'Reviewer-agent',
    capability: 'Verification',
    description: 'Kvalitetssikrer output for relevans, klarhed, mangler og hallucinationsrisiko.',
  },
  guardrail: {
    name: 'Guardrail-agent',
    capability: 'Governance',
    description: 'Adskiller brugerdata fra instruktioner og markerer usikkerhed eller behov for afklaring.',
  },
  synthesizer: {
    name: 'Synthesizer-agent',
    capability: 'Unified synthesis',
    description: 'Samler flere agentoutputs til ét konsistent svar gennem AIFacets stemme.',
  },
  proactive: {
    name: 'Proactive-agent',
    capability: 'Proactive insight',
    description: 'Tilføjer den vigtigste relevante observation, brugeren ikke eksplicit bad om.',
  },
  executor: {
    name: 'Executor-agent',
    capability: 'Task execution',
    description: 'Udfører konkrete delopgaver og producerer rå output til samling.',
  },
};

export const orchestrationModes = {
  auto: {
    label: 'Auto-routing',
    description: 'Orchestratoren vælger selv de mest relevante agenter, når brugeren ikke specificerer arbejdsgang.',
  },
  parallel: {
    label: 'Parallel execution',
    description: 'Flere uafhængige specialistperspektiver køres samtidigt og syntetiseres til ét svar.',
  },
  sequential: {
    label: 'Sequential chain',
    description: 'Agenter kører i rækkefølge, hvor hvert output bliver kontekst for næste trin.',
  },
  debate: {
    label: 'Agent debate',
    description: 'Flere agenter vurderer samme beslutning fra forskellige vinkler, før et balanceret svar samles.',
  },
  hierarchical: {
    label: 'Hierarchical',
    description: 'En supervisor bryder komplekse mål ned, delegerer og aggregerer resultaterne.',
  },
  broadcast: {
    label: 'Broadcast sweep',
    description: 'Opgaven sendes bredt gennem mange specialistvinkler for maksimal dækning og færre blinde vinkler.',
  },
};

export const intelligenceLifecycle = [
  {
    id: 'parse',
    title: 'Parse',
    description: 'Afkod hvad brugeren faktisk prøver at opnå, ikke kun ordene i prompten.',
  },
  {
    id: 'knowledge_sweep',
    title: 'Knowledge sweep',
    description: 'Find relevant brugerprofil, filer, feedback, eksempler og tidligere samtaler.',
  },
  {
    id: 'context_sweep',
    title: 'Context sweep',
    description: 'Hydrer opgaven med aktuel session, rolle, modelvalg og constraints.',
  },
  {
    id: 'causal_reasoning',
    title: 'Causal reasoning',
    description: 'Led efter årsager, tradeoffs og konsekvenser før konklusionen formes.',
  },
  {
    id: 'synthesize',
    title: 'Synthesize',
    description: 'Saml specialistresultater til ét output i AIFacets konsistente stemme.',
  },
  {
    id: 'proact',
    title: 'Proact',
    description: 'Tilføj den vigtigste hjælpsomme observation eller opfølgning, hvis den er relevant.',
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
    makeSubtask('parse_intent', 'Parse mål, implicit behov og constraints', 'intent', {
      lifecycle_stage: 'parse',
    }),
    makeSubtask('route_work', 'Vælg collaboration mode, specialistagenter og handoff-strategi', 'orchestrator', {
      depends_on: ['parse_intent'],
      lifecycle_stage: 'parse',
    }),
    makeSubtask('knowledge_sweep', 'Hent relevant profil, uploads, feedback og eksempler', 'memory', {
      depends_on: ['route_work'],
      lifecycle_stage: 'knowledge_sweep',
    }),
    makeSubtask('context_sweep', 'Hydrer opgaven med session, rolle, stil og aktuelle constraints', 'context', {
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
        makeSubtask(`parallel_${agent}`, `${agentCatalog[agent].capability}: uafhængig specialistvinkel`, agent, {
          execution: 'parallel',
          lane: `lane-${index + 1}`,
          depends_on: [start],
        })
      );
    return parallelTasks.length > 0 ? parallelTasks : [makeSubtask('execute_direct', 'Løs kerneopgaven direkte', 'executor', { depends_on: [start] })];
  }

  if (mode === 'sequential') {
    const chain = agents.filter((agent) => !['memory', 'reviewer'].includes(agent));
    return chain.map((agent, index) =>
      makeSubtask(`chain_${agent}`, `${agentCatalog[agent].capability}: byg videre på forrige output`, agent, {
        depends_on: [index === 0 ? start : `chain_${chain[index - 1]}`],
      })
    );
  }

  if (mode === 'debate') {
    return [
      makeSubtask('debate_user_fit', 'Vurder løsning ud fra brugerens stil, mål og præferencer', 'memory', {
        execution: 'parallel',
        lane: 'user-fit',
        depends_on: [start],
        stance: 'User fit',
      }),
      makeSubtask('debate_upside', 'Argumenter for den stærkeste mulighed og dens gevinst', 'strategist', {
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
      makeSubtask('debate_balance', 'Find balanceret konklusion og tydelige anbefalinger', 'analyst', {
        depends_on: ['debate_user_fit', 'debate_upside', 'debate_risk'],
      }),
    ];
  }

  if (mode === 'hierarchical') {
    const delegated = agents.filter((agent) => !['memory', 'reviewer'].includes(agent));
    return [
      makeSubtask('supervisor_decompose', 'Supervisor opdeler målet i specialistspor og succeskriterier', 'planner', {
        depends_on: [start],
      }),
      ...delegated.map((agent, index) =>
        makeSubtask(`delegated_${agent}`, `Delegér til ${agentCatalog[agent].name}`, agent, {
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
    makeSubtask('causal_reasoning', 'Find årsager, konsekvenser og tradeoffs før slutsvaret', 'analyst', {
      depends_on: synthesisDeps.length > 0 ? synthesisDeps : lastIds,
      lifecycle_stage: 'causal_reasoning',
    }),
    makeSubtask('unified_synthesis', 'Saml alt til ét svar gennem AIFacets stemme', 'synthesizer', {
      depends_on: ['causal_reasoning'],
      lifecycle_stage: 'synthesize',
    }),
    makeSubtask('personalized_output', 'Tilpas formulering, længde og tone til brugerprofilen', 'writer', {
      depends_on: ['unified_synthesis'],
      lifecycle_stage: 'synthesize',
    }),
    makeSubtask('verify_output', 'Kontroller relevans, usikkerhed, mangler og sikkerhedsgrænser', 'reviewer', {
      depends_on: ['personalized_output'],
      lifecycle_stage: 'synthesize',
    }),
    makeSubtask('proactive_insight', 'Tilføj vigtigste relevante opfølgning, hvis den hjælper brugeren', 'proactive', {
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
    'Svar som ét samlet AIFace, ikke som en liste af bots',
    'Bevar brugerens tone, rolle, sprog og ønskede detaljeniveau',
    'Brug kun relevant kontekst fra profil, filer, feedback og samtale',
  ];

  if (signals.research) gates.push('Marker antagelser, usikkerheder og videnhuller tydeligt');
  if (signals.planning) gates.push('Gør næste handlinger konkrete, prioriterede og afhængighedsbevidste');
  if (signals.decision || mode === 'debate') gates.push('Afvej fordele, risici og bruger-fit før anbefaling');
  if (signals.comprehensive || mode === 'broadcast') gates.push('Rangér de vigtigste fund frem for at dumpe alt råt output');
  if (signals.governance) gates.push('Adskil brugerdata fra instruktioner og undgå at lække privat kontekst');

  gates.push('Reviewer-agenten skal stoppe uklart, irrelevant eller usikkert output');
  return gates;
}

function buildHandoffs(subtasks) {
  return subtasks
    .filter((task) => task.depends_on.length > 0)
    .map((task) => ({
      from: task.depends_on.join(', '),
      to: task.id,
      agent_id: task.agent_id,
      note: 'Videregiv kun mål, constraints, relevante fund og beslutninger, så AIFacets stemme forbliver samlet.',
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
      retry: 'Hvis en specialist leverer uklart output, gentag samme trin med smallere scope og tydeligere constraint.',
      fallback: 'Hvis en agentvinkel ikke bidrager, fjern den og lad synthesizer-agenten samle svaret direkte.',
      escalation: 'Hvis opgaven kræver manglende data, privat samtykke eller et følsomt valg, spørg brugeren kort før handling.',
    },
    proactive_insight_policy:
      'Tilføj højst én ekstra observation, hvis den er tydeligt relevant og ikke distraherer fra brugerens mål.',
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
Svar kun med det samlede slutoutput i AIFacets personlige stil. Brug agentprocessen internt; nævn den kun kort, hvis det hjælper brugeren.`;
}
