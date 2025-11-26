"use client";

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { GlobeIcon } from "lucide-react";
import { memo, useState } from "react";
import { toast } from "sonner";
import { BaseExecutionNode } from "../base-execution-node";
import { AVAILABLE_MODELS, GeminiDialog } from "./dialog";
import { GeminiFormValues } from "./dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchGeminiRealtimeToken } from "./actions";
import { GEMINI_CHANNEL_NAME, geminiChannel } from "@/inngest/channels/gemini";

type GeminiNodeData = {
  variableName?: string,
  model?: string;
  systemPrompt?: string;
  userPrompt?: string;

};

type GeminiNodeType = Node<GeminiNodeData>;

export const GeminiNode = memo((props: NodeProps<GeminiNodeType>) => {

  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();
  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: GEMINI_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchGeminiRealtimeToken,
  });

  const handleOpenSettings = () => {
    setDialogOpen(true);
  }
  const handleSubmit = async (values: GeminiFormValues) => {
    try {
      console.log('Submitting form with values:', values);

      // Update the node data
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === props.id
            ? {
              ...node,
              data: {
                ...node.data,
                ...values,
                lastUpdated: new Date().toISOString()
              }
            }
            : node
        )
      );

      console.log('Node data updated successfully');

      // Show success toast
      toast.success('Gemini Request saved', {
        description: `${values.model} ${values.userPrompt}`,
        position: 'bottom-right'
      });

      return true;
    } catch (error) {
      console.error('Error saving Gemini Request:', error);
      toast.error('Failed to save Gemini Request', {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        position: 'bottom-right'
      });
      throw error; // This will prevent the dialog from closing on error
    }


  };

  const nodeData = props.data;
  const description = nodeData?.userPrompt ? `${nodeData.model || AVAILABLE_MODELS[0]} ${nodeData.userPrompt.slice(0, 50)}...` : "Not configured";



  return (
    <>     <GeminiDialog
      open={dialogOpen}
      onOpenChange={setDialogOpen}
      onSubmit={handleSubmit}
      defaultValues={nodeData} />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="/logos/gemini.svg"
        name="Gemini"
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
        status={nodeStatus}

      />
    </>
  )
})
GeminiNode.displayName = "GeminiNode"