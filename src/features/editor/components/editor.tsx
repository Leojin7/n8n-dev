"use client";

import { useSuspenseWorkflow } from "@/features/workflows/hooks/use-workflows";
import { LoadingView, ErrorView } from "@/components/entity-components";


export const EditorLoading = () => {
  return <LoadingView entity={"workflow"} message={"Loading editor"} />
}

export const EditorError = () => {
  return <ErrorView message="Error loading editor" />
}

export const Editor = ({ workflowId }: { workflowId: string }) => {
  const { data: workflow } = useSuspenseWorkflow(workflowId);
  return (
    <div>
      {JSON.stringify(workflow, null, 2)}
    </div>
  )
}