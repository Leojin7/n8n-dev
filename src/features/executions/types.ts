import { GetStepTools, Inngest } from "inngest";

export type WorkflowContext = Record<string, unknown>;

export type StepTools = GetStepTools<Inngest.Any>;

export interface NodeExecutorParams<Tdata = Record<string, unknown>> {
  data: Tdata;
  nodeId: string;
  context: WorkflowContext;
  step: StepTools;
};

export type NodeExecutor<Tdata = Record<string, unknown>> = (params: NodeExecutorParams<Tdata>) => Promise<WorkflowContext>;
