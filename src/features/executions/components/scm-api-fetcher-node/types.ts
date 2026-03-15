import { z } from 'zod';

export const SCMAPIFetcherDataSchema = z.object({
  variableName: z.string().min(1, 'Variable name is required'),
  apis: z.array(z.string()).min(1, 'At least one API must be selected'),
  includeVersions: z.boolean(),
  includeExamples: z.boolean(),
});

export type SCMAPIFetcherData = z.infer<typeof SCMAPIFetcherDataSchema>;
