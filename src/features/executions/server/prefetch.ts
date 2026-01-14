import { trpc } from '@/trpc/server';
import { QueryClient } from '@tanstack/react-query';

export const prefetchExecutions = async (params: { page?: number; pageSize?: number }): Promise<QueryClient> => {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: [['executions', 'getMany'], { input: params, type: 'query' }],
    queryFn: () => trpc.executions.getMany(params)
  });
  return queryClient;
};

export const prefetchExecution = async (queryClient: QueryClient, id: string) => {
  return queryClient.prefetchQuery({
    queryKey: [['executions', 'getOne'], { input: { id }, type: 'query' }],
    queryFn: () => trpc.executions.getOne({ id })
  });
};