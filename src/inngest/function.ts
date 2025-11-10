import { inngest } from "./client";
import prisma from "@/lib/db";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import * as Sentry from "@sentry/nextjs";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
})
export const execute = inngest.createFunction(
  { id: "execute-ai" },
  { event: "execute/ai" },
  async ({ event, step }) => {
    await step.sleep("pretend", 5000);

    Sentry.logger.info('User triggered test log', { log_source: 'sentry_test' })
    console.warn("Something is missing");
    console.error("This is an error i want to track");

    const { steps } = await step.ai.wrap("geminiGenerateText", generateText, {
      model: google("gemini-2.5-flash"),
      system: "You are a helpful assistant.",
      prompt: "What is 2+2?",
      experimental_telemetry: {
        isEnabled: true,
        recordInputs: true,
        recordOutputs: true,
      },

    });

    return steps;
  },
);