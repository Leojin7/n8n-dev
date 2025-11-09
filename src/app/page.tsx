'use client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { requireAuth } from '@/lib/auth-utils';
import Logout from './logout';
import { useTRPC } from '@/trpc/client';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
const Page = () => {

  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const data = useQuery(trpc.getWorflows.queryOptions());

  const create = useMutation(trpc.createWorkflow.mutationOptions({
    onSuccess: () => {
      toast.success("Job Queued");
    }
  }));
  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center p-4 flex-col gap-4">
      protected server component
      <div className="flex flex-col gap-4">
        {JSON.stringify(data)}
      </div>
      <Button onClick={() => create.mutate()} disabled={create.isPending}>
        Create Workflow
      </Button>
      <Logout />
    </div>
  );
};

// Add the export default statement
export default Page;