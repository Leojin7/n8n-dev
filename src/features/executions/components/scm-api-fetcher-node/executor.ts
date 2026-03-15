import { NodeExecutor } from "@/features/executions/types";
import { scmChannel } from "@/inngest/channels/scm";

interface SCMAPIFetcherData {
  variableName: string;
  apis: string[];
}

export const scmApiFetcherExecutor: NodeExecutor<SCMAPIFetcherData> = async ({
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
      message: "Fetching API specifications...",
    })
  );

  try {
    const scmMapperUrl = process.env.SCM_MAPPER_API_URL || 'http://127.0.0.1:3000';

    const response = await fetch(`${scmMapperUrl}/api/scm-mapper/fetch-api-specs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'NodeBase/1.0.0'
      },
      body: JSON.stringify({
        apis: data.apis
      })
    });

    if (!response.ok) {
      throw new Error(`SCM Mapper API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    await publish(
      scmChannel().status({
        nodeId,
        status: "success",
        message: "API specifications fetched",
      })
    );

    return {
      ...context, // Preserve existing context
      [data.variableName]: result.apiSpecs,
      apiSpecs: result.apiSpecs // Also store as apiSpecs for downstream nodes
    };
  } catch (error) {
    await publish(
      scmChannel().status({
        nodeId,
        status: "error",
        message: `Failed to fetch API specs: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: error instanceof Error ? error.stack : undefined
      })
    );
    throw error;
  }
};
