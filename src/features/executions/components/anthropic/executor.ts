import type { NodeExecutor } from "@/features/executions/types";
import { anthropicChannel } from "../../../../inngest/channels/anthropic";
import { NonRetriableError } from "inngest";
import Anthropic from "@anthropic-ai/sdk";
import Handlebars from "handlebars";
import { generateText } from "ai";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);
  return safeString;
});
type AnthropicData = {
  variableName: string,
  model?: string,
  systemPrompt?: string,
  userPrompt?: string,
};

export const anthropicExecutor: NodeExecutor<AnthropicData> = async ({ data, nodeId, context, step, publish }) => {
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
  if (!data.userPrompt) {
    await publish(
      anthropicChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Anthropic node: User prompt is missing");
  }

  // TODO: throw if credentials is missing
  const systemPrompt = data.systemPrompt ? Handlebars.compile(data.systemPrompt)(context) : "You are a helpful assistant";


  const userPrompt = Handlebars.compile(data.userPrompt)(context);
  const credentialValue = process.env.ANTHROPIC_API_KEY!;

  if (!credentialValue) {
    await publish(
      anthropicChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Anthropic API key is not configured. Please set the ANTHROPIC_API_KEY environment variable.");
  }

  const anthropic = new Anthropic({
    apiKey: credentialValue,
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

    // Get the first text content from the response
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


