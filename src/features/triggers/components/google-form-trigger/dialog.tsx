"use client";

import { generateGoogleFormScript } from "./utils";
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

export const GoogleFormTriggerDialog = ({ open, onOpenChange }: Props) => {
  const params = useParams();
  const workflowId = params.workflowId as string;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || " https://localhost:3000"
  const webhookUrl = `${baseUrl}/api/webhooks/google-form?workflowId=${workflowId}`

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
          <DialogTitle>Google Form Trigger Configs</DialogTitle>
          <DialogDescription>
            Use this webhook URL in your Google Forms's Apps Script to trigger this workflow when a form is submitted
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
              <li>Open your Google Form</li>
              <li>Click on the three dots menu &rarr; Script editor</li>
              <li>Copy and Paste the scripts below</li>
              <li>Replace the WEBHOOK_URL with your webhook URL above</li>
              <li>Save and click &quot;Triggers&quot; &rarr; Add Trigger</li>
              <li>Choose: From form &rarr; On Form submit &rarr; Save</li>
            </ol>

          </div>
          <div className="rounded-lg bg-muted p-4 space-y-3">
            <h4 className="font-medium text-sm">
              Google Apps Script:
            </h4>
            <Button type="button" variant="outline" onClick={async () => {
              const script = generateGoogleFormScript(webhookUrl);
              try {

                await navigator.clipboard.writeText(script);
                toast.success("script copied to clipboard")
              } catch (e) {

                toast.error("script failed to copy to clipboard")
              }
            }}>
              <CopyIcon className="size-4 mr-2" />
              Copy Google Form Script
            </Button>
            <p className="text-xs text-muted-foreground">
              This Script includes your webhook URL and handles form submission
            </p>
          </div>

          <div className="rounded-lg bg-muted p-4 space-y-2 ">
            <h4 className="font-medium txt-sm">
              Available Variables          </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>
                <code className="bg-background px-1 py-0.5">
                  {"{{googleForm.respondentEmail}}"}
                </code>
                -Respondent's email
              </li>
              <li>
                <code className="bg-background px-1 py-0.5">
                  {"{{googleForm.responses['QuestonName']}}"}
                </code>
                Specific answers
              </li>
              <li>
                <code className="bg-background px-1 py-0.5">
                  {"{{json.googleForm.responses}}"}
                </code>
                -All responses as JSON
              </li>
            </ul>
          </div>
        </div>

      </DialogContent>
    </Dialog >
  )

}