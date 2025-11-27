import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient, useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCredentialsParams } from "./use-credentials-params";
import { CredentialType } from "@/generated/prisma";
/**
 * Hook to fetch credentials using suspense
 */
export const useSuspenseCredentials = () => {
  const trpc = useTRPC();
  const [params] = useCredentialsParams();
  return useSuspenseQuery(trpc.credentials.getMany.queryOptions(params));
};

export const useCreateCredentials = () => {
  const trpc = useTRPC();

  const queryClient = useQueryClient();

  return useMutation(trpc.credentials.create.mutationOptions({

    onSuccess(data) {
      toast.success(`Credential ${data.name} created successfully`);
      queryClient.invalidateQueries(trpc.credentials.getMany.queryOptions({}));
    },
    onError: (error) => {
      toast.error(` Failed to create credential and ${error.message}`);

    }
  }));
};



export const useRemoveCredential = () => {
  const trpc = useTRPC();

  const queryClient = useQueryClient();

  return useMutation(trpc.credentials.remove.mutationOptions({
    onSuccess(data) {
      toast.success(`Credential ${data.name} removed successfully`);
      queryClient.invalidateQueries(trpc.credentials.getMany.queryOptions({}));
      queryClient.invalidateQueries(trpc.credentials.getOne.queryFilter({ id: data.id }));
    },
    onError: (error) => {
      toast.error(` Failed to remove credential and ${error.message}`);

    }
  }));
}

export const useSuspenseCredential = (id: string) => {
  const trpc = useTRPC();

  return useSuspenseQuery(trpc.credentials.getOne.queryOptions({ id }));
};


export const useUpdateCredential = () => {
  const trpc = useTRPC();

  const queryClient = useQueryClient();

  return useMutation(trpc.credentials.update.mutationOptions({

    onSuccess(data) {
      toast.success(`Credential ${data.name} saved successfully`);
      queryClient.invalidateQueries(trpc.credentials.getMany.queryOptions({}));
      queryClient.invalidateQueries(trpc.credentials.getOne.queryOptions({ id: data.id }));
    },
    onError: (error) => {
      toast.error(` Failed to save credential and ${error.message}`);

    }
  }));
};


export const useCredentialsByType = (type: CredentialType) => {

  const trpc = useTRPC();
  const [params] = useCredentialsParams();
  return useQuery(trpc.credentials.getByType.queryOptions({ type }));


}