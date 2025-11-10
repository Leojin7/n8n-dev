import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { execute } from "@/inngest/function";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    execute,
  ],
});