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
import { SCMJavaParserNode } from "@/features/executions/components/scm-java-parser-node/node";
import { SCMAPIFetcherNode } from "@/features/executions/components/scm-api-fetcher-node/node";
import { SCMClaudeMatcherNode } from "@/features/executions/components/scm-claude-matcher-node/node";
import { SCMReportGeneratorNode } from "@/features/executions/components/scm-report-generator-node/node";
import { SCMStorageNode } from "@/features/executions/components/scm-storage-node/node";
import { SCMNotifierNode } from "@/features/executions/components/scm-notifier-node/node";

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
  [PrismaNodeTypes.SCM_JAVA_PARSER]: SCMJavaParserNode as any,
  [PrismaNodeTypes.SCM_API_FETCHER]: SCMAPIFetcherNode as any,
  [PrismaNodeTypes.SCM_CLAUDE_MATCHER]: SCMClaudeMatcherNode as any,
  [PrismaNodeTypes.SCM_REPORT_GENERATOR]: SCMReportGeneratorNode as any,
  [PrismaNodeTypes.SCM_STORAGE]: SCMStorageNode as any,
  [PrismaNodeTypes.SCM_NOTIFIER]: SCMNotifierNode as any,
} as const satisfies NodeTypes;


export type RegisteredNodeTypes = keyof typeof nodeComponents;

