
import { Input } from "@/components/ui/input";
import { inngest } from "@/inngest/client";
import { sendWorkflowExecution } from "@/inngest/utils";
import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest) {


  try {
    const url = new URL(req.url);
    const workflowId = url.searchParams.get("workflowId")

    if (!workflowId) {
      return NextResponse.json(
        { success: false, e: "Missing required query parameter" },
        { status: 400 },
      );
    }

    const body = await req.json();
    const formData = {
      formId: body.formId,
      formTitle: body.formTitle,
      responseId: body.responseId,
      respondentEmail: body.respondentEmail,
      responses: body.responses,
      raw: body,
    };

    await sendWorkflowExecution({
      workflowId,
      initialData: {
        googleForm: formData,
      }
    });

  } catch (e) {

    console.error("Google From webhook error:", e);
    return NextResponse.json(
      { success: false, e: "Failed to Process Google Form Submission" },
      { status: 500 },
    );

  }
};