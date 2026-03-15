import { NodeExecutor } from "@/features/executions/types";
import { scmChannel } from "@/inngest/channels/scm";
import { SCMStorageData } from "./types";
import Prismadb from "@/lib/db";

export const scmStorageExecutor: NodeExecutor<SCMStorageData> = async ({
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
      message: "Storing SCM Mapper results...",
    })
  );

  try {
    const executionId = context.executionId || 'unknown';
    const workflowId = context.workflowId || 'unknown';

    console.log(`[SCM Storage] Full context keys:`, Object.keys(context));
    console.log(`[SCM Storage] Context javaParams:`, context.javaParams);
    console.log(`[SCM Storage] Context mappings:`, context.mappings);
    console.log(`[SCM Storage] Context apiSpecs:`, context.apiSpecs);

    // Get the latest mapping results from context - try multiple keys
    let mappings = (context[data.variableName] as any) || {};
    if (!mappings || Object.keys(mappings).length === 0) {
      mappings = (context.mappings as any) || {};
    }

    const reports = (context.reports as any) || {};
    const javaParams = (context.javaParams as any) || {};
    const apiSpecs = (context.apiSpecs as any) || {};

    console.log(`[SCM Storage] Retrieved mappings:`, Object.keys(mappings).length > 0 ? 'found' : 'empty');
    console.log(`[SCM Storage] Mappings structure:`, typeof mappings, Object.keys(mappings));

    // Calculate parameter count correctly - handle different data structures
    let javaParamsCount = 0;

    if (Array.isArray(javaParams)) {
      javaParamsCount = javaParams.length;
      console.log(`[SCM Storage] javaParams is array with ${javaParamsCount} items`);
    } else if (javaParams && Array.isArray(javaParams.parameters)) {
      javaParamsCount = javaParams.parameters.length;
      console.log(`[SCM Storage] javaParams.parameters is array with ${javaParamsCount} items`);
    } else if (javaParams && typeof javaParams === 'object') {
      // If javaParams is an object with parameter data, count its keys
      javaParamsCount = Object.keys(javaParams).filter(key =>
        key !== 'success' && key !== 'metadata' && key !== 'analysis'
      ).length;
      console.log(`[SCM Storage] javaParams is object with ${javaParamsCount} parameter keys`);
    } else if (javaParams && javaParams.totalParameters) {
      javaParamsCount = javaParams.totalParameters;
      console.log(`[SCM Storage] javaParams.totalParameters: ${javaParamsCount}`);
    } else {
      console.log(`[SCM Storage] javaParams structure unknown:`, typeof javaParams);
    }

    // Get statistics from mappings - handle enhanced structure
    let statistics = {};
    if (mappings.statistics) {
      statistics = mappings.statistics;
    } else if (mappings.exact !== undefined) {
      // Enhanced structure with direct properties
      statistics = {
        exact: mappings.exact || 0,
        semantic: mappings.semantic || 0,
        partial: mappings.partial || 0,
        noMatch: mappings.noMatch || 0,
        total: mappings.total || 0,
        avgConfidence: mappings.avgConfidence || 0
      };
    } else {
      statistics = {
        exact: 0,
        semantic: 0,
        partial: 0,
        noMatch: 0,
        total: 0,
        avgConfidence: 0
      };
    }

    console.log(`[SCM Storage] Final statistics:`, statistics);

    // Store in database
    const result = await Prismadb.sCMMapperResult.create({
      data: {
        workflowId: String(workflowId),
        runId: String(executionId),
        executionId: String(executionId),
        javaParams,
        javaParamsCount: Number(javaParamsCount),
        apiSpecs,
        apiVersions: Array.isArray(apiSpecs.versions) ? apiSpecs.versions : [],
        mappings,
        statistics: {
          exact: Number(mappings.exact || 0),
          semantic: Number(mappings.semantic || 0),
          partial: Number(mappings.partial || 0),
          noMatch: Number(mappings.noMatch || 0),
          total: Number(mappings.total || 0),
          avgConfidence: Number(mappings.avgConfidence || 0)
        },
        reportMarkdown: data.storeReports ? String(reports.markdown || "") : "",
        reportJson: data.storeReports ? (reports.json || {}) : {},
        reportHtml: data.storeReports ? String(reports.html || "") : "",
        confidenceScores: mappings.confidenceScores || {},
        status: 'success'
      }
    });

    await publish(
      scmChannel().status({
        nodeId,
        status: "success",
        message: "Results stored successfully",
        storedId: result.id,
        mappingsCount: mappings.total || 0
      })
    );

    return {
      ...context, // Preserve existing context
      [data.variableName]: {
        id: result.id,
        timestamp: result.createdAt,
        mappingsCount: mappings.total || 0,
        stored: true
      }
    };
  } catch (error) {
    await publish(
      scmChannel().status({
        nodeId,
        status: "error",
        message: `Failed to store results: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: error instanceof Error ? error.stack : undefined
      })
    );
    throw error;
  }
};
