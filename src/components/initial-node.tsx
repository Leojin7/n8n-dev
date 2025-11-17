"use client";

import type { NodeProps } from "@xyflow/react";
import { PlusIcon } from "lucide-react";
import { memo } from "react";
import { PlaceholderNode } from "./react-flow/placeholder-node";
import { WorkflowNode } from "./workflow-node";

export const InitialNode = memo(({ data, ...props }: NodeProps) => {
  const handleSettings = () => {
    console.log('Settings clicked');

  };

  const handleDelete = () => {
    console.log('Delete clicked');
    // Add your delete logic here
  };

  return (
    <WorkflowNode showToolbar={false}
    >
      <PlaceholderNode
        {...props}
        onClick={() => {
          console.log('Node clicked');

        }}
      >
        <div className="flex items-center justify-center">
          <PlusIcon className="size-5 text-primary" />
        </div>
      </PlaceholderNode>
    </WorkflowNode>
  );
});

InitialNode.displayName = "InitialNode";