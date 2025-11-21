"use client";
import { type NodeProps, Position, useReactFlow } from "@xyflow/react";
import { Icon, type LucideIcon } from "lucide-react";
import Image from "next/image";
import { memo, use, type ReactNode } from "react";

import { BaseNode, BaseNodeContent } from "@/components/react-flow/base-node";
import { BaseHandle } from "@/components/react-flow/base-handle";
import { WorkflowNode } from "@/components/workflow-node";
import { set } from "zod";
import { type NodeStatus, NodeStatusIndicator } from "@/components/react-flow/node-status-indicator";


interface BaseTriggerNodeProps extends NodeProps {
  icon: LucideIcon | string;
  name: string;
  description: string;
  children?: ReactNode;
  onSettings?: () => void;
  onDoubleClick?: () => void;
  status?: NodeStatus;
};

export const BaseTriggerNode = memo(
  ({
    id,
    icon: Icon,
    name,
    description,
    children,
    status = "initial",
    onSettings,
    onDoubleClick,

  }: BaseTriggerNodeProps) => {
    const { setNodes, setEdges } = useReactFlow();
    const handleDelete = () => {
      setNodes((currentNodes) => {
        const updatedNodes = currentNodes.filter((node) => node.id !== id);
        return updatedNodes;
      });
      setEdges((currentEdges) => {
        const updatedEdges = currentEdges.filter((edge) => edge.source !== id && edge.target !== id);
        return updatedEdges;
      }
      );
    };
    return (
      <WorkflowNode

        name={name}
        description={description}
        onSettings={onSettings}
        onDelete={handleDelete}
      >
        <NodeStatusIndicator status={status}
          variant="border" >
          <BaseNode status={status} onDoubleClick={onDoubleClick} className="rounded-tl-2xl relative group">
            <BaseNodeContent >
              {typeof Icon === "string" ? (
                <img src={Icon} alt={name} width={16} height={16} />
              ) : (
                <Icon className="size-4 text-muted-foreground" />
              )}
              {children}

              <BaseHandle id="source-1" type="source" position={Position.Right} />
            </BaseNodeContent>
          </BaseNode>
        </NodeStatusIndicator>
      </WorkflowNode>

    )
  }
)

BaseTriggerNode.displayName = "BaseTriggerNode";