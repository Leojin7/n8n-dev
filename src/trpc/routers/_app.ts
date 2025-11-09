import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure } from '../init';
import prisma from '@/lib/db';
import { inngest } from '@/inngest/client';

export const appRouter = createTRPCRouter({
  getWorkflows: protectedProcedure.query(({ ctx }) => {
    return prisma.workflow.findMany();

  }),
  createWorkflow: protectedProcedure.mutation(async () => {
    const event = {
      name: "test/hello.world",
      data: {
        email: "dev@nodebase.ai"
      }
    };

    try {
      await inngest.send(event);
      return { success: true, message: "job-queued" };
    } catch (error) {
      console.error('Failed to enqueue workflow job:', {
        error,
        eventName: event.name,
        payload: event.data,
      });
      
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to enqueue workflow job',
        cause: error,
      });
    }
  }),
});

export type AppRouter = typeof appRouter;