"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { geminiChannel } from "@/inngest/channels/gemini";
import { inngest } from "@/inngest/client";
import { revalidatePath } from "next/cache";

export type GeminiToken = Realtime.Token<typeof geminiChannel, ["status"]>;

export async function fetchGeminiRealtimeToken(): Promise<GeminiToken> {
  try {
    const token = await getSubscriptionToken(inngest, {
      channel: geminiChannel(),
      topics: ["status"],
    });

    // Revalidate any relevant paths if needed
    revalidatePath("/");

    return token;
  } catch (error) {
    console.error("Failed to fetch Gemini realtime token:", error);
    throw new Error("Failed to establish realtime connection. Please try again.");
  }
}