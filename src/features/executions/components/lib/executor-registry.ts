import { NodeType } from "@/generated/prisma";
import { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { manualTriggerExecutor } from "@/features/triggers/components/manual-trigger/executor";
import { httpRequestExecutor } from "../http-request/executor";
import { googleFormTriggerExecutor } from "@/features/triggers/components/google-form-trigger/executor";
import { stripeTriggerExecutor } from "@/features/triggers/components/stripe-trigger/executor";
import { geminiExecutor } from "../gemini/executor";
import { openaiExecutor } from "../openai/executor";
import { anthropicExecutor } from "../anthropic/executor";
import { discordExecutor } from "../discord/executor";
import { slackExecutor } from "../slack/executor";
import { scmJavaParserExecutor } from "../scm-java-parser-node/executor";
import { scmApiFetcherExecutor } from "../scm-api-fetcher-node/executor";
import { scmClaudeMatcherExecutor } from "../scm-claude-matcher-node/executor";
import { scmReportGeneratorExecutor } from "../scm-report-generator-node/executor";
import { scmStorageExecutor } from "../scm-storage-node/executor";
import { scmNotifierExecutor } from "../scm-notifier-node/executor";

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
  [NodeType.SCM_JAVA_PARSER]: scmJavaParserExecutor,
  [NodeType.SCM_API_FETCHER]: scmApiFetcherExecutor,
  [NodeType.SCM_CLAUDE_MATCHER]: scmClaudeMatcherExecutor,
  [NodeType.SCM_REPORT_GENERATOR]: scmReportGeneratorExecutor,
  [NodeType.SCM_STORAGE]: scmStorageExecutor,
  [NodeType.SCM_NOTIFIER]: scmNotifierExecutor,
};

export const getExecutor = (type: NodeType): NodeExecutor => {
  const executor = executorRegistry[type];

  if (!executor) {
    throw new NonRetriableError(`Node type '${type}' is not implemented yet. Please check your workflow configuration.`);
  }

  return executor;
}