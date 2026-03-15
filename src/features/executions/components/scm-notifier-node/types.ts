import { z } from 'zod';

export const SCMNotifierDataSchema = z.object({
  variableName: z.string().min(1, 'Variable name is required'),
  channels: z.array(z.string()).min(1, 'At least one channel must be selected'),
  notifyOnSuccess: z.boolean(),
  notifyOnFailure: z.boolean(),
  messageTemplate: z.string().optional(),
});

export type SCMNotifierData = z.infer<typeof SCMNotifierDataSchema>;
