"use client";

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { GlobeIcon } from "lucide-react";
import { memo, useState } from "react";
import { toast } from "sonner";
import { BaseExecutionNode } from "../base-execution-node";
import { AVAILABLE_MODELS, AnthropicDialog } from "./dialog";
import { AnthropicFormValues } from "./dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchAnthropicRealtimeToken } from "./actions";
import { ANTHROPIC_CHANNEL_NAME, anthropicChannel } from "@/inngest/channels/anthropic";

type AnthropicNodeData = {
  variableName?: string,
  model?: string;
  credentialId?: string,
  systemPrompt?: string;
  userPrompt?: string;

};

type AnthropicNodeType = Node<AnthropicNodeData>;

export const AnthropicNode = memo((props: NodeProps<AnthropicNodeType>) => {

  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();
  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: ANTHROPIC_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchAnthropicRealtimeToken,
  });

  const handleOpenSettings = () => {
    setDialogOpen(true);
  }
  const handleSubmit = async (values: AnthropicFormValues) => {
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
      toast.success('Anthropic Request saved', {
        description: `${values.model} ${values.userPrompt}`,
        position: 'bottom-right'
      });

      return true;
    } catch (error) {
      console.error('Error saving Anthropic Request:', error);
      toast.error('Failed to save Anthropic Request', {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        position: 'bottom-right'
      });
      throw error; // This will prevent the dialog from closing on error
    }


  };

  const nodeData = props.data;
  const description = nodeData?.userPrompt
    ? `${nodeData.model || AVAILABLE_MODELS[0]} ${nodeData.userPrompt.slice(0, 50)}${nodeData.userPrompt.length > 50 ? '...' : ''}`
    : "Not configured";



  return (
    <>     <AnthropicDialog
      open={dialogOpen}
      onOpenChange={setDialogOpen}
      onSubmit={handleSubmit}
      defaultValues={nodeData} />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="/logos/anthropic.svg"
        name="Anthropic"
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
        status={nodeStatus}

      />
    </>
  )
})
AnthropicNode.displayName = "AnthropicNode"