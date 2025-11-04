import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';
import prisma from '@/lib/db';
export const appRouter = createTRPCRouter({
  getUsers: baseProcedure

    .query((opts) => {
      return prisma.user.findMany();
    }),
});

export type AppRouter = typeof appRouter;