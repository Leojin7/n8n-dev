'use client';

import { EntityHeader, EntityContainer } from "@/components/entity-components";
import { useSuspenseWorkflows } from "../hooks/use-workflows";
import { useCreateWorkflows } from "../hooks/use-workflows";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { useRouter } from "next/navigation";

export const WorkflowsList = () => {
  const workflows = useSuspenseWorkflows();

  return (

    <p>
      {JSON.stringify(workflows.data, null, 2)}
    </p>

  );
};

export const WorkflowsHeader = ({ disabled }: { disabled?: boolean }) => {
  const createWorkflow = useCreateWorkflows();
  const router = useRouter();
  const { handleError, modal } = useUpgradeModal();
  const handleCreate = () => {
    createWorkflow.mutate(undefined, {

      onSuccess: (data) => {
        router.push(`/workflows/${data.id}`);
      },

      onError: (error) => {

        return handleError(error);

      },
    });
  }
  return (
    <>
      {modal}
      <EntityHeader
        title="Workflows"
        description="Create and manage your workflows"
        disabled={disabled}
        onNew={handleCreate}
        newButtonLabel="New Workflow"
        isCreating={createWorkflow.isPending}
      />

    </>
  );
}



export const WorkflowsContainer = ({ children }: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContainer header={<WorkflowsHeader />}>
      {children}
    </EntityContainer>
  );
} 
