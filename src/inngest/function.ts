import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import Prismadb from "@/lib/db";
import { topologicalSort } from "./utils"
import { Node as XYNode } from "@xyflow/react";
import type { XYPosition } from "@xyflow/react";

import { getExecutor } from "@/features/executions/components/lib/executor-registry";
import { nodeComponents } from "@/config/node-components";
import { NodeType, ExecutionStatus } from "@/generated/prisma";
import { httpRequestChannel } from "./channels/http-request";
import { manualTriggerChannel } from "./channels/manual-trigger";
import { googleFormTriggerChannel } from "./channels/google-form-trigger";
import { stripeTriggerChannel } from "./channels/stripe-trigger";
import { geminiChannel } from "./channels/gemini";
import { anthropicChannel } from "./channels/anthropic";
import { openaiChannel } from "./channels/openai"
import prisma from "../../prisma.config";
export const executeWorkflow = inngest.createFunction(
  {
    id: "execute-workflow",
    retries: 0,
    onFailure: async ({ event, step }) => {
      return Prismadb.execution.update({
        where: {
          inngestEventId: event.data.event.id
        },
        data: {
          status: ExecutionStatus.FAILED,
          error: event.data.error.message,
          errorStack: event.data.error.stack,

        },
      });
    }
  },
  {
    event: "workflows/execute.workflow",
    channels: [
      httpRequestChannel(),
      manualTriggerChannel(),
      googleFormTriggerChannel(),
      stripeTriggerChannel(),
      geminiChannel(),
      anthropicChannel(),
      openaiChannel(),
    ]
  },
  async ({ event, step, publish }) => {

    const inngestEventId = event.id;
    const workflowId = event.data.workflowId;
    if (!inngestEventId || !workflowId) {
      throw new NonRetriableError("Event ID or Workflow ID is missing");
    }

    await step.run("create-execution", async () => {
      return Prismadb.execution.create({
        data: {
          workflowId,
          inngestEventId,

        },
      });
    });

    const sortedNodes = await step.run("prepare-workflow", async () => {

      const workflow = await Prismadb.workflow.findUniqueOrThrow({

        where: { id: workflowId },
        include: {
          node: true,
          connections: true,
        },
      });


      // Convert database nodes to XYFlow nodes
      const nodes: XYNode[] = workflow.node.map(node => {
        const { position, data, ...rest } = node;
        return {
          ...rest,
          position: position && typeof position === 'object' &&
            'x' in position && 'y' in position
            ? position as XYPosition
            : { x: 0, y: 0 },
          data: typeof data === 'object' && data !== null
            ? data as Record<string, unknown>
            : {}
        };
      });

      // Convert database connections to XYFlow connections
      const connections = workflow.connections.map(conn => ({
        id: conn.id,
        source: conn.fromNodeId,
        target: conn.toNodeId,
        sourceHandle: conn.fromOutput,
        targetHandle: conn.toInput
      }));

      return topologicalSort(nodes, connections);
    })


    const userId = await step.run("find-user-id", async () => {
      const workflow = await Prismadb.workflow.findUniqueOrThrow({

        where: {
          id: workflowId
        },
        select: {

          userID: true,
        }
      })
      return workflow.userID;

    })

    let context = event.data.initialData || {};

    for (const node of sortedNodes) {
      const executor = getExecutor(node.type as NodeType);
      context = await executor({
        data: node.data as Record<string, unknown>,
        nodeId: node.id,
        context,
        userId,
        step,
        publish,
      });

    }

    await step.run("update-execution", async () => {

      return Prismadb.execution.update({
        where: {
          inngestEventId,
        },
        data: {
          status: ExecutionStatus.SUCCESS,
          completedAt: new Date(),
          output: context as unknown as object,
        },
      });

    })
    return {

      workflowId,
      result: context,
    }

  });
