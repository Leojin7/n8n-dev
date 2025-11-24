import type { NodeExecutor } from "@/features/executions/types";
import { httpRequestChannel } from "@/inngest/channels/http-request";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";


type HttpRequestData = {
  variableName?: string,
  endpoint?: string;
  method?: string;
  body?: string;
}

export const httpRequestExecutor: NodeExecutor<HttpRequestData> = async ({ data, nodeId, context, step, publish }) => {
  await publish(
    httpRequestChannel().status({

      nodeId,
      status: "loading",
    }),
  );

  if (!data.endpoint) {
    await publish(
      httpRequestChannel().status({

        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("HTTP Request node: no Endpoint configured")
  }

  if (!data.variableName) {
    await publish(
      httpRequestChannel().status({

        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Variable Name not configured")
  }

  try {
    const result = await step.run("http-request", async () => {
      const endpoint = data.endpoint!;
      const method = data.method || "GET";

      const options: KyOptions = { method };

      if (["POST", "PUT", "PATCH"].includes(method)) {
        options.body = data.body;
        options.headers = {
          "Content-Type": "application/json"
        };
      }

      const response = await ky(endpoint, options);
      const contentType = response.headers.get("content-type");

      const responseData = contentType?.includes("application/json")
        ? await response.json()
        : await response.text();

      const responsePayload = {
        httpResponse: {
          status: response.status,
          statusText: response.statusText,
          data: responseData,
        },
      };

      if (data.variableName) {
        return {
          ...context,
          [data.variableName]: responsePayload,
        };
      }

      // Fallback to direct httpResponse for backward compatibility
      return {
        ...context,
        ...responsePayload,
      };
    });

    await publish(
      httpRequestChannel().status({
        nodeId,
        status: "success",
      }),
    );

    return result;
  } catch (e) {
    await publish(
      httpRequestChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw e;
  }
};