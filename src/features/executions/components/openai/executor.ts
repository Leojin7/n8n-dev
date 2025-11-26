import type { NodeExecutor } from "@/features/executions/types";
import { openaiChannel } from "@/inngest/channels/openai";
import { NonRetriableError } from "inngest";
import OpenAI from "openai";
import Handlebars from "handlebars";
import { generateText } from "ai";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);
  return safeString;
});

type OpenAIData = {
  variableName: string;
  model?: string;
  systemPrompt?: string;
  userPrompt?: string;
};

export const openaiExecutor: NodeExecutor<OpenAIData> = async ({ data, nodeId, context, step, publish }) => {
  // Publish loading status
  await publish(
    openaiChannel().status({
      nodeId,
      status: "loading",
    })
  );

  // Validate required fields
  if (!data.variableName) {
    await publish(
      openaiChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("OpenAI node: Variable name is missing");
  }

  if (!data.userPrompt) {
    await publish(
      openaiChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("OpenAI node: User prompt is missing");
  }

  // TODO: Add OpenAI API key validation

  // Compile system prompt with context
  const systemPrompt = data.systemPrompt
    ? Handlebars.compile(data.systemPrompt)(context)
    : "You are a helpful assistant";

  const userPrompt = Handlebars.compile(data.userPrompt)(context);
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    await publish(
      openaiChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("OpenAI API key is not configured");
  }

  const openai = new OpenAI({
    apiKey: apiKey,
  });

  try {
    const completion = await openai.chat.completions.create({
      model: data.model || "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: 0.2,
    });

    const response = completion.choices[0]?.message?.content || "";

    await publish(
      openaiChannel().status({
        nodeId,
        status: "success",
      })
    );

    return {
      ...context,
      [data.variableName]: response,
    };
  } catch (error) {
    console.error("Error in openaiExecutor:", error);

    await publish(
      openaiChannel().status({
        nodeId,
        status: "error",
      })
    );

    throw new NonRetriableError(
      `OpenAI node: ${error instanceof Error ? error.message : "An unknown error occurred"}`
    );
  }
};
