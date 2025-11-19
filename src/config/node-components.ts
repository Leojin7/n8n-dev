import type { NodeTypes } from "@xyflow/react";
import { NodeType as PrismaNodeTypes } from "@/generated/prisma";
import { InitialNode } from "@/components/initial-node";
import { HttpsRequestNode } from "@/features/executions/components/http-request/node";
import { ManualTriggerNode } from "@/features/triggers/components/manual-trigger/node";

export const nodeComponents = {
  [PrismaNodeTypes.INITIAL]: InitialNode,
  [PrismaNodeTypes.HTTP_REQUEST]: HttpsRequestNode,
  [PrismaNodeTypes.MANUAL_TRIGGER]: ManualTriggerNode,
} as const satisfies NodeTypes;

export type RegisteredNodeTypes = keyof typeof nodeComponents;

