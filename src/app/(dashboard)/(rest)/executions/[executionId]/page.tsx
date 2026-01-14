import { HydrateClient } from "@/components/HydrateClient";
import { requireAuth } from "@/lib/auth-utils";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ExecutionView } from "@/features/executions/components/execution";
import { ExecutionsError } from "@/features/executions/components/executions";
import { ExecutionsLoading } from "@/features/executions/components/executions";
import { QueryClient } from '@tanstack/react-query';
import { prefetchExecution } from "@/features/executions/server/prefetch";


interface PageProps {
  params: Promise<{ executionId: string }>
}
const Page = async ({ params }: PageProps) => {
  await requireAuth();
  const { executionId } = await params;

  const queryClient = new QueryClient();
  await prefetchExecution(queryClient, executionId);
  return (
    <div className="p-4 md:px-10 md:py-6 h-[calc(100vh-64px)] flex flex-col">
      <div className="mx-auto max-w-screen-xl w-full h-full flex flex-col">

        <HydrateClient>
          <ErrorBoundary fallback={<ExecutionsError />}>
            <Suspense fallback={<ExecutionsLoading />}>
              <ExecutionView executionId={executionId} />
            </Suspense>
          </ErrorBoundary>
        </HydrateClient>
      </div>

    </div>
  );
};
export default Page;
