import { HydrateClient } from "@/components/HydrateClient";
import { executionsParamsLoader } from "@/features/executions/server/params-loader";
import { prefetchExecutions } from "@/features/executions/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { dehydrate } from "@tanstack/react-query";

import { ErrorBoundary } from "react-error-boundary";
import { SearchParams } from "nuqs";
import { Suspense } from "react";
import { ExecutionsContainer } from "@/features/executions/components/executions";
import { ExecutionsList } from "@/features/executions/components/executions";
import { ExecutionsError } from "@/features/executions/components/executions";
import { ExecutionsLoading } from "@/features/executions/components/executions";

type Props = {

  searchParams: Promise<SearchParams>;

}

const Page = async ({ searchParams }: Props) => {
  await requireAuth();
  const params = executionsParamsLoader(await searchParams);
  const queryClient = await prefetchExecutions(params);
  const dehydratedState = dehydrate(queryClient);

  return (
    <ExecutionsContainer>
      <HydrateClient dehydratedState={dehydratedState}>
        <ErrorBoundary fallback={<ExecutionsError></ExecutionsError>}>
          <Suspense fallback={<ExecutionsLoading></ExecutionsLoading>}>
            <ExecutionsList />
          </Suspense>
        </ErrorBoundary>
      </HydrateClient>
    </ExecutionsContainer>
  );
};
export default Page;