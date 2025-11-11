import { Polar } from "@polar-sh/sdk";

// Initialize the Polar client with proper typing
export const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN ?? "",
  server: "sandbox"
});
