"use client";

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { GlobeIcon } from "lucide-react";
import { memo, useState } from "react";
import { toast } from "sonner";
import { BaseExecutionNode } from "../base-execution-node";
import { AVAILABLE_MODELS, OpenAIDialog } from "./dialog";
import { OpenAIFormValues } from "./dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchOpenAIRealtimeToken } from "./actions";
import { OPENAI_CHANNEL_NAME, openaiChannel } from "@/inngest/channels/openai";

type OpenAINodeData = {
  variableName?: string,
  model?: string;
  credential?: string,
  systemPrompt?: string;
  userPrompt?: string;
};

type OpenAINodeType = Node<OpenAINodeData>;

export const OpenAINode = memo((props: NodeProps<OpenAINodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();
  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: OPENAI_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchOpenAIRealtimeToken,
  });

  const handleOpenSettings = () => {
    setDialogOpen(true);
  }

  const handleSubmit = async (values: OpenAIFormValues) => {
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
      toast.success('OpenAI Request saved', {
        description: `${values.model} ${values.userPrompt}`,
        position: 'bottom-right'
      });

      return true;
    } catch (error) {
      console.error('Error saving OpenAI Request:', error);
      toast.error('Failed to save OpenAI Request', {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        position: 'bottom-right'
      });
      throw error; // This will prevent the dialog from closing on error
    }
  };

  const nodeData = props.data;
  const description = nodeData?.userPrompt
    ? `${nodeData.model || AVAILABLE_MODELS[0]} ${nodeData.userPrompt.slice(0, 50)}...`
    : "Not configured";

  return (
    <>
      <OpenAIDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="/logos/openai.svg"
        name="OpenAI"
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
        status={nodeStatus}
      />
    </>
  )
})
OpenAINode.displayName = "OpenAINode"