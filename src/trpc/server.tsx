import 'server-only';
import { createCallerFactory } from '@trpc/server/unstable-core-do-not-import';
import { createTRPCContext } from '@/trpc/init';
import { appRouter } from '@/trpc/routers/_app';
import { TRPCQueryOptions } from '@trpc/tanstack-react-query';
import { QueryClient, dehydrate } from '@tanstack/react-query';

// Create a server-side caller factory
const createCaller = createCallerFactory();

// Create a caller for server-side usage
export const serverClient = createCaller(appRouter)(createTRPCContext());

// Export the app router and its type
export { appRouter };
export type { AppRouter } from '@/trpc/routers/_app';

// Create and export a caller for server-side usage
export const caller = createCaller(appRouter)(createTRPCContext());

// Export trpc instance for server-side usage
export const trpc = {
  ...serverClient,
  createCaller: (ctx: any) => createCaller(appRouter)(ctx || createTRPCContext())
};

// Server-side prefetch helper
export async function prefetch<T extends ReturnType<TRPCQueryOptions<any>>>(
  queryOptions: T,
) {
  const queryClient = new QueryClient();
  const { queryKey, queryFn } = queryOptions as any;

  try {
    if (queryKey[1]?.type === 'infinite') {
      await queryClient.prefetchInfiniteQuery({
        queryKey,
        queryFn: queryFn as any,
        initialPageParam: 1, // Add default page param for infinite queries
        getNextPageParam: (lastPage: any, allPages: any) => {
          // Default implementation - adjust based on your pagination logic
          return lastPage.nextCursor;
        },
      });
    } else {
      await queryClient.prefetchQuery({
        queryKey,
        queryFn: queryFn as any,
      });
    }

    return {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    };
  } catch (error) {
    console.error('Error during prefetch:', error);
    return { dehydratedState: null };
  }
}

// Helper function to create a query client for server-side rendering
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000,
      },
    },
  });
}