# SnapTrainer engine architecture

SnapTrainer now treats each user message as an orchestration run rather than a single prompt.

## Engine layers

1. **Orchestrator**
   - Interprets the user goal.
   - Assesses complexity and ambiguity.
   - Chooses one execution mode:
     - `direct_response`
     - `sequential_workflow`
     - `parallel_workflow`
     - `dynamic_handoff`
     - `reviewer_evaluator_loop`
   - Decomposes complex goals into typed subtasks and assigns specialist agents.

2. **Shared state / blackboard**
   - Every run gets a stable `runId`.
   - The blackboard tracks user goal, interpreted intent, subtasks, assigned agents, status, checkpoints, intermediate outputs, final result, retries, evaluations, memory partitions and telemetry.
   - Checkpoints make future interrupted-run restore possible.

3. **Memory partitions**
   - Session memory: recent active conversation.
   - Long-term preference memory: AIFace identity prompt, style preferences, feedback and advanced training.
   - Workflow memory: retrieved files, URL crawl instructions and FAQ sources.
   - The engine keeps system instructions, user instructions, retrieved memory, uploaded sources and agent-generated text in separate boundaries.

4. **Plan -> execute -> evaluate lifecycle**
   - `plan`: intent interpretation, complexity assessment, mode selection and decomposition.
   - `execute`: specialist agents receive structured state and handoff context.
   - `evaluate`: reviewer/evaluator scores final output before completion.

5. **Evaluator**
   - Scores:
     - intent match
     - completeness
     - coherence
     - user-style alignment
     - confidence / uncertainty
   - Low scores trigger clarification, retry, reroute or fallback.

6. **Observability**
   - Structured telemetry events capture orchestration decisions, routing, state transitions, agent starts/completions, LLM calls, retries, evaluation scores, latency and completion status.
   - Events are stored on `ChatMessage.telemetry_events` and can be used by a future Mission Control panel.

7. **Validation and recovery**
   - Agent outputs, final outputs, evaluations and run state pass through schemas before downstream use.
   - Malformed output does not silently pollute memory.
   - Recovery supports retry-once, reviewer reroute, fallback and clarification escalation.

## Key modules

- `src/engine/contracts.js` - schemas, lifecycle constants and contracts.
- `src/engine/blackboard.js` - shared state and checkpoints.
- `src/engine/memory.js` - memory partitions and governance boundaries.
- `src/engine/orchestrator.js` - intent interpretation, complexity assessment and task decomposition.
- `src/engine/agents.js` - specialist agent execution.
- `src/engine/evaluator.js` - output scoring.
- `src/engine/recovery.js` - retry, reroute, fallback and clarification decisions.
- `src/engine/telemetry.js` - structured events and latency capture.
- `src/engine/runner.js` - run lifecycle executor.
- `src/engine/eval-harness.js` - reusable benchmark harness.

## Regression harness

Run:

```bash
npm run eval:engine
```

The harness covers vague prompts, incomplete instructions, conflicting instructions, multi-step tasks, memory-dependent tasks and clarification-needed tasks. It emits aggregate scores for intent understanding, task completion, memory use, recovery behavior and final answer quality.
