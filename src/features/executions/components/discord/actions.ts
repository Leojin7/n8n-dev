"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { discordChannel } from "@/inngest/channels/discord";
import { inngest } from "@/inngest/client";
import { revalidatePath } from "next/cache";

export type DiscordToken = Realtime.Token<typeof discordChannel, ["status"]>;

export async function fetchDiscordRealtimeToken(): Promise<DiscordToken> {
  try {
    const token = await getSubscriptionToken(inngest, {
      channel: discordChannel(),
      topics: ["status"],
    });

    // Revalidate any relevant paths if needed
    revalidatePath("/");

    return token;
  } catch (error) {
    console.error("Failed to fetch Discord realtime token:", error);
    throw new Error("Failed to establish realtime connection. Please try again.");
  }
}