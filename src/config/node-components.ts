import type { NodeTypes } from "@xyflow/react";
import { NodeType as PrismaNodeTypes } from "@/generated/prisma";
import { InitialNode } from "@/components/initial-node";
import { HttpsRequestNode } from "@/features/executions/components/http-request/node";
import { ManualTriggerNode } from "@/features/triggers/components/manual-trigger/node";
import { GoogleFormTrigger } from "@/features/triggers/components/google-form-trigger/node";
import { StripeTriggerNode } from "@/features/triggers/components/stripe-trigger/node";
import { GeminiNode } from "@/features/executions/components/gemini/node"
import { OpenAINode } from "@/features/executions/components/openai/node"
import Anthropic from "@anthropic-ai/sdk";
import { AnthropicNode } from "@/features/executions/components/anthropic/node";
import { DiscordNode } from "@/features/executions/components/discord/node";
import { SlackNode } from "@/features/executions/components/slack/node";
export const nodeComponents = {
  [PrismaNodeTypes.INITIAL]: InitialNode,
  [PrismaNodeTypes.HTTP_REQUEST]: HttpsRequestNode,
  [PrismaNodeTypes.MANUAL_TRIGGER]: ManualTriggerNode,
  [PrismaNodeTypes.GOOGLE_FORM_TRIGGER]: GoogleFormTrigger,
  [PrismaNodeTypes.STRIPE_TRIGGER]: StripeTriggerNode,
  [PrismaNodeTypes.GEMINI]: GeminiNode,
  [PrismaNodeTypes.OPENAI]: OpenAINode,
  [PrismaNodeTypes.ANTHROPIC]: AnthropicNode,
  [PrismaNodeTypes.DISCORD]: DiscordNode,
  [PrismaNodeTypes.SLACK]: SlackNode,
} as const satisfies NodeTypes;


export type RegisteredNodeTypes = keyof typeof nodeComponents;

