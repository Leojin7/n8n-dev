import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, premiumProcedure } from '../init';
import prisma from '@/lib/db';
import { inngest } from '@/inngest/client';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { TRPCError } from '@trpc/server';
import { logger } from 'better-auth';

export const appRouter = createTRPCRouter({
  testAi: premiumProcedure.mutation(async () => {
    await inngest.send({
      name: "execute/ai",
    })
    return { success: true, message: "job-queued" };
  }),

  getWorkflows: protectedProcedure.query(({ ctx }) => {
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