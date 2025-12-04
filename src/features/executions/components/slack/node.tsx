"use client";

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { GlobeIcon } from "lucide-react";
import { memo, useState } from "react";
import { toast } from "sonner";
import { BaseExecutionNode } from "../base-execution-node";
import { SlackDialog } from "./dialog";
import { SlackFormValues } from "./dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchSlackRealtimeToken } from "./actions";
import { SLACK_CHANNEL_NAME, slackChannel } from "@/inngest/channels/slack";

type SlackNodeData = {
  webhookUrl?: string;
  content?: string;

};

type SlackNodeType = Node<SlackNodeData>;

export const SlackNode = memo((props: NodeProps<SlackNodeType>) => {

  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();
  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: SLACK_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchSlackRealtimeToken,
  });

  const handleOpenSettings = () => {
    setDialogOpen(true);
  }
  const handleSubmit = async (values: SlackFormValues) => {
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
      toast.success('Slack Request saved', {
        description: `Message configured with ${values.content?.length || 0} characters`,
        position: 'bottom-right'
      });

      return true;
    } catch (error) {
      console.error('Error saving Slack Request:', error);
      toast.error('Failed to save Slack Request', {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        position: 'bottom-right'
      });
      throw error; // This will prevent the dialog from closing on error
    }


  };

  const nodeData = props.data;
  const description = nodeData?.content ? `Send: ${nodeData.content.slice(0, 50)}...` : "Not configured yet";



  return (
    <>     <SlackDialog
      open={dialogOpen}
      onOpenChange={setDialogOpen}
      onSubmit={handleSubmit}
      defaultValues={nodeData} />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="/logos/slack.svg"
        name="Slack"
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
        status={nodeStatus}

      />
    </>
  )
})
SlackNode.displayName = "SlackNode"