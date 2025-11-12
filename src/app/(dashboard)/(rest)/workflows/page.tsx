import { requireAuth } from "@/lib/auth-utils";
import { prefetchWorkflows } from "@/features/workflows/server/prefetch";
import { WorkflowsContainer, WorkflowsList } from "@/features/workflows/components/workflows";
import { HydrateClient } from "@/components/HydrateClient";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { QueryClient, dehydrate } from '@tanstack/react-query';

const Page = async () => {
  try {
    // Create a new query client
    const queryClient = new QueryClient();

    // Get headers for the current request
    const headersList = await headers();
    const headersToSend: Record<string, string> = {};

    // Add required headers if they exist
    const cookie = headersList.get('cookie');
    const authorization = headersList.get('authorization');

    if (cookie) headersToSend.cookie = cookie;
    if (authorization) headersToSend.authorization = authorization;

    // Check if user is authenticated
    const session = await auth.api.getSession({
      headers: headersToSend
    });

    if (session?.user?.id) {
      // Prefetch data if user is authenticated
      await queryClient.prefetchQuery({
        queryKey: [['workflows', 'getMany'], { input: { search: '' }, type: 'query' }],
        queryFn: () => prefetchWorkflows({ search: '' })
      });
    }

    // Dehydrate the query client state
    const dehydratedState = dehydrate(queryClient);

    return (
      <WorkflowsContainer>
        <HydrateClient dehydratedState={dehydratedState}>
          <ErrorBoundary fallback={<p>Something went wrong loading workflows</p>}>
            <Suspense fallback={<p>Loading workflows...</p>}>
              <WorkflowsList />
            </Suspense>
          </ErrorBoundary>
        </HydrateClient>
      </WorkflowsContainer>
    );
  } catch (error) {
    console.error('Error in workflows page:', error);
    return (
      <div>
        <p>Error loading workflows. Please try again later.</p>
      </div>
    );
  }
};

export default Page;