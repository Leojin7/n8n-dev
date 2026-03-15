import { NodeExecutor } from "@/features/executions/types";
import { scmChannel } from "@/inngest/channels/scm";
import { SCMClaudeMatcherData } from "./types";

export const scmClaudeMatcherExecutor: NodeExecutor<SCMClaudeMatcherData> = async ({
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
      message: "Starting AI-powered parameter matching...",
    })
  );

  try {
    // MUST have java params
    const javaParams = (context as any).javaParams || {};
    const apiSpecs = (context as any).apiSpecs || {};

    if (!javaParams.parameters || javaParams.parameters.length === 0) {
      console.warn("No Java parameters found in context!");

      await publish(
        scmChannel().status({
          nodeId,
          status: "success",
          message: "No parameters to match - skipping AI analysis",
        })
      );

      // Return empty mappings but preserve context
      return {
        ...context,
        [data.variableName]: {
          mappings: [],
          statistics: {
            exact: 0,
            semantic: 0,
            partial: 0,
            noMatch: javaParams.totalParameters || 0,
            total: javaParams.totalParameters || 0,
            avgConfidence: 0,
          },
        },
        mappings: {
          mappings: [],
          statistics: {
            exact: 0,
            semantic: 0,
            partial: 0,
            noMatch: javaParams.totalParameters || 0,
            total: javaParams.totalParameters || 0,
            avgConfidence: 0,
          },
        },
        statistics: {
          exact: 0,
          semantic: 0,
          partial: 0,
          noMatch: javaParams.totalParameters || 0,
          total: javaParams.totalParameters || 0,
          avgConfidence: 0,
        }
      };
    }

    await publish(
      scmChannel().status({
        nodeId,
        status: "running",
        message: "🤖 Analyzing parameters with AI...",
      })
    );

    console.log(`[SCM Claude Matcher] Processing ${javaParams.parameters.length} parameters`);

    // Use our enhanced analyze-and-map API instead of calling Claude directly
    const scmMapperUrl = process.env.SCM_MAPPER_API_URL || 'http://127.0.0.1:3000';

    const response = await fetch(`${scmMapperUrl}/api/scm-mapper/analyze-and-map`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'NodeBase/1.0.0'
      },
      body: JSON.stringify({
        javaParams: javaParams,
        apiSpecs: apiSpecs,
        model: data.model,
        strategy: data.strategy,
        confidence: data.confidence
      })
    });

    if (!response.ok) {
      throw new Error(`SCM Mapper API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('[SCM Claude Matcher] API Response:', JSON.stringify(result).slice(0, 200));

    await publish(
      scmChannel().status({
        nodeId,
        status: "success",
        message: `AI matching completed - found ${result.statistics?.semantic || 0} semantic matches`,
      })
    );

    // Ensure we have proper mappings structure
    const mappings = result.mappings || {};
    const statistics = result.statistics || mappings.statistics || {};
    const recommendations = result.recommendations || [];

    console.log(`[SCM Claude Matcher] Final results:`, {
      mappingsCount: mappings.matches?.length || 0,
      statistics,
      recommendationsCount: recommendations.length
    });

    // Context flow: Ensure mappings and statistics are passed to next nodes
    return {
      ...context, // Preserve existing context
      [data.variableName]: mappings,
      mappings: mappings, // Also store as mappings for downstream nodes
      statistics: statistics,
      recommendations: recommendations,
      confidenceScores: mappings.confidenceScores || {}
    };
  } catch (error) {
    await publish(
      scmChannel().status({
        nodeId,
        status: "error",
        message: `Failed to match parameters: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: error instanceof Error ? error.stack : undefined
      })
    );
    throw error;
  }
};
