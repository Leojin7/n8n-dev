import { headers } from 'next/headers';
import { createTRPCContext } from '@/trpc/init';
import { appRouter } from '@/trpc/routers/_app';
import { createCallerFactory } from '@trpc/server/unstable-core-do-not-import';
import { prefetch } from '@/trpc/server';
import { credentialsRouter } from './routers';
import { trpc } from '@/trpc/server';
type Input = {
  search?: string;
};

type Credential = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  userId: string;
};

export const prefetchCredentials = async (params: Input) => {
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
    const result = await caller.credentials.getMany(params);

    return {
      data: result.item as Credential[],

    };
  } catch (error) {
    console.error('Error in prefetch Credentials:', error);
    return {
      data: [],
    };
  }
};
export const prefetchCredential = async (id: string) => {
  try {
    const ctx = await createTRPCContext();

    // If user is not authenticated, return null
    if (!ctx.user) {
      return null;
    }

    const caller = createCallerFactory()(appRouter)(ctx);
    const result = await caller.credentials.getOne({ id });

    return {
      data: result as Credential | null,
    };
  } catch (error) {
    console.error('Error in prefetch Credential:', error);
    return {
      data: null,
    };
  }
};