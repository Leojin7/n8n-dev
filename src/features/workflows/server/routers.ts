import { createTRPCRouter, premiumProcedure } from "@/trpc/init";
import { generateSlug } from "@/utils/generate-slug";
import { protectedProcedure } from "@/trpc/init";
import type { Node, Edge } from "@xyflow/react";
import prisma from "@/lib/db";
import { z } from "zod";
import { Search } from "lucide-react";
import { PAGINATION } from "@/config/constants";
import { NodeType } from "@/generated/prisma";

export const workflowsRouter = createTRPCRouter({
  create: premiumProcedure.mutation(({ ctx }) => {
    return prisma.workflow.create({


      data: {
        name: generateSlug(3),
        userID: ctx.auth.user.id,
        node: {
          create: {
            name: NodeType.INITIAL,
            type: NodeType.INITIAL,
            position: { x: 0, y: 0 },
          },
        },
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
      },
    });
  }),


  getOne: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const workflow = await prisma.workflow.findUniqueOrThrow({
      where: {
        id: input.id,
        userID: ctx.auth.user.id
      }, include: {
        node: true,
        connections: true,
      }
    });
    const nodes: Node[] = workflow.node.map(node => {
      return {
        id: node.id,
        type: node.type,
        name: node.name,
        data: (node.data as Record<string, unknown>) || {},
        position: node.position as { x: number; y: number },

      }
    });
    const edges: Edge[] = workflow.connections.map(connection => {
      return {
        id: connection.id,
        source: connection.fromNodeId,
        sourceHandle: connection.fromOutput,
        target: connection.toNodeId,
        targetHandle: connection.toInput,
        markerEnd: "Arrow",
        markerStart: "Arrow",

      }
    })
    return {
      id: workflow.id,
      name: workflow.name,
      nodes,
      edges,
    };
  }),


  getMany: protectedProcedure.input(z.object({
    page: z.number().default(PAGINATION.DEFAULT_PAGE), pageSize:
      z.number()
        .min(PAGINATION.MIN_PAGE_SIZE)
        .max(PAGINATION.MAX_PAGE_SIZE)
        .default(PAGINATION.DEFAULT_PAGE_SIZE), search: z.string().default(""),
  })).query(async ({ ctx, input }) => {

    const { page, pageSize, search } = input;
    const [item, totalCount] = await Promise.all([
      prisma.workflow.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        where: {
          userID: ctx.auth.user.id,
          ...(search && {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          }),
        },
        orderBy: {
          updatedAt: 'desc',
        },
      }),
      prisma.workflow.count({
        where: {
          userID: ctx.auth.user.id,
          name: {
            contains: search,
            mode: 'insensitive',
          },

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
      search,
      totalCount,
      totalPages,
      hasPreviousPage,
      hasNextPage,
    };
  }),

});