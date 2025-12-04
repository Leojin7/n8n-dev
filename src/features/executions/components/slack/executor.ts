import type { NodeExecutor } from "@/features/executions/types";
import { slackChannel } from "@/inngest/channels/slack";
import { NonRetriableError } from "inngest";
import { createGoogleGenerativeAI, google } from "@ai-sdk/google";
import Handlebars from "handlebars";
import { generateText } from "ai";
import Prismadb from "@/lib/db";
import { decode } from "html-entities";
import ky from "ky";
Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);
  return safeString;
});

type SlackData = {
  variableName: string,
  content?: string,
  webhookUrl?: string,
  username?: string,
};

export const slackExecutor: NodeExecutor<SlackData> = async ({ data, nodeId, context, step, publish }) => {
  await publish(
    slackChannel().status({
      nodeId,
      status: "loading",
    }),
  );




  // TODO: throw if credentials is missing





  const rawContent = Handlebars.compile(data.content)(context);
  const content = decode(rawContent);







  try {

    const result = await step.run("slack-webhook", async () => {
      if (!data.webhookUrl) {
        await publish(
          slackChannel().status({
            nodeId,
            status: "error",
          }),
        );
        throw new NonRetriableError("Slack node: Webhook Url is missing");
      }
      await ky.post(data.webhookUrl!, {
        json: {
          text: content,
          username: data.username || 'Workflow Bot',
          icon_emoji: data.username ? undefined : ':robot_face:',
          mrkdwn: true
        },
      });

      if (!data.variableName) {
        await publish(
          slackChannel().status({
            nodeId,
            status: "error",
          }),
        );
        throw new NonRetriableError("Slack node: Variable name is missing");
      }


      return {
        ...context,
        [data.variableName]: {
          messageContent: content.slice(0, 2000)
        },
      }
    });
    await publish(
      slackChannel().status({
        nodeId,
        status: "success",
      })
    );
    return result;
  }
  catch (e) {
    await publish(
      slackChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw e;
  }
};
