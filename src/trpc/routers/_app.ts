import { workflowsRouter } from '@/features/workflows/server/routers';
import { credentialsRouter } from "@/features/credentials/server/routers"
import { createTRPCRouter } from '@/trpc/init';
import { executionsRouter } from "@/features/executions/server/routers"
export const appRouter = createTRPCRouter({

  workflows: workflowsRouter,
  credentials: credentialsRouter,
  executions: executionsRouter,
});

export type AppRouter = typeof appRouter;