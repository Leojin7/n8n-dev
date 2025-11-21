"use client";

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { GlobeIcon } from "lucide-react";
import { memo, useState } from "react";
import { toast } from "sonner";
import { BaseExecutionNode } from "../base-execution-node";
import { HttpRequestDialog } from "./dialog";
import { FormType } from "./dialog";

type HttpRequestNodeData = {
  endpoint?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: string;
  [key: string]: unknown;
};

type HttpRequestNodeType = Node<HttpRequestNodeData>;

export const HttpsRequestNode = memo((props: NodeProps<HttpRequestNodeType>) => {

  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();
  const nodeStatus = "initial";

  const handleOpenSettings = () => {
    setDialogOpen(true);
  }
  const handleSubmit = async (values: FormType) => {
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
                endpoint: values.endpoint,
                method: values.method,
                body: values.body,
                lastUpdated: new Date().toISOString()
              }
            }
            : node
        )
      );

      console.log('Node data updated successfully');

      // Show success toast
      toast.success('HTTP Request saved', {
        description: `${values.method} ${values.endpoint}`,
        position: 'bottom-right'
      });

      return true;
    } catch (error) {
      console.error('Error saving HTTP Request:', error);
      toast.error('Failed to save HTTP Request', {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        position: 'bottom-right'
      });
      throw error; // This will prevent the dialog from closing on error
    }

    // If you want to make the actual HTTP request, you can uncomment this:
    /*
    try {
      const response = await fetch(values.endpoint, {
        method: values.method,
        headers: {
          'Content-Type': 'application/json',
        },
        ...(values.body && { body: values.body }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Request successful:', data);
    } catch (error) {
      console.error('Error making request:', error);
      throw error; // This will show an error in the form
    }
    */
  };

  const nodeData = props.data;
  const description = nodeData?.endpoint ? `${nodeData.method || "GET"} ${nodeData.endpoint}` : "Not configured";



  return (
    <>     <HttpRequestDialog open={dialogOpen} onOpenChange={setDialogOpen}
      onSubmit={handleSubmit}
      defaultEndpoint={nodeData.endpoint}
      defaultMethod={nodeData.method} defaultBody={nodeData.body} />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon={GlobeIcon}
        name="HTTP Request"
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
        status={nodeStatus}

      />
    </>
  )
})
HttpsRequestNode.displayName = "HttpsRequestNode"