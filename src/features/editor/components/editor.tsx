"use client";
import { useState, useCallback, useMemo } from 'react';
import { ExecuteWorkflowButton } from "./execute-workflow-button";
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type NodeChange,
  type EdgeChange,
  type Connection,
  type Node,
  type Edge,
  Background,
  Controls,
  MiniMap,
  Panel,
} from '@xyflow/react';
import { useSuspenseWorkflow } from "@/features/workflows/hooks/use-workflows";
import { LoadingView, ErrorView } from "@/components/entity-components";
import { nodeComponents } from "@/config/node-components";
import '@xyflow/react/dist/style.css';
import { AddNodeButton } from "./add-node-button";
import { useSetAtom } from 'jotai';

import { editorAtom } from '../store/atoms';
import { NodeType } from '@/generated/prisma';
export const EditorLoading = () => {
  return <LoadingView entity={"workflow"} message={"Loading editor"} />
}

export const EditorError = () => {
  return <ErrorView message="Error loading editor" />
}



export const Editor = ({ workflowId }: { workflowId: string }) => {
  const { data: workflow } = useSuspenseWorkflow(workflowId);
  const setEditor = useSetAtom(editorAtom);
  const [nodes, setNodes] = useState<Node[]>(workflow.nodes);
  const [edges, setEdges] = useState<Edge[]>(workflow.edges);
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );
  const onConnect = useCallback(
    (params: Connection) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );

  const hasManualTrigger = useMemo(() => {
    return nodes.some((node) => node.type === NodeType.MANUAL_TRIGGER)
  }, [nodes])
  return (
    <div className="w-full h-[calc(100vh-64px)]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeComponents}
        onInit={setEditor}
        fitView
        snapGrid={[10, 10]}
        snapToGrid
        panOnScroll
        panOnDrag={false}
        selectionOnDrag
        proOptions={{
          hideAttribution: true,
        }}
      >
        <Background />
        <Controls />
        <MiniMap />
        <Panel position="top-right">
          <AddNodeButton />
        </Panel>
        {hasManualTrigger && (
          <Panel position="bottom-center">
            <ExecuteWorkflowButton workflowId={workflowId} />
          </Panel>
        )}
      </ReactFlow>
    </div>
  )
}