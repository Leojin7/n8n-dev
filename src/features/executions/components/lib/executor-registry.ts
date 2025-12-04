import { NodeType } from "@/generated/prisma";

import { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { manualTriggerExecutor } from "@/features/triggers/components/manual-trigger/executor";

import { httpRequestExecutor } from "../http-request/executor";
import { googleFormTriggerChannel } from "@/inngest/channels/google-form-trigger";
import { googleFormTriggerExecutor } from "@/features/triggers/components/google-form-trigger/executor";
import { stripeTriggerExecutor } from "@/features/triggers/components/stripe-trigger/executor";

import { geminiExecutor } from "../gemini/executor";
import { geminiChannel } from "@/inngest/channels/gemini"
import { anthropic } from "inngest";
import { openaiExecutor } from "../openai/executor";
import { anthropicExecutor } from "../anthropic/executor";
import { discordExecutor } from "../discord/executor";
import { slackExecutor } from "../slack/executor";

export const executorRegistry: Record<NodeType, NodeExecutor<any>> = {


  [NodeType.MANUAL_TRIGGER]: manualTriggerExecutor,
  [NodeType.INITIAL]: manualTriggerExecutor,
  [NodeType.HTTP_REQUEST]: httpRequestExecutor,
  [NodeType.GOOGLE_FORM_TRIGGER]: googleFormTriggerExecutor,
  [NodeType.STRIPE_TRIGGER]: stripeTriggerExecutor,
  [NodeType.GEMINI]: geminiExecutor,

  [NodeType.ANTHROPIC]: anthropicExecutor,
  [NodeType.OPENAI]: openaiExecutor,
  [NodeType.DISCORD]: discordExecutor,
  [NodeType.SLACK]: slackExecutor,
};


export const getExecutor = (type: NodeType): NodeExecutor => {
  const executor = executorRegistry[type];

  if (!executor) {
    throw new NonRetriableError(`Node type '${type}' is not implemented yet. Please check your workflow configuration.`);
  }

  return executor;
}