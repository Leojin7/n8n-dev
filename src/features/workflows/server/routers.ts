import { createTRPCRouter, premiumProcedure } from "@/trpc/init";
import { protectedProcedure } from "@/trpc/init";

import prisma from "@/lib/db";
import { z } from "zod";
import { Search } from "lucide-react";

export const workflowsRouter = createTRPCRouter({
  create: premiumProcedure.mutation(({ ctx }) => {
    return prisma.workflow.create({


      data: {
        name: "New Workflow",
        userID: ctx.auth.user.id
      },
    });


  }),

  remove: protectedProcedure.input(z.object({ id: z.string() })).mutation(({ ctx, input }) => {
    return prisma.workflow.delete({
      where: {
        id: input.id,
        userID: ctx.auth.user.id
      }
    });
  }),

  updateName: protectedProcedure.input(z.object({ id: z.string(), name: z.string().min(1) })).mutation(({ ctx, input }) => {
    return prisma.workflow.update({
      where: {
        id: input.id,
        userID: ctx.auth.user.id
      },
      data: {
        name: input.name
      }
    });
  }),


  getOne: protectedProcedure.input(z.object({ id: z.string() })).query(({ ctx, input }) => {
    return prisma.workflow.findUnique({
      where: {
        id: input.id,
        userID: ctx.auth.user.id
      }
    });
  }),


  getMany: protectedProcedure.input(z.object({ search: z.string().optional() })).query(({ ctx, input }) => {
    return prisma.workflow.findMany({
      where: {
        userID: ctx.auth.user.id,
        ...(input?.search && {
          name: {
            contains: input.search,
            mode: 'insensitive',
          },
        }),
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }),

});