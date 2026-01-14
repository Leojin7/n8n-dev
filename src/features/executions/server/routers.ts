import { createTRPCRouter } from "@/trpc/init";
import { protectedProcedure } from "@/trpc/init";
import prisma from "@/lib/db";
import { z } from "zod";
import { PAGINATION } from "@/config/constants";


export const executionsRouter = createTRPCRouter({
  getOne: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {

    return prisma.execution.findUniqueOrThrow({
      where: {
        id: input.id,
        workflow: { userID: ctx.auth.user.id }
      },
      include: {
        workflow: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    })
  }),
  getMany: protectedProcedure.input(z.object({
    page: z.number().min(1, 'Page must be at least 1').default(PAGINATION.DEFAULT_PAGE),
    pageSize: z.number()
      .min(PAGINATION.MIN_PAGE_SIZE)
      .max(PAGINATION.MAX_PAGE_SIZE)
      .default(PAGINATION.DEFAULT_PAGE_SIZE)
  })).query(async ({ ctx, input }) => {

    const { page, pageSize } = input;
    const [item, totalCount] = await Promise.all([
      prisma.execution.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        where: {
          workflow: { userID: ctx.auth.user.id },

        },
        orderBy: {
          startedAt: 'desc',
        },
        include: {
          workflow: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.execution.count({
        where: {
          workflow: { userID: ctx.auth.user.id, }

        },
      })
    ]);


    const totalPages = Math.ceil(totalCount / pageSize);
    const hasPreviousPage = page > PAGINATION.DEFAULT_PAGE;
    const hasNextPage = page < totalPages;
    return {
      item,
      page,
      pageSize,
      totalCount,
      totalPages,
      hasPreviousPage,
      hasNextPage,
    };
  }),


});