import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";


type HttpRequestData = {
  variableName?: string,
  endpoint?: string;
  method?: string;
  body?: string;
}

export const httpRequestExecutor: NodeExecutor<HttpRequestData> = async ({ data, nodeId, context, step }) => {

  if (!data.endpoint) {
    throw new NonRetriableError("HTTP Request node: no Endpoint configured")
  }

  if (!data.variableName) {
    throw new NonRetriableError("Variable Name not configured")
  }


  const result = await step.run("http-request", async () => {
    const endpoint = data.endpoint!;
    const method = data.method || "GET";

    const options: KyOptions = { method };

    if (["POST", "PUT", "PATCH"].includes(method)) {


      options.body = data.body;
      options.headers = {

        "Content-Type": "application/json"
      }
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
      }
    }
    // this Time i am using fallback to direct httResponse for backward compaitibility
    return {

      ...context,
      ...responsePayload,
    }
  });

  return result;
}