"use client";

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { GlobeIcon } from "lucide-react";
import { memo, useState } from "react";
import { toast } from "sonner";
import { BaseExecutionNode } from "../base-execution-node";
import { DiscordDialog } from "./dialog";
import { DiscordFormValues } from "./dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchDiscordRealtimeToken } from "./actions";
import { DISCORD_CHANNEL_NAME, discordChannel } from "@/inngest/channels/discord";

type DiscordNodeData = {
  webhookUrl?: string;
  content?: string;
  username?: string;

};

type DiscordNodeType = Node<DiscordNodeData>;

export const DiscordNode = memo((props: NodeProps<DiscordNodeType>) => {

  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();
  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: DISCORD_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchDiscordRealtimeToken,
  });

  const handleOpenSettings = () => {
    setDialogOpen(true);
  }
  const handleSubmit = async (values: DiscordFormValues) => {
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
      toast.success('Discord Request saved', {
        description: `Message configured with ${values.content?.length || 0} characters`,
        position: 'bottom-right'
      });

      return true;
    } catch (error) {
      console.error('Error saving Discord Request:', error);
      toast.error('Failed to save Discord Request', {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        position: 'bottom-right'
      });
      throw error; // This will prevent the dialog from closing on error
    }


  };

  const nodeData = props.data;
  const description = nodeData?.content ? `Send: ${nodeData.content.slice(0, 50)}...` : "Not configured yet";



  return (
    <>     <DiscordDialog
      open={dialogOpen}
      onOpenChange={setDialogOpen}
      onSubmit={handleSubmit}
      defaultValues={nodeData} />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="/logos/discord.svg"
        name="Discord"
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
        status={nodeStatus}

      />
    </>
  )
})
DiscordNode.displayName = "DiscordNode"