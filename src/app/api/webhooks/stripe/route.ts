
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
    const stripeData = {
      //event metadata
      eventId: body.id,
      eventType: body.type,
      timestamp: body.created,
      livemode: body.livemode,
      raw: body.data?.object,

    };

    await sendWorkflowExecution({
      workflowId,
      initialData: {
        stripe: stripeData,
      }
    });

    return NextResponse.json(
      { success: true },
      { status: 200 }
    )
  } catch (e) {

    console.error("Stripe event webhook error:", e);
    return NextResponse.json(
      { success: false, e: "Failed to Process Stripe event" },
      { status: 500 },
    );

  }
};