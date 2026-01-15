import type { NodeExecutor } from "@/features/executions/types";
import { anthropicChannel } from "../../../../inngest/channels/anthropic";
import { NonRetriableError } from "inngest";
import Anthropic from "@anthropic-ai/sdk";
import Handlebars from "handlebars";
import { generateText } from "ai";
import Prismadb from "@/lib/db";
import { decrypt } from "@/lib/encryption";
Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);
  return safeString;
});
type AnthropicData = {
  variableName: string,
  model?: string,
  credentialId?: string,
  systemPrompt?: string,
  userPrompt?: string,
};

export const anthropicExecutor: NodeExecutor<AnthropicData> = async ({ data, nodeId, context, step, userId, publish }) => {
  await publish(
    anthropicChannel().status({

      nodeId,
      status: "loading",
    }),
  );
  if (!data.variableName) {
    await publish(
      anthropicChannel().status({

        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Anthropic node: Variable name is missing");
  }
  if (!data.credentialId) {
    await publish(
      anthropicChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Anthropic node: User Credentials is missing");
  }
  if (!data.userPrompt) {
    await publish(
      anthropicChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Anthropic node: User prompt is missing");
  }

  const systemPrompt = data.systemPrompt ? Handlebars.compile(data.systemPrompt)(context) : "You are a helpful assistant";


  const userPrompt = Handlebars.compile(data.userPrompt)(context);
  const credential = await step.run("get-credential", () => {
    return Prismadb.credential.findUnique({
      where: {

        id: data.credentialId,
        userId,
      }
    })
  })

  if (!credential) {
    await publish(
      anthropicChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Anthropic node:Credential not found");
  }

  const anthropic = new Anthropic({
    apiKey: decrypt(credential.value),
  });


  try {

    const response = await anthropic.messages.create({
      model: data.model || "claude-3-haiku-20240307",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt
        }
      ]
    });

    const text = response.content.find(block => 'text' in block)?.text || '';

    await publish(
      anthropicChannel().status({
        nodeId, status: "success",
      }),
    );
    return {
      ...context,
      [data.variableName]: {
        text,
      }

    }
  }
  catch (e) {
    await publish(
      anthropicChannel().status({
        nodeId,
        status: "error",
      })
    )
    throw e;
  }

};


