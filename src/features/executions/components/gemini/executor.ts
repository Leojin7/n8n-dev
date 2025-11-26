import type { NodeExecutor } from "@/features/executions/types";
import { geminiChannel } from "@/inngest/channels/gemini";
import { NonRetriableError } from "inngest";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import Handlebars from "handlebars";
import { generateText } from "ai";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);
  return safeString;
});
type GeminiData = {
  variableName: string,
  model?: string,
  systemPrompt?: string,
  userPrompt?: string,
};

export const geminiExecutor: NodeExecutor<GeminiData> = async ({ data, nodeId, context, step, publish }) => {
  await publish(
    geminiChannel().status({

      nodeId,
      status: "loading",
    }),
  );
  if (!data.variableName) {
    await publish(
      geminiChannel().status({

        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Gemini node: Variable name is missing");
  }
  if (!data.userPrompt) {
    await publish(
      geminiChannel().status({

        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Gemini node: User prompt is missing");
  }
  const systemPrompt = data.systemPrompt ? Handlebars.compile(data.systemPrompt)(context) : "You are a helpful assistant";
  const userPrompt = Handlebars.compile(data.userPrompt)(context);

  const credentialValue = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!credentialValue) {
    await publish(
      geminiChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Gemini node: GOOGLE_GENERATIVE_AI_API_KEY environment variable is not set");
  }

  const google = createGoogleGenerativeAI({
    apiKey: credentialValue,
  });


  try {
    // Map model names to the latest supported models in the Google AI SDK
    const modelMap: Record<string, string> = {
      'gemini-2.0-flash': 'gemini-2.5-flash',
      'gemini-1.5-flash': 'gemini-2.5-flash',
      'gemini-1.5-flash-8b': 'gemini-2.5-flash',
      'gemini-1.5-pro': 'gemini-2.5-pro',
      'gemini-1.0-pro': 'gemini-2.5-pro',
      'gemini-pro': 'gemini-2.5-pro',
      'gemini-2.5-flash': 'gemini-2.5-flash',
      'gemini-2.5-pro': 'gemini-2.5-pro',
      'gemini-flash-latest': 'gemini-flash-latest',
      'gemini-pro-latest': 'gemini-pro-latest'
    };

    // Default to gemini-2.5-flash if no model is specified or if the specified model isn't found
    const modelName = modelMap[data.model || 'gemini-2.5-flash'] || 'gemini-2.5-flash';
    const model = google(modelName);

    const { steps } = await step.ai.wrap(
      "gemini-generate-text",
      generateText,
      {
        model,
        system: systemPrompt,
        prompt: userPrompt,
        experimental_telemetry: {
          isEnabled: true,
          recordInputs: true,
          recordOutputs: true,
        }
      },
    )

    const text = steps?.[0]?.content?.[0]?.type === "text" ? steps[0].content[0].text : "";

    await publish(
      geminiChannel().status({
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
      geminiChannel().status({
        nodeId,
        status: "error",
      })
    )
    throw e;
  }

};


