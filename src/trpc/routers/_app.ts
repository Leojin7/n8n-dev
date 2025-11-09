import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../init';
import prisma from '@/lib/db';
import { inngest } from '@/inngest/client';
export const appRouter = createTRPCRouter({
  getWorflows: protectedProcedure.query(({ ctx }) => {
    return prisma.workflow.findMany();

  }),
  createWorkflow: protectedProcedure.mutation(async () => {

    await inngest.send({
      name: "test/hello.world",
      data: {
        email: "dev@nodebase.ai"
      }
    })
    return { success: true, message: "job-queued" }
  }),
});

export type AppRouter = typeof appRouter;