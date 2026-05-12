export const agentCatalog = {
  orchestrator: {
    name: 'Orchestrator',
    capability: 'Routing',
    description: 'Forstår opgaven, vælger arbejdsgang og holder AIFacet konsistent.',
  },
  planner: {
    name: 'Planner-agent',
    capability: 'Task decomposition',
    description: 'Bryder komplekse mål ned i rækkefølge, delmål og næste handlinger.',
  },
  research: {
    name: 'Research-agent',
    capability: 'Research',
    description: 'Finder relevante vinkler, antagelser og vidensbehov i brugerens kontekst.',
  },
  analyst: {
    name: 'Analyst-agent',
    capability: 'Analysis',
    description: 'Sammenligner, prioriterer og udleder de vigtigste konklusioner.',
  },
  writer: {
    name: 'Writer-agent',
    capability: 'Synthesis',
    description: 'Former svaret i brugerens foretrukne tone, sprog og længde.',
  },
  organizer: {
    name: 'Organizer-agent',
    capability: 'Execution structure',
    description: 'Gør output handlingsklart med struktur, sektioner og opfølgning.',
  },
  reviewer: {
    name: 'Reviewer-agent',
    capability: 'Verification',
    description: 'Kvalitetssikrer svaret for klarhed, relevans og mulige mangler.',
  },
  memory: {
    name: 'Memory-agent',
    capability: 'Context recall',
    description: 'Udvælger relevant profil, feedback, filer og samtalehistorik som kontekst.',
  },
  guardrail: {
    name: 'Guardrail-agent',
    capability: 'Governance',
    description: 'Adskiller brugerdata fra instruktioner og markerer usikkerhed eller behov for afklaring.',
  },
  executor: {
    name: 'Executor-agent',
    capability: 'Task execution',
    description: 'Udfører konkrete delopgaver og producerer rå output til samling.',
  },
};

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
  review: [
    'review', 'gennemgå', 'kontroller', 'kvalitet', 'feedback', 'forbedr',
    'kritik', 'tjek', 'validér', 'valider', 'sikker', 'risiko',
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

function makeStep(agentId, options = {}) {
  const agent = agentCatalog[agentId];
  return {
    agent_id: agentId,
    agent_name: agent.name,
    phase: options.phase || 'execute',
    lane: options.lane || 'main',
    execution: options.execution || 'sequential',
    depends_on: options.depends_on || [],
    status: options.status || 'klar',
    output: options.output || '',
    capability: agent.capability,
    description: agent.description,
  };
}

function uniqueSteps(trace) {
  return trace.filter(
    (step, index, list) => list.findIndex((candidate) => candidate.agent_id === step.agent_id) === index
  );
}

function buildSubtasks(signals, isComplex) {
  const subtasks = [
    {
      id: 'understand',
      title: 'Forstå mål og kontekst',
      agent_id: 'orchestrator',
      execution: 'sequential',
      depends_on: [],
    },
  ];

  if (signals.memory) {
    subtasks.push({
      id: 'context',
      title: 'Hent relevant profil, filer og feedback',
      agent_id: 'memory',
      execution: 'sequential',
      depends_on: ['understand'],
    });
  }

  if (isComplex || signals.planning) {
    subtasks.push({
      id: 'plan',
      title: 'Del opgaven i delmål og afhængigheder',
      agent_id: 'planner',
      execution: 'sequential',
      depends_on: signals.memory ? ['context'] : ['understand'],
    });
  }

  const parallelDependsOn = subtasks.at(-1)?.id || 'understand';
  if (signals.research) {
    subtasks.push({
      id: 'research',
      title: 'Undersøg fakta, muligheder og usikkerheder',
      agent_id: 'research',
      execution: 'parallel',
      depends_on: [parallelDependsOn],
    });
  }

  if (signals.research || signals.planning || isComplex) {
    subtasks.push({
      id: 'analysis',
      title: 'Prioriter indsigter og beslutningspunkter',
      agent_id: 'analyst',
      execution: signals.research ? 'parallel' : 'sequential',
      depends_on: [parallelDependsOn],
    });
  }

  if (signals.writing || !signals.planning) {
    subtasks.push({
      id: 'draft',
      title: 'Skab samlet svar i brugerens stil',
      agent_id: signals.writing ? 'writer' : 'executor',
      execution: 'sequential',
      depends_on: subtasks
        .filter((task) => ['research', 'analysis', 'plan', 'context', 'understand'].includes(task.id))
        .slice(-3)
        .map((task) => task.id),
    });
  }

  if (signals.planning || isComplex) {
    subtasks.push({
      id: 'organize',
      title: 'Gør output handlingsklart',
      agent_id: 'organizer',
      execution: 'sequential',
      depends_on: [subtasks.at(-1)?.id || 'understand'],
    });
  }

  if (signals.governance) {
    subtasks.push({
      id: 'guardrails',
      title: 'Tjek datagrænser og instruktioner',
      agent_id: 'guardrail',
      execution: 'sequential',
      depends_on: [subtasks.at(-1)?.id || 'understand'],
    });
  }

  subtasks.push({
    id: 'review',
    title: 'Review og kvalitetssikring',
    agent_id: 'reviewer',
    execution: 'sequential',
    depends_on: [subtasks.at(-1)?.id || 'understand'],
  });

  return subtasks;
}

function buildTraceFromSubtasks(subtasks) {
  return uniqueSteps(
    subtasks.map((task) =>
      makeStep(task.agent_id, {
        phase: task.id,
        lane: task.execution === 'parallel' ? 'parallel' : 'main',
        execution: task.execution,
        depends_on: task.depends_on,
        output: task.title,
      })
    )
  );
}

function buildQualityGates(signals, isComplex) {
  const gates = [
    'Svar i AIFacets personlige stil',
    'Brug kun relevant kontekst fra profil, filer og samtale',
  ];

  if (signals.research) gates.push('Marker antagelser og usikkerheder tydeligt');
  if (signals.planning || isComplex) gates.push('Gør næste handlinger konkrete og prioriterede');
  if (signals.governance) gates.push('Adskil brugerdata fra instruktioner og undgå at lække privat kontekst');

  gates.push('Reviewer-agenten skal fange mangler før svaret sendes');
  return gates;
}

export function buildOrchestrationPlan(content = '', options = {}) {
  const text = content.toLowerCase();
  const signals = {
    research: hasSignal(text, taskSignals.research),
    planning: hasSignal(text, taskSignals.planning),
    writing: hasSignal(text, taskSignals.writing),
    review: hasSignal(text, taskSignals.review),
    memory: hasSignal(text, taskSignals.memory) || Boolean(options.hasKnowledge || options.hasFeedback),
    governance: hasSignal(text, taskSignals.governance),
  };

  const signalCount = Object.values(signals).filter(Boolean).length;
  const isComplex =
    content.length > 220 ||
    signalCount >= 2 ||
    /\b(byg|lav|skab|kompleks|flere|multi|fuld|end-to-end|produkt|forretning)\b/i.test(content);

  const subtasks = buildSubtasks(signals, isComplex);
  const trace = buildTraceFromSubtasks(subtasks);
  const hasParallelWork = subtasks.some((task) => task.execution === 'parallel');
  const workflowType = isComplex
    ? 'plan-execute-review'
    : signals.research
      ? 'research-synthesize-review'
      : signals.planning
        ? 'plan-organize-review'
        : 'direct-review';

  return {
    mode: trace.length > 3 || isComplex ? 'orchestrated' : 'direct',
    workflow_type: workflowType,
    execution_mode: hasParallelWork ? 'hybrid' : 'sequential',
    summary:
      trace.length > 3 || isComplex
        ? `Opgaven opdeles, routes og kvalitetssikres via ${trace.length} specialister.`
        : 'Opgaven løses direkte af dit AIFace med personlig kontekst.',
    signals,
    subtasks,
    handoffs: subtasks
      .filter((task) => task.depends_on.length > 0)
      .map((task) => ({
        from: task.depends_on.join(', '),
        to: task.id,
        note: 'Kontekst, beslutninger og constraints sendes videre uden at ændre AIFacets stemme.',
      })),
    quality_gates: buildQualityGates(signals, isComplex),
    recovery_policy: {
      retry: 'Hvis output er uklart, prøv samme agent igen med skarpere constraint.',
      fallback: 'Hvis en specialist ikke er relevant, saml svaret direkte i AIFacet.',
      escalation: 'Hvis opgaven kræver manglende data eller følsomme valg, spørg brugeren kort.',
    },
    trace,
  };
}

export function buildOrchestrationPrompt(plan) {
  if (!plan?.subtasks?.length) return '';

  const workflow = plan.subtasks
    .map((task, index) => {
      const agent = agentCatalog[task.agent_id];
      const depends = task.depends_on.length > 0 ? ` Afhænger af: ${task.depends_on.join(', ')}.` : '';
      return `${index + 1}. ${agent.name} (${task.execution}): ${task.title}.${depends}`;
    })
    .join('\n');

  const gates = plan.quality_gates
    .map((gate) => `- ${gate}`)
    .join('\n');

  return `Orkestrering:
SnapTrainer skal føles som ét samlet AIFace for brugeren, men du skal internt arbejde som et specialistteam.
Workflow-type: ${plan.workflow_type}
Execution-mode: ${plan.execution_mode}

Arbejdsgang for denne opgave:
${workflow}

Quality gates:
${gates}

Recovery:
- Retry: ${plan.recovery_policy.retry}
- Fallback: ${plan.recovery_policy.fallback}
- Escalation: ${plan.recovery_policy.escalation}

Svar kun med det samlede slutoutput i AIFacets personlige stil. Nævn kun agentprocessen, hvis det hjælper brugeren.`;
}
