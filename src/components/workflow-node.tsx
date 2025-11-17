"use client";

import { NodeToolbar, Position } from "@xyflow/react";
import { SettingsIcon, TrashIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "./ui/button";

interface WorkflowNodeProps {
  children: ReactNode;
  showToolbar?: boolean;
  onDelete?: () => void;
  onSelect?: () => void;
  onSettings?: () => void;
  name?: string;
  description?: string;
}

export function WorkflowNode({
  children,
  showToolbar = true,
  onDelete,
  onSettings,
  name,
  description,
}: WorkflowNodeProps) {
  const [isToolbarVisible, setIsToolbarVisible] = useState(false);

  const handleNodeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsToolbarVisible(!isToolbarVisible);
  };

  const handleButtonClick = (e: React.MouseEvent, callback?: () => void) => {
    e.stopPropagation();
    callback?.();
    setIsToolbarVisible(false);
  };

  return (
    <div
      className="relative"
      onClick={handleNodeClick}
    >
      {showToolbar && (
        <NodeToolbar
          isVisible={isToolbarVisible}
          position={Position.Top}
          className="flex gap-1 p-1 bg-background rounded-md border shadow-sm"
        >
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => handleButtonClick(e, onSettings)}
          >
            <SettingsIcon className="size-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={(e) => handleButtonClick(e, onDelete)}
          >
            <TrashIcon className="size-4" />
          </Button>
        </NodeToolbar>
      )}
      {children}
      <NodeToolbar
        position={Position.Bottom}
        isVisible={true}
        className="max-w-[200px] text-center bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md"
      >
        <p className="font-medium text-sm">{name}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </NodeToolbar>
    </div>
  );
}