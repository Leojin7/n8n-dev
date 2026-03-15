import { z } from 'zod';

export const SCMReportGeneratorDataSchema = z.object({
  variableName: z.string().min(1, 'Variable name is required'),
  mappings: z.any().optional(),
  formats: z.array(z.string().min(1, 'Format is required')).min(1, 'At least one format must be selected'),
});

export type SCMReportGeneratorData = z.infer<typeof SCMReportGeneratorDataSchema>;
