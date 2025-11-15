'use client';

import { EntityHeader, EntityContainer, EntitySearch, EntityPagination } from "@/components/entity-components";
import { useSuspenseWorkflows } from "../hooks/use-workflows";
import { useCreateWorkflows } from "../hooks/use-workflows";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { useRouter } from "next/navigation";
import { useWorkflowsParams } from "../hooks/use-workflows-params";
import { useEntitySearch } from "@/hooks/use-entity-search";


export const WorkflowsSearch = () => {
  const [params, setParams] = useWorkflowsParams();
  const { searchValue, setSearchValue } = useEntitySearch({
    params,
    setParams,
  })

  return (
    <EntitySearch
      value={searchValue}
      onChange={(value) => setSearchValue(value)}
      placeholder="             Search workflows"
    />
  );
};

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

export const WorkflowsPagination = () => {
  const workflows = useSuspenseWorkflows();
  const [params, setParams] = useWorkflowsParams();
  return (
    <EntityPagination
      disabled={workflows.isPending}
      page={params.page}
      totalPages={workflows.data.totalPages}
      onPageChange={(page) => setParams({ ...params, page })}
    />
  );
}

export const WorkflowsContainer = ({ children }: {
  children: React.ReactNode;
}) => {
  return (
    <div className="h-full">
      <EntityContainer
        header={<WorkflowsHeader />}
        search={<WorkflowsSearch />}
        pagination={<WorkflowsPagination />}
      >
        {children}
      </EntityContainer>
    </div>
  );
}
