import { NodeExecutor } from "@/features/executions/types";
import { scmChannel } from "@/inngest/channels/scm";
import { SCMReportGeneratorData } from "./types";

export const scmReportGeneratorExecutor: NodeExecutor<SCMReportGeneratorData> = async ({
  data,
  nodeId,
  context,
  userId,
  step,
  publish
}) => {
  await publish(
    scmChannel().status({
      nodeId,
      status: "running",
      message: "Generating reports...",
    })
  );

  try {
    const scmMapperUrl = process.env.SCM_MAPPER_API_URL || 'http://127.0.0.1:3000';
    const mappings = (context as any).mappings || data.mappings;

    const response = await fetch(`${scmMapperUrl}/api/scm-mapper/generate-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'NodeBase/1.0.0'
      },
      body: JSON.stringify({
        mappings,
        formats: data.formats
      })
    });

    if (!response.ok) {
      throw new Error(`SCM Mapper API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('[SCM Report Generator] API Response:', JSON.stringify(result).slice(0, 200));

    await publish(
      scmChannel().status({
        nodeId,
        status: "success",
        message: "Reports generated successfully",
      })
    );

    return {
      ...context, // Preserve existing context
      [data.variableName]: result,
      reports: result
    };
  } catch (error) {
    await publish(
      scmChannel().status({
        nodeId,
        status: "error",
        message: `Failed to generate reports: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: error instanceof Error ? error.stack : undefined
      })
    );
    throw error;
  }
};
