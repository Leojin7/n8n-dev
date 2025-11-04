import 'server-only'; // <-- ensure this file cannot be imported from the client
import { createCallerFactory } from '@trpc/server/unstable-core-do-not-import';
import { createTRPCContext } from '@/trpc/init';
import { appRouter } from '@/trpc/routers/_app';

/**
 * Create a server-side caller for the tRPC API
 */
const createCaller = createCallerFactory();

/**
 * This client invokes procedures directly on the server without fetching over HTTP
 */
export const serverClient = createCaller(appRouter)(createTRPCContext());

export { appRouter };
export type { AppRouter } from '@/trpc/routers/_app';

// Create and export a caller for server-side usage
export const caller = createCaller(appRouter)(createTRPCContext());