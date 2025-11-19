"use client";
import { createId } from "@paralleldrive/cuid2";
import { useReactFlow } from "@xyflow/react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

import {
  GlobeIcon,
  Icon,
  MousePointerIcon,


} from "lucide-react";

import { useCallback } from "react";
import { useWindowSize } from "@/hooks/use-window-size";

import {

  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";

import { NodeType } from "@/generated/prisma";

export type NodeTypeOption = {

  type: NodeType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }> | string;

};

const triggerNodes: NodeTypeOption[] = [

  {
    type: NodeType.MANUAL_TRIGGER,
    label: "Manual Trigger",
    description: "Runs the flow on clicking a button.Good for getting started Quick.",
    icon: MousePointerIcon,
  },

];

const executionNodes: NodeTypeOption[] = [

  {
    type: NodeType.HTTP_REQUEST,
    label: "HTTP Request",
    description: "Makes an HTTP Request",
    icon: GlobeIcon,
  },

];

interface NodeSelectorProps {

  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
};


export function NodeSelector({

  open, onOpenChange, children
}: NodeSelectorProps) {
  const { setNodes, getNodes, screenToFlowPosition } = useReactFlow();
  const { width, height } = useWindowSize();

  const handleNodeSelect = useCallback((selection: NodeTypeOption) => {
    if (selection.type === NodeType.MANUAL_TRIGGER) {
      const nodes = getNodes();
      const hasManualTrigger = nodes.some((node) => node.type === NodeType.MANUAL_TRIGGER);
      if (hasManualTrigger) {

        toast.error("Only one manual trigger is allowed per workflow");
        return;
      }
    }

    setNodes((nodes) => {
      const hasInitialTrigger = nodes.some((node) => node.type === NodeType.INITIAL);
      // Use client-provided window size when available, otherwise fall back to safe defaults
      const w = width ?? 800; // safe fallback for server render
      const h = height ?? 600; // safe fallback for server render
      const centerX = w / 2;
      const centerY = h / 2;
      const flowPosition = screenToFlowPosition({
        x: centerX + (Math.random() - 0.5) * 200,
        y: centerY + (Math.random() - 0.5) * 200
      });
      const newNode = {
        id: createId(),
        data: {},
        position: flowPosition,
        type: selection.type,

      };
      if (hasInitialTrigger) {
        // If we're adding an INITIAL node, remove existing INITIAL nodes and append the new one
        if (selection.type === NodeType.INITIAL) {
          return [...nodes.filter((n) => n.type !== NodeType.INITIAL), newNode];
        }

        // If adding a non-INITIAL node while an INITIAL exists, replace only the INITIAL node
        return nodes.map((n) => (n.type === NodeType.INITIAL ? newNode : n));
      }

      return [...nodes, newNode];

    });
    onOpenChange(false);
  }, [
    setNodes,
    getNodes,
    screenToFlowPosition,
    onOpenChange,
    width,
    height
  ])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>

      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Node Selector</SheetTitle>
          <SheetDescription>
            A trigger is a step that starts your workflow.
          </SheetDescription>
        </SheetHeader>
        <div>
          {triggerNodes.map((nodeType) => {
            const Icon = nodeType.icon;

            return (
              <div key={nodeType.type} className="w-full justify-start h-auto py-5 px-4 rounded-none cursor-pointer border-l-2 border-transparent hover:border-l-primary" onClick={() => { handleNodeSelect(nodeType) }}>

                <div className="flex items-center gap-6 w-full overflow-hidden">
                  {typeof Icon === "string" ? (
                    <img src={Icon} alt={nodeType.label} className="size-5 object-contain rounded-sm" />
                  ) : (
                    <Icon className="size-5 object-contain rounded-sm" />
                  )}
                  <div className="font-medium text-sm">
                    <span className="font-medium text-sm text-muted-foreground">{nodeType.label} </span>
                    <span className="font-medium text-xs text-muted-foreground">{nodeType.description}

                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <Separator />
        {executionNodes.map((nodeType) => {
          const Icon = nodeType.icon;

          return (
            <div key={nodeType.type} className="w-full justify-start h-auto py-5 px-4 rounded-none cursor-pointer border-l-2 border-transparent hover:border-l-primary" onClick={() => { handleNodeSelect(nodeType) }}>

              <div className="flex items-center gap-6 w-full overflow-hidden">
                {typeof Icon === "string" ? (
                  <img src={Icon} alt={nodeType.label} className="size-5 object-contain rounded-sm" />
                ) : (
                  <Icon className="size-5 object-contain rounded-sm" />
                )}
                <div className="font-medium text-sm">
                  <span className="font-medium text-sm text-muted-foreground">{nodeType.label} </span>
                  <span className="font-medium text-xs text-muted-foreground">{nodeType.description} </span>
                </div>
              </div>
            </div>
          )
        })}

        <SheetFooter>

        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};


