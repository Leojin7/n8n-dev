import { NodeType } from "@/generated/prisma";

import { NodeExecutor } from "@/features/executions/types";

import { manualTriggerExecutor } from "@/features/triggers/components/manual-trigger/executor";

import { httpRequestExecutor } from "../http-request/executor";
import { googleFormTriggerChannel } from "@/inngest/channels/google-form-trigger";
import { googleFormTriggerExecutor } from "@/features/triggers/components/google-form-trigger/executor";
export const executorRegistry: Record<NodeType, NodeExecutor<any>> = {


  [NodeType.MANUAL_TRIGGER]: manualTriggerExecutor,
  [NodeType.INITIAL]: manualTriggerExecutor,
  [NodeType.HTTP_REQUEST]: httpRequestExecutor,
  [NodeType.GOOGLE_FORM_TRIGGER]: googleFormTriggerExecutor,

};



export const getExecutor = (type: NodeType): NodeExecutor => {


  const executor = executorRegistry[type];

  if (!executor) {
    throw new Error(`No Executor found for node types : ${type}`);
  }

  return executor;
}