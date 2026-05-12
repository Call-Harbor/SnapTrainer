export function runStateToActivityPlan(runState) {
  const trace = (runState.subtasks || []).map((task) => ({
    agent_id: task.assignedAgent,
    agent_name: task.assignedAgent,
    phase: task.id,
    lane: task.dependencies.length > 1 ? 'handoff' : 'main',
    execution: runState.executionMode?.includes('parallel') ? 'parallel' : 'sequential',
    depends_on: task.dependencies,
    status: task.status,
    output: task.title,
    capability: task.objective,
    description: task.objective,
  }));

  return {
    summary: `${runState.executionMode} · ${runState.interpretedIntent?.complexity || 'unknown'} complexity`,
    collaboration_mode: runState.executionMode,
    workflow_type: runState.executionMode,
    execution_mode: runState.executionMode,
    intelligence_layer: 'AIFace',
    trace,
    selected_agents: [...new Set(trace.map((item) => item.agent_id))],
    lifecycle: [
      { id: 'plan', title: 'Plan', description: 'Interpret intent, assess complexity, decompose and route.', status: runState.lifecycleStage === 'plan' ? 'active' : 'ready' },
      { id: 'execute', title: 'Execute', description: 'Run specialist subtasks through structured blackboard state.', status: runState.lifecycleStage === 'execute' ? 'active' : 'ready' },
      { id: 'evaluate', title: 'Evaluate', description: 'Score the final answer and trigger recovery if needed.', status: runState.lifecycleStage === 'evaluate' ? 'active' : 'ready' },
    ],
    subtasks: (runState.subtasks || []).map((task) => ({
      id: task.id,
      title: task.title,
      agent_id: task.assignedAgent,
      execution: runState.executionMode?.includes('parallel') ? 'parallel' : 'sequential',
      depends_on: task.dependencies,
      lifecycle_stage: runState.lifecycleStage,
    })),
    handoffs: (runState.subtasks || [])
      .filter((task) => task.dependencies.length > 0)
      .map((task) => ({
        from: task.dependencies.join(', '),
        to: task.id,
        agent_id: task.assignedAgent,
        note: 'Structured handoff through blackboard state.',
      })),
    quality_gates: [
      'Intent match',
      'Completeness',
      'Coherence',
      'User-style alignment',
      'Confidence / uncertainty',
    ],
    recovery_policy: {
      retry: 'Retry once when a recoverable specialist output fails validation or scores low.',
      fallback: 'Fallback to a safe unified answer if recovery is exhausted.',
      escalation: 'Ask for clarification when intent or required context remains ambiguous.',
    },
  };
}

export function runStateToChatMetadata(runState) {
  const activity = runStateToActivityPlan(runState);
  return {
    orchestration_mode: runState.executionMode === 'direct_response' ? 'direct' : 'orchestrated',
    orchestration_summary: activity.summary,
    collaboration_mode: runState.executionMode,
    workflow_type: runState.executionMode,
    execution_mode: runState.executionMode,
    intelligence_layer: 'AIFace',
    agent_trace: activity.trace,
    selected_agents: activity.selected_agents,
    lifecycle: activity.lifecycle,
    subtasks: activity.subtasks,
    handoffs: activity.handoffs,
    quality_gates: activity.quality_gates,
    recovery_policy: activity.recovery_policy,
    proactive_insight_policy: 'Add at most one clearly relevant proactive observation.',
    run_state: runState,
    telemetry_events: runState.telemetry,
    evaluation_result: runState.evaluationResults?.at(-1),
  };
}
