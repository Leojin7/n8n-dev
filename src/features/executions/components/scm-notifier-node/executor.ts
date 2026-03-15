import { NodeExecutor } from "@/features/executions/types";
import { scmChannel } from "@/inngest/channels/scm";
import { SCMNotifierData } from "./types";

export const scmNotifierExecutor: NodeExecutor<SCMNotifierData> = async ({
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
      message: "Sending notifications...",
    })
  );

  try {
    // GET REAL STATISTICS FROM CONTEXT
    const javaParams = (context.javaParams as any) || {};
    const mappings = (context.mappings as any) || {};
    const statistics = mappings.statistics || {};
    const parameterDifferences = mappings.parameterDifferences || [];
    const recommendations = mappings.recommendations || [];

    // Calculate parameter count correctly
    let paramCount = 0;
    if (Array.isArray(javaParams)) {
      paramCount = javaParams.length;
    } else if (javaParams && Array.isArray(javaParams.parameters)) {
      paramCount = javaParams.parameters.length;
    } else if (javaParams && javaParams.totalParameters) {
      paramCount = javaParams.totalParameters;
    }

    console.log('[SCM Notifier] REAL DATA:', {
      paramCount,
      statistics,
      mappingsCount: mappings.matches?.length || 0,
      recommendationsCount: recommendations.length
    });

    // Get Slack webhook URL from credentials
    const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;

    if (!slackWebhookUrl) {
      console.warn('[SCM Notifier] SLACK_WEBHOOK_URL is missing. Skipping Slack notifications.');
    }

    // Build detailed message with REAL analysis results
    let message = `🎯 SCM Mapper Analysis Complete!\n\n`;

    // Check for metadata in different possible locations
    let metadata = javaParams.metadata;
    if (!metadata && javaParams.length > 0) {
      // If no metadata, create basic info from the first parameter
      metadata = {
        repoUrl: javaParams.repoUrl || 'Your GitLab Repository',
        branch: javaParams.branch || 'main',
        totalFiles: javaParams.totalFiles || paramCount
      };
    }

    if (metadata) {
      message += `📁 Repository: ${metadata.repoUrl || 'Your Repository'}\n`;
      message += `🌿 Branch: ${metadata.branch || 'main'}\n`;
      message += `📄 Files Found: ${metadata.totalFiles || paramCount}\n\n`;
    }

    message += `📊 Analysis Results:\n`;
    message += `• Parameters Found: ${paramCount}\n`;
    message += `• Exact Matches: ${statistics.exact || 0}\n`;
    message += `• Semantic Matches: ${statistics.semantic || 0}\n`;
    message += `• Partial Matches: ${statistics.partial || 0}\n`;
    message += `• Custom Parameters: ${statistics.noMatch || 0}\n`;
    message += `• Missing Implementations: ${parameterDifferences.filter((d: { status: string }) => d.status === 'missing_implementation').length || 0}\n`;
    message += `• Average Confidence: ${((statistics.avgConfidence || 0) * 100).toFixed(1)}%\n\n`;

    // Add key findings
    if (recommendations.length > 0) {
      message += `🔍 Key Recommendations:\n`;
      recommendations.slice(0, 3).forEach((rec: any, idx: number) => {
        message += `${idx + 1}. ${rec.issue}\n   → ${rec.suggestion}\n`;
      });
      message += `\n`;
    }

    if (parameterDifferences.length > 0) {
      message += `⚠️ Notable Differences:\n`;
      const customParams = parameterDifferences.filter((d: any) => d.status === 'custom_or_unused');
      const missingParams = parameterDifferences.filter((d: any) => d.status === 'missing_implementation');

      if (customParams.length > 0) {
        message += `• ${customParams.length} custom parameters in your code\n`;
      }
      if (missingParams.length > 0) {
        message += `• ${missingParams.length} official parameters not implemented\n`;
      }
    }

    // Send notification to each channel
    const notifications = [];

    for (const channel of data.channels) {
      if (channel === 'slack' && slackWebhookUrl) {
        try {
          const response = await fetch(slackWebhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'NodeBase/1.0.0'
            },
            body: JSON.stringify({
              text: message,
              username: 'NodeBase SCM Mapper',
              icon_emoji: ':robot_face:'
            })
          });

          if (!response.ok) {
            console.error(`[SCM Notifier] Slack API error: ${response.status} ${response.statusText}`);
            notifications.push({
              channel: 'slack',
              status: 'error',
              timestamp: new Date().toISOString(),
              error: `HTTP ${response.status}: ${response.statusText}`
            });
          } else {
            console.log(`[SCM Notifier] Slack notification sent successfully`);
            notifications.push({
              channel: 'slack',
              status: 'sent',
              timestamp: new Date().toISOString()
            });
          }
        } catch (error) {
          console.error('[SCM Notifier] Failed to send Slack notification:', error);
          notifications.push({
            channel: 'slack',
            status: 'error',
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    }

    await publish(
      scmChannel().status({
        nodeId,
        status: "success",
        message: "Notifications sent",
        notifications
      })
    );

    return {
      ...context, // Preserve existing context
      [data.variableName]: {
        notifications,
        sentAt: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('[SCM Notifier] Error:', error);

    // Don't fail the entire workflow, just log the error
    await publish(
      scmChannel().status({
        nodeId,
        status: "success", // Still mark as success so workflow continues
        message: `Notifications completed with errors: ${error instanceof Error ? error.message : 'Unknown error'}`,
      })
    );

    // Return with error information but don't throw
    return {
      ...context,
      [data.variableName]: {
        notifications: [{
          channel: 'slack',
          status: 'error',
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Unknown error'
        }],
        sentAt: new Date().toISOString()
      }
    };
  }
};
