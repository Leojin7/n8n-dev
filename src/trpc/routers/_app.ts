import { workflowsRouter } from '@/features/workflows/server/routers';
import { credentialsRouter } from "@/features/credentials/server/routers"
import { createTRPCRouter } from '@/trpc/init';

export const appRouter = createTRPCRouter({

  workflows: workflowsRouter,
  credentials: credentialsRouter,
});

export type AppRouter = typeof appRouter;