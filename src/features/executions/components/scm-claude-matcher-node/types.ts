import { z } from 'zod';

export const SCMClaudeMatcherDataSchema = z.object({
  variableName: z.string().min(1, 'Variable name is required'),
  apiSpecs: z.any().optional(),
  model: z.string().min(1, 'Model is required'),
  strategy: z.enum(['exact', 'semantic', 'hybrid']),
  confidence: z.number().min(0).max(1),
});

export type SCMClaudeMatcherData = z.infer<typeof SCMClaudeMatcherDataSchema>;
