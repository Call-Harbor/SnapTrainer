import { createEngineEvent } from './orchestrationEvents.js';

export function createTelemetry(runId) {
  const events = [];

  const record = ({ stage, type, message, data = {}, latencyMs, tokenUsage }) => {
    const event = createEngineEvent({
      runId,
      stage,
      type,
      message,
      data,
      latencyMs,
      tokenUsage,
    });
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
