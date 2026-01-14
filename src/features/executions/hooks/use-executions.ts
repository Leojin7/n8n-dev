import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useExecutionsParams } from "./use-executions-params";
/**
 * Hook to fetch credentials using suspense
 */
export const useSuspenseExecutions = () => {
  const trpc = useTRPC();
  const [params] = useExecutionsParams();
  const baseOptions = trpc.executions.getMany.queryOptions(params);
  return useSuspenseQuery({
    ...baseOptions,
    refetchInterval: 3000, // Poll every 3 seconds for live status updates
  });
};


export const useSuspenseExecution = (id: string) => {
  const trpc = useTRPC();

  return useSuspenseQuery(trpc.executions.getOne.queryOptions({ id }));
};




