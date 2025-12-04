"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { slackChannel } from "@/inngest/channels/slack";
import { inngest } from "@/inngest/client";
import { revalidatePath } from "next/cache";

export type SlackToken = Realtime.Token<typeof slackChannel, ["status"]>;
export async function fetchSlackRealtimeToken(): Promise<SlackToken> {
  try {
    const token = await getSubscriptionToken(inngest, {
      channel: slackChannel(),
      topics: ["status"],
    });


    revalidatePath("/");

    return token;
  } catch (error) {
    console.error("Failed to fetch Slack realtime token:", error);
    throw new Error("Failed to establish realtime connection. Please try again.");
  }
}