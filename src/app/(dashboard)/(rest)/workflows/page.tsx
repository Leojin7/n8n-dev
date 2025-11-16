import { requireAuth } from "@/lib/auth-utils";
import { prefetchWorkflows } from "@/features/workflows/server/prefetch";
import { WorkflowsContainer, WorkflowsList } from "@/features/workflows/components/workflows";
import { HydrateClient } from "@/components/HydrateClient";
import { ErrorBoundary } from "react-error-boundary";
import { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { QueryClient, dehydrate } from '@tanstack/react-query';
import { workflowsParamsLoader } from '@/features/workflows/server/params-loader';
import { WorkflowsLoading, WorkflowsError } from '@/features/workflows/components/workflows';

type Props = {
  searchParams: Promise<SearchParams>
}



const Page = async ({ searchParams }: Props) => {
  await requireAuth();

  const params = await workflowsParamsLoader(searchParams);
  prefetchWorkflows(params);

  return (
    <WorkflowsContainer>
      <HydrateClient>
        <ErrorBoundary fallback={<WorkflowsError />}>
          <Suspense fallback={<WorkflowsLoading />}>
            <WorkflowsList />
          </Suspense>
        </ErrorBoundary>
      </HydrateClient>
    </WorkflowsContainer>
  );
}


export default Page;