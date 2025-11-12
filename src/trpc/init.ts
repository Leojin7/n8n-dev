import { initTRPC, TRPCError } from '@trpc/server';
import { cache } from 'react';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { polarClient } from '@/lib/polar';

// Define types for the context
type User = {
  id: string;
  email?: string | null;
  // Add other user properties as needed
} | null;

type CreateContextOptions = {
  user: User;
  // Add other context properties here
};

// Create a context with the user type
export const createTRPCContext = cache(async (): Promise<CreateContextOptions> => {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return { user: null };
    }

    return {
      user: {
        id: session.user.id,
        email: session.user.email,
        // Add any other user properties you need
      },
    };
  } catch (error) {
    console.error('Error creating TRPC context:', error);
    return { user: null };
  }
});

// Initialize tRPC
type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
  // Optional: Add any custom configuration here
  // transformer: superjson,
});

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

// Protected procedure that checks if the user is logged in
export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      auth: {
        user: ctx.user,
      },
    },
  });
});

// Premium procedure that requires an active subscription
export const premiumProcedure = protectedProcedure.use(async ({ ctx, next }) => {



  const customer = await polarClient.customers.getStateExternal({
    externalId: ctx.user.id,
  });

  if (!customer.activeSubscriptions || customer.activeSubscriptions.length === 0) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Active subscription required",
    });
  }

  return next({
    ctx: { ...ctx, customer }
  });
});
