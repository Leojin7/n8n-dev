import type { NodeTypes } from "@xyflow/react";
import { NodeType as PrismaNodeTypes } from "@/generated/prisma";
import { InitialNode } from "@/components/initial-node";

export const nodeComponents = {
  [PrismaNodeTypes.INITIAL]: InitialNode,
} as const satisfies NodeTypes;

export type RegisteredNodeTypes = keyof typeof nodeComponents;
