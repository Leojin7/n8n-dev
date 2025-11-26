"use client";
import { NodeType } from "@/generated/prisma";
import { SidebarTrigger } from "@components/ui/sidebar";
import { SaveIcon } from "lucide-react";
import { Button } from "@components/ui/button";
import { ExecuteWorkflowButton } from "./execute-workflow-button";
import { useSuspenseWorkflow, useUpdateWorkflowName, useUpdateWorkflow } from "@/features/workflows/hooks/use-workflows";
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
import { useAtomValue } from "jotai";
import { editorAtom } from "../store/atoms";


export const EditorSaveButton = ({ workflowId }: { workflowId: string }) => {

  const editor = useAtomValue(editorAtom);
  const { data: workflow } = useSuspenseWorkflow(workflowId);
  const saveWorkflow = useUpdateWorkflow();
  const handleSave = async () => {
    if (!editor || !workflow) {
      return;
    }
    const editorNodes = editor.getNodes();
    const editorEdges = editor.getEdges();

    // Normalize nodes to match the schema (ensure type is present)
    const nodes = editorNodes
      .filter((n) => n.type)
      .map((n) => ({
        id: n.id,
        type: n.type as NodeType,
        position: n.position,
        data: (n.data as Record<string, any>) || {},
      }));

    // Normalize edges to match the schema
    const edges = editorEdges.map((e) => ({
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle || undefined,
      targetHandle: e.targetHandle || undefined,
    }));

    saveWorkflow.mutate({
      id: workflowId,
      name: workflow.name,
      nodes,
      edges,
    });
  }
  return (
    <div className="ml-auto flex items-center gap-2">
      <Button
        size="sm"
        onClick={handleSave}
        disabled={saveWorkflow.isPending}
      >
        <SaveIcon className="size-4" />
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