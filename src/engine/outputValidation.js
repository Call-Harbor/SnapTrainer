import { z } from 'zod';

export const StructuredIntermediateOutputSchema = z.object({
  agentId: z.string().min(1),
  subtaskId: z.string().min(1),
  status: z.enum(['success', 'failed', 'low_confidence']),
  output: z.string().default(''),
  confidence: z.number().min(0).max(1),
  uncertainty: z.string().default(''),
  structured: z.record(z.any()).default({}),
});

export const StructuredFinalOutputSchema = z.object({
  output: z.string().min(1),
  clarificationNeeded: z.boolean().default(false),
  uncertainty: z.string().default(''),
});

export function validateIntermediateOutput(output) {
  return StructuredIntermediateOutputSchema.safeParse({
    ...output,
    subtaskId: output?.subtaskId || output?.structured?.subtaskId || '',
    uncertainty: output?.uncertainty || '',
    structured: output?.structured || {},
  });
}

export function validateStructuredFinalOutput(value) {
  if (typeof value === 'string') {
    return StructuredFinalOutputSchema.safeParse({
      output: value.trim(),
      clarificationNeeded: false,
      uncertainty: '',
    });
  }
  return StructuredFinalOutputSchema.safeParse(value);
}
