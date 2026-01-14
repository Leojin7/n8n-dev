'use client';

import { formatDistanceToNow } from "date-fns";
import { EntityHeader, EntityContainer, EntitySearch, EntityPagination, LoadingView, ErrorView, EmptyView, EntityItem } from "@/components/entity-components";
import { useSuspenseExecutions } from "../hooks/use-executions";
import { CheckCircle2Icon, ClockIcon } from "lucide-react";
import { XCircleIcon } from "lucide-react";
import { Loader2Icon } from "lucide-react";
import { useExecutionsParams } from "../hooks/use-executions-params";

import { EntityList } from "@/components/entity-components";
import type { Execution } from "@/generated/prisma";
import { PackageOpenIcon, CreditCardIcon } from "lucide-react";
import { ExecutionStatus } from "@/generated/prisma";

import Image from "next/image";

export const ExecutionsList = () => {

  const executions = useSuspenseExecutions();

  return (
    <EntityList
      items={executions.data.item}
      getKey={(execution) => execution.id}
      renderItem={(execution) => <ExecutionItem data={execution} />}
      emptyView={<ExecutionsEmpty />}

    />
  );
};

export const ExecutionsHeader = ({ disabled }: { disabled?: boolean }) => {

  return (


    <EntityHeader
      title="Executions"
      description="Create and manage your Executions"
      disabled={disabled}
      newButtonLabel="New Execution"


    />
  );
}

export const ExecutionsPagination = () => {
  const executions = useSuspenseExecutions();
  const [params, setParams] = useExecutionsParams();
  return (
    <EntityPagination
      disabled={executions.isPending}
      page={params.page}
      totalPages={executions.data.totalPages}
      onPageChange={(page) => setParams({ ...params, page })}
    />
  );
}

export const ExecutionsContainer = ({ children }: {
  children: React.ReactNode;
}) => {
  return (
    <div className="h-full">
      <EntityContainer
        header={<ExecutionsHeader />}

        pagination={<ExecutionsPagination />}
      >
        {children}
      </EntityContainer>
    </div>
  );
}


export const ExecutionsLoading = () => {
  return (
    <LoadingView entity="Executions" message="Loading Executions..." />
  );
}

export const ExecutionsError = () => {
  return (
    <ErrorView message=" Error Loading Executions..." />
  );
}


export const ExecutionsEmpty = () => {

  return (

    <EmptyView
      message="No Executions found, Get Started with your First Execution By Running a Workflow"

    />
  );
};

const getStatusIcon = (status: ExecutionStatus) => {
  switch (status) {

    case ExecutionStatus.SUCCESS:
      return <CheckCircle2Icon className="size-5 text-green-600" />
    case ExecutionStatus.FAILED:
      return <XCircleIcon className="size-5 text-red-600" />
    case ExecutionStatus.RUNNING:
      return <Loader2Icon className="size-5 text-primary animate-spin" />
    default:
      return <ClockIcon className="size-5 text-muted-foreground" />
  }
}

const formatStatus = (status: ExecutionStatus) => {

  return status.charAt(0) + status.slice(1).toLowerCase();
}

export const ExecutionItem = ({ data, }: {
  data: Execution & {
    workflow: {
      id: string,
      name: string;
    } | null;
  }
}) => {
  const duration = data.completedAt
    ? Math.round((data.completedAt.getTime() - new Date(data.startedAt).getTime()) / 1000)
    : null;
  const logo = getStatusIcon(data.status)
  const subtitle = (
    <>
      {data.workflow?.name} &bull; Started{" "}
      {formatDistanceToNow((data.startedAt), { addSuffix: true })}
      {duration !== null && <>&bull; Took {duration} seconds</>}
    </>
  )
  return (
    <EntityItem
      href={`/executions/${data.id}`}
      item={data}
      title={formatStatus(data.status)}
      subtitle={subtitle}
      image={
        <div className="size-8 flex-center justify-center">
          {getStatusIcon(data.status)}
        </div>
      }

    />
  )
}

