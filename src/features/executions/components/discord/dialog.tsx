"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormDescription,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";



import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";

import { useReactFlow } from "@xyflow/react";
import { on } from "events";
import { toast } from "sonner";
import { Variable } from "lucide-react";




const formSchema = z.object({
  variableName: z.string().min(1, { message: "Variable name is required" }).regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
    message:
      "Variable name must start with a letter or underscore and contain only letters, numbers, and underscores",
  }),
  username: z.string().optional(),
  content:
    z.string().min(1, "Message content is required").max(2000, "Discord messages cannot exceed 2000 characters"),
  webhookUrl: z.string().min(1, "Webhook url is required"),

});


export type DiscordFormValues = z.infer<typeof formSchema>
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (values: DiscordFormValues) => void;
  defaultValues?: Partial<DiscordFormValues>;
}

export const DiscordDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},

}: Props) => {

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: defaultValues.username || "",
      variableName: defaultValues.variableName || "",

      content: defaultValues.content || "",
      webhookUrl: defaultValues.webhookUrl || "",
    },

  });

  useEffect(() => {
    if (open) {
      form.reset({

        username: defaultValues.username || "",
        variableName: defaultValues.variableName || "",

        content: defaultValues.content || "",
        webhookUrl: defaultValues.webhookUrl || "",

      })
    }
  }, [open, defaultValues, form])
  const watchVariableName = form.watch("variableName") || "myDiscord";


  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (onSubmit) {
        await onSubmit(values);
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error in form submission:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save configuration');
      // Error is logged and shown in toast, no need to re-throw
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Discord Config</DialogTitle>
          <DialogDescription>
            Configure the Discord Webhook settings for this Node
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8 mt-4">


            <FormField
              control={form.control}
              name="variableName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variable Name</FormLabel>
                  <FormControl>
                    <Input placeholder="myDiscord" {...field} />
                  </FormControl>
                  <FormDescription>
                    Use this name to reference the result in other nodes:{" "}
                    {`{{${watchVariableName}.text}}`}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control}
              name="webhookUrl"
              render={({ field }) => (

                <FormItem>
                  <FormLabel>Webhook URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://discord.com/api/webhooks/..."{...field} />

                  </FormControl>
                  <FormDescription>
                    Get this from Discord: Channel Settings → Integrations → Webhooks
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meessage Content</FormLabel>
                  <FormControl>
                    <Textarea className="min-h-[80px] font-mono text-sm" placeholder="Summar:{{myGemini.text}}" {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The message to send. Use{"{{variables}}"} for simple values or {"{{json variable}"} to stringify objects
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control}
              name="username"
              render={({ field }) => (

                <FormItem>
                  <FormLabel>Bot Username(Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Workflow Bot"{...field} />

                  </FormControl>
                  <FormDescription>
                    Override the webhook's default username
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="mt-4">
              <Button type="submit">Save</Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
