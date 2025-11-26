import { createTRPCRouter, premiumProcedure } from "@/trpc/init";
import { generateSlug } from "@/utils/generate-slug";
import { protectedProcedure } from "@/trpc/init";
import type { Node, Edge } from "@xyflow/react";
import prisma from "@/lib/db";
import { unknown, util, z } from "zod";
import { CarTaxiFront, Search } from "lucide-react";
import { PAGINATION } from "@/config/constants";
import { CredentialType, NodeType } from "@/generated/prisma";

import { nodeComponents } from "@/config/node-components";
import { inngest } from "@/inngest/client";
import { sendWorkflowExecution } from "@/inngest/utils"

export const credentialsRouter = createTRPCRouter({

  // for enabling the creting of  workflows with polar subscription (change protected to premium procedure only)
  create: protectedProcedure.input(z.object({
    name: z.string().min(1, "Name is Required"),
    type: z.enum(CredentialType),
    value: z.string().min(1, "Value is Required"),
  })).mutation(({ ctx, input }) => {
    const { name, value, type } = input;
    return prisma.credential.create({
      data: {
        name,
        userId: ctx.auth.user.id,
        type,
        value, //TODO :Consider encrypting in production
      },
    });
  }),

  remove: protectedProcedure.input(z.object({ id: z.string() })).mutation(({ ctx, input }) => {
    return prisma.credential.delete({
      where: {
        id: input.id,
        userId: ctx.auth.user.id
      },
    });
  }),

  update: protectedProcedure.input(z.object({
    id: z.string(),
    name: z.string().min(1, "Name is Required"),
    type: z.enum(CredentialType),
    value: z.string().min(1, "Value is Required"),


  }),
  ).mutation(async ({ ctx, input }) => {
    const { id, name, type, value } = input;

    // Verify workflow exists and user has access
    const credential = await prisma.credential.findUniqueOrThrow({
      where: { id, userId: ctx.auth.user.id }
    });
    return prisma.credential.update({
      where: { id, userId: ctx.auth.user.id },
      data: {
        name,
        type,
        value,
      }
    });

  }),
  getOne: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {

    return prisma.credential.findUniqueOrThrow({
      where: { id: input.id, userId: ctx.auth.user.id },

    })
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
      prisma.credential.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        where: {
          userId: ctx.auth.user.id,
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
      prisma.credential.count({
        where: {
          userId: ctx.auth.user.id,
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

  getByType: protectedProcedure.input(z.object({

    type: z.enum(CredentialType),
  }))
    .query(async ({ input, ctx }) => {


      const { type } = input;
      return prisma.credential.findMany({
        where: {
          type, userId: ctx.auth.user.id,
        },
        orderBy: {
          updatedAt: "desc",
        },
      })
    })
});