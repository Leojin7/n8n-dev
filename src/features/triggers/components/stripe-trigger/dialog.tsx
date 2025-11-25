"use client";


import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { useReactFlow } from "@xyflow/react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import { CopyIcon } from "lucide-react";


interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const StripeTriggerDialog = ({ open, onOpenChange }: Props) => {
  const params = useParams();
  const workflowId = params.workflowId as string;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || " https://localhost:3000"
  const webhookUrl = `${baseUrl}/api/webhooks/stripe?workflowId=${workflowId}`

  const copyToClipboard = async () => {


    try {
      await navigator.clipboard.writeText(webhookUrl);
      toast.success("Webhook URL copied to clipbaord");
    }
    catch {
      toast.error("Failed to copy URL")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Stripe Trigger Node Configs</DialogTitle>
          <DialogDescription>
            Use this webhook URL in your Stripe Dashboard to trigger this workflow on payments events.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">
              Webhook URL
            </Label>
            <div className="flex gap-2">
              <Input
                id="webhook-url"
                value={webhookUrl}
                readOnly
                className="font-mono text-sm flex-1"
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={copyToClipboard}
                className="flex-shrink-0"
              >
                <CopyIcon className="size-4" />
              </Button>
            </div>
          </div>
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <h4 className="font-medium text-sm"> Setup Instructions</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Open your Stripe Dashboard</li>
              <li>Go to Developers &rarr; Webhooks</li>
              <li>Click "Add endpoint"</li>
              <li>Paste webhook URL above</li>
              <li>Save events to listen for (e.g., payment_intent.succeeded)</li>
              <li>Save and copy the signing secret</li>
            </ol>

          </div>


          <div className="rounded-lg bg-muted p-4 space-y-2 ">
            <h4 className="font-medium txt-sm">
              Available Variables          </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li><code className="bg-background px-1 py-0.5 rounded">{"{{stripe.amount}}"}</code> - Payment amount</li>
              <li><code className="bg-background px-1 py-0.5 rounded">{"{{stripe.currency}}"}</code> - Currency</li>
              <li><code className="bg-background px-1 py-0.5 rounded">{"{{stripe.customerId}}"}</code> - Customer Id</li>
              <li><code className="bg-background px-1 py-0.5 rounded">{"{{json stripe}}"}</code> - Full event data in JSON Format</li>
              <li><code className="bg-background px-1 py-0.5 rounded">{"{{stripe.eventType}}"}</code> - Event type (e.g payment_intent.succeeded)</li>
            </ul>
          </div>
        </div>

      </DialogContent>
    </Dialog >
  )

}