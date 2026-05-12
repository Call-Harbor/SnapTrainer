const agentCatalog = {
  orchestrator: {
    name: 'Orchestrator',
    description: 'Forstår opgaven, vælger arbejdsgang og holder AIFacet konsistent.',
  },
  planner: {
    name: 'Planner-agent',
    description: 'Bryder komplekse mål ned i rækkefølge, delmål og næste handlinger.',
  },
  research: {
    name: 'Research-agent',
    description: 'Finder relevante vinkler, antagelser og vidensbehov i brugerens kontekst.',
  },
  analyst: {
    name: 'Analyst-agent',
    description: 'Sammenligner, prioriterer og udleder de vigtigste konklusioner.',
  },
  writer: {
    name: 'Writer-agent',
    description: 'Former svaret i brugerens foretrukne tone, sprog og længde.',
  },
  organizer: {
    name: 'Organizer-agent',
    description: 'Gør output handlingsklart med struktur, sektioner og opfølgning.',
  },
  reviewer: {
    name: 'Reviewer-agent',
    description: 'Kvalitetssikrer svaret for klarhed, relevans og mulige mangler.',
  },
};

const taskSignals = {
  research: [
    'research', 'undersøg', 'marked', 'konkurrent', 'kilde', 'kilder', 'trend',
    'data', 'find ud af', 'sammenlign', 'analyse', 'analyser',
  ],
  planning: [
    'plan', 'roadmap', 'strategi', 'workflow', 'projekt', 'opdel', 'prioriter',
    'næste skridt', 'milestone', 'fase', 'struktur',
  ],
  writing: [
    'skriv', 'formuler', 'tekst', 'email', 'mail', 'post', 'artikel', 'pitch',
    'kampagne', 'landing page', 'linkedin', 'annonce',
  ],
  review: [
    'review', 'gennemgå', 'kontroller', 'kvalitet', 'feedback', 'forbedr',
    'kritik', 'tjek', 'validér', 'valider',
  ],
};

function hasSignal(text, signals) {
  return signals.some((signal) => text.includes(signal));
}

function makeStep(agentId, status = 'klar') {
  const agent = agentCatalog[agentId];
  return {
    agent_id: agentId,
    agent_name: agent.name,
    status,
    description: agent.description,
  };
}

export function buildOrchestrationPlan(content = '') {
  const text = content.toLowerCase();
  const signals = {
    research: hasSignal(text, taskSignals.research),
    planning: hasSignal(text, taskSignals.planning),
    writing: hasSignal(text, taskSignals.writing),
    review: hasSignal(text, taskSignals.review),
  };

  const signalCount = Object.values(signals).filter(Boolean).length;
  const isComplex =
    content.length > 220 ||
    signalCount >= 2 ||
    /\b(byg|lav|skab|kompleks|flere|multi|fuld|end-to-end|produkt|forretning)\b/i.test(content);

  const trace = [makeStep('orchestrator')];

  if (isComplex || signals.planning) trace.push(makeStep('planner'));
  if (signals.research) trace.push(makeStep('research'));
  if (signals.research || text.includes('analyse') || text.includes('sammenlign')) {
    trace.push(makeStep('analyst'));
  }
  if (signals.writing || !signals.planning) trace.push(makeStep('writer'));
  if (signals.planning || text.includes('todo') || text.includes('opgave')) {
    trace.push(makeStep('organizer'));
  }
  if (isComplex || signals.review || trace.length > 3) trace.push(makeStep('reviewer'));

  const uniqueTrace = trace.filter(
    (step, index, list) => list.findIndex((candidate) => candidate.agent_id === step.agent_id) === index
  );

  return {
    mode: uniqueTrace.length > 2 ? 'orchestrated' : 'direct',
    summary:
      uniqueTrace.length > 2
        ? 'Opgaven routes gennem et specialistteam og samles som et svar fra dit AIFace.'
        : 'Opgaven løses direkte af dit AIFace med personlig kontekst.',
    trace: uniqueTrace,
  };
}

export function buildOrchestrationPrompt(plan) {
  if (!plan?.trace?.length) return '';

  const workflow = plan.trace
    .map((step, index) => `${index + 1}. ${step.agent_name}: ${step.description}`)
    .join('\n');

  return `Orkestrering:
SnapTrainer skal føles som ét samlet AIFace for brugeren, men du må internt arbejde som et specialistteam.
Arbejdsgang for denne opgave:
${workflow}

Svar kun med det samlede slutoutput i AIFacets personlige stil. Nævn kun agentprocessen, hvis det hjælper brugeren.`;
}
