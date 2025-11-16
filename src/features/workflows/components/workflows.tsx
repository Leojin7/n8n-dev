'use client';

import { formatDistanceToNow } from "date-fns";
import { EntityHeader, EntityContainer, EntitySearch, EntityPagination, LoadingView, ErrorView, EmptyView, EntityItem } from "@/components/entity-components";
import { useRemoveWorkflow, useSuspenseWorkflows } from "../hooks/use-workflows";
import { useCreateWorkflows } from "../hooks/use-workflows";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { useRouter } from "next/navigation";
import { useWorkflowsParams } from "../hooks/use-workflows-params";
import { useEntitySearch } from "@/hooks/use-entity-search";
import { EntityList } from "@/components/entity-components";
import type { Workflow } from "@/generated/prisma";
import { PackageOpenIcon, WorkflowIcon } from "lucide-react";

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
    <EntityList
      items={workflows.data.item}
      getKey={(workflow) => workflow.id}
      renderItem={(workflow) => <WorkflowItem data={workflow} />}
      emptyView={<WorkflowsEmpty />}
      loadingView={<WorkflowsLoading />}
      errorView={<WorkflowsError />}
    />
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


export const WorkflowsLoading = () => {
  return (
    <LoadingView entity="workflows" message="Loading workflows..." />
  );
}

export const WorkflowsError = () => {
  return (
    <ErrorView message=" Error Loading workflows..." />
  );
}


export const WorkflowsEmpty = () => {

  const createWorkflow = useCreateWorkflows();
  const { handleError, modal } = useUpgradeModal();
  const router = useRouter();
  const handleCreate = () => {
    createWorkflow.mutate(undefined, {
      onSuccess: (data) => {
        router.push(`/workflows/${data.id}`);
      },
      onError: (error) => {
        return handleError(error);
      },
    })
  }
  return (
    <>
      {modal}
      <EmptyView
        onNew={handleCreate}
        message="No workflows found, Create your First workflow"

      />
    </>
  );
};

export const WorkflowItem = ({ data }: { data: Workflow }) => {
  const removeWorkflow = useRemoveWorkflow();

  const handleRemove = () => {
    removeWorkflow.mutate({ id: data.id });
  }

  return (
    <EntityItem
      href={`/workflows/${data.id}`}
      item={data}
      title={data.name}
      subtitle={
        <>
          Updated {formatDistanceToNow(new Date(data.updatedAt), { addSuffix: true })}{" "}
          &bull; Created{" "}
          {formatDistanceToNow(new Date(data.createdAt), { addSuffix: true })}
        </>
      } image={
        <div className="size-8 flex-center justify-center">
          <WorkflowIcon className="size-5 text-muted-foreground" />
        </div>
      }
      onRemove={handleRemove}
      isRemoving={removeWorkflow.isPending}
    />
  )
}

