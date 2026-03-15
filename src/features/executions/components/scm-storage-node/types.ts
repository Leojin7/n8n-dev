import { z } from 'zod';

export const SCMStorageDataSchema = z.object({
  variableName: z.string().min(1, 'Variable name is required'),
  storeReports: z.boolean(),
  storeMappings: z.boolean(),
  retentionDays: z.number().min(1).max(365),
  enableVersioning: z.boolean(),
});

export type SCMStorageData = z.infer<typeof SCMStorageDataSchema>;
