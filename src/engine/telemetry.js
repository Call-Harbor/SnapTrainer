function id(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createTelemetry(runId) {
  const events = [];

  const record = ({ stage, type, message, data = {}, latencyMs, tokenUsage }) => {
    const event = {
      id: id('evt'),
      runId,
      ts: new Date().toISOString(),
      stage,
      type,
      message,
      data,
      ...(typeof latencyMs === 'number' ? { latencyMs } : {}),
      ...(tokenUsage ? { tokenUsage } : {}),
    };
    events.push(event);
    return event;
  };

  const time = async (eventBase, fn) => {
    const started = performance.now();
    try {
      const result = await fn();
      record({
        ...eventBase,
        type: eventBase.type || 'span.complete',
        latencyMs: Math.round(performance.now() - started),
      });
      return result;
    } catch (error) {
      record({
        ...eventBase,
        type: 'span.error',
        message: `${eventBase.message}: ${error.message}`,
        latencyMs: Math.round(performance.now() - started),
        data: { ...(eventBase.data || {}), error: error.message },
      });
      throw error;
    }
  };

  return { events, record, time };
}

export function summarizeLatency(events = []) {
  return events.reduce((sum, event) => sum + (event.latencyMs || 0), 0);
}
