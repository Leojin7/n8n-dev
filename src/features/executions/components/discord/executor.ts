import type { NodeExecutor } from "@/features/executions/types";
import { discordChannel } from "@/inngest/channels/discord";
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

type DiscordData = {
  variableName: string,
  content?: string,
  WebhookUrl?: string,
  username?: string,
};

export const discordExecutor: NodeExecutor<DiscordData> = async ({ data, nodeId, context, step, publish }) => {
  await publish(
    discordChannel().status({
      nodeId,
      status: "loading",
    }),
  );




  // TODO: throw if credentials is missing





  const rawContent = Handlebars.compile(data.content)(context);
  const content = decode(rawContent);
  const username = data.username ? decode(Handlebars.compile(data.username)(context)) : undefined;






  try {

    const result = await step.run("discord-webhook", async () => {
      if (!data.WebhookUrl) {
        await publish(
          discordChannel().status({
            nodeId,
            status: "error",
          }),
        );
        throw new NonRetriableError("Discord node: Webhook Url is missing");
      }
      await ky.post(data.WebhookUrl!, {
        json: {
          content: content.slice(0, 2000),
          username,
        },
      });

      if (!data.variableName) {
        await publish(
          discordChannel().status({
            nodeId,
            status: "error",
          }),
        );
        throw new NonRetriableError("Discord node: Variable name is missing");
      }


      return {
        ...context,
        [data.variableName]: {
          messageContent: content.slice(0, 2000)
        },
      }
    });
    await publish(
      discordChannel().status({
        nodeId,
        status: "success",
      })
    );
    return result;
  }
  catch (e) {
    await publish(
      discordChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw e;
  }
};
