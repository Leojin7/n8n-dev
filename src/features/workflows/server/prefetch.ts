import { headers } from 'next/headers';
import { createTRPCContext } from '@/trpc/init';
import { appRouter } from '@/trpc/routers/_app';
import { createCallerFactory } from '@trpc/server/unstable-core-do-not-import';
import { prefetch } from '@/trpc/server';
import { workflowsRouter } from './routers';
import { trpc } from '@/trpc/server';
type Input = {
  search?: string;
};

type Workflow = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  userID: string;
};

export const prefetchWorkflows = async (params: Input) => {
  try {
    // Create a new caller with the current request's headers for auth
    const ctx = await createTRPCContext();

    // If user is not authenticated, return empty data
    if (!ctx.user) {
      return {
        data: [],

      };
    }

    const caller = createCallerFactory()(appRouter)(ctx);
    const result = await caller.workflows.getMany(params);

    return {
      data: result.item as Workflow[],

    };
  } catch (error) {
    console.error('Error in prefetchWorkflows:', error);
    return {
      data: [],
    };
  }
};
export const prefetchWorkflow = async (id: string) => {
  try {
    const ctx = await createTRPCContext();

    // If user is not authenticated, return null
    if (!ctx.user) {
      return null;
    }

    const caller = createCallerFactory()(appRouter)(ctx);
    const result = await caller.workflows.getOne({ id });

    return {
      data: result as Workflow | null,
    };
  } catch (error) {
    console.error('Error in prefetchWorkflow:', error);
    return {
      data: null,
    };
  }
};