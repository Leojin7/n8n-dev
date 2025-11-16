"use client";

import { SidebarTrigger } from "@components/ui/sidebar";
import { SaveIcon } from "lucide-react";
import { Button } from "@components/ui/button";

import { useSuspenseWorkflow, useUpdateWorkflowName } from "@/features/workflows/hooks/use-workflows";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from "@components/ui/breadcrumb";

import { Input } from "@components/ui/input";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
export const EditorSaveButton = ({ workflowId }: { workflowId: string }) => {
  return (
    <div className="ml-auto flex items-center gap-2">
      <Button size="sm" onClick={() => { }} disabled={false}>

        <SaveIcon />
        <p>Save</p>

      </Button>

    </div>
  );

}


export const EditorNameInput = ({ workflowId }: { workflowId: string }) => {
  const { data: workflow } = useSuspenseWorkflow(workflowId);
  const updateWorkflow = useUpdateWorkflowName();

  const [isEditing, setIsEdititing] = useState(false);
  const [name, setName] = useState(workflow.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (workflow.name) {
      setName(workflow.name);
    }
  }, [workflow.name])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing])

  const handleSave = async () => {
    if (name === workflow.name) {
      setIsEdititing(false);
      return;
    }


    try {
      await updateWorkflow.mutateAsync({ id: workflowId, name: name })
    }
    catch {
      setName(workflow.name);
    }
    finally {
      setIsEdititing(false);
    }

  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setName(workflow.name);
      setIsEdititing(false);
    }
  };

  if (isEditing) {
    return (
      <Input
        disabled={updateWorkflow.isPending}
        ref={inputRef}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={handleSave}
        className="h-7 w-auto min-w-[100px] px-2"
        onKeyDown={handleKeyDown}
      />
    )
  }
  return (
    <BreadcrumbItem onClick={() => setIsEdititing(true)} className="cursor-pointer hover:text-foreground">
      <Input value={workflow.name} onChange={(e) => setName(e.target.value)} />
    </BreadcrumbItem>
  )
}
export const EditorBreadcrumbs = ({ workflowId }: { workflowId: string }) => {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link prefetch href="/workflows">
              Workflows
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbSeparator />
        <EditorNameInput workflowId={workflowId} />
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export const EditorHeader = ({ workflowId }: { workflowId: string }) => {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 bg-background">
      <SidebarTrigger />
      <div className="flex flex-row items-center justify-between">


        <EditorBreadcrumbs workflowId={workflowId} />
        <EditorSaveButton workflowId={workflowId} />
      </div>
    </header>
  );
};