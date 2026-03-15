import { z } from 'zod';

export const SCMJavaParserDataSchema = z.object({
  variableName: z.string().min(1, 'Variable name is required'),
  repoUrl: z.string().url('Invalid repository URL'),
  branch: z.string().min(1, 'Branch is required'),
  token: z.string().min(1, 'Personal Access Token is required'),
  filePatterns: z.string().optional(),
  includeTests: z.boolean(),
  includePrivate: z.boolean(),
});

export type SCMJavaParserData = z.infer<typeof SCMJavaParserDataSchema>;
