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
import Image from "next/image";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CredentialType } from "@/generated/prisma";
import { useCredentialsByType } from "@/features/credentials/hooks/use-credentials";
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

export const AVAILABLE_MODELS = [
  "claude-3-opus-20240229",
  "claude-3-sonnet-20240229",
  "claude-3-haiku-20240307",
  "claude-2.1",
  "claude-2.0",
  "claude-instant-1.2"
] as const;


const formSchema = z.object({
  variableName: z.string().min(1, { message: "Variable name is required" }).regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
    message:
      "Variable name must start with a letter or underscore and contain only letters, numbers, and underscores",
  }),

  systemPrompt: z.string().optional(),
  userPrompt: z.string().min(1, "User prompt is required"),
  model: z.string().min(1, "Model is required"),
  credentialId: z.string().min(1, "Credential is required"),
});


export type AnthropicFormValues = z.infer<typeof formSchema>
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (values: AnthropicFormValues) => void;
  defaultValues?: Partial<AnthropicFormValues>;
}

export const AnthropicDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},

}: Props) => {
  const { data: credentials, isLoading: isLoadingCredentials, } = useCredentialsByType(CredentialType.ANTHROPIC)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues.variableName || "",
      credentialId: defaultValues.credentialId || "",
      model: defaultValues.model || AVAILABLE_MODELS[0],
      systemPrompt: defaultValues.systemPrompt || "",
      userPrompt: defaultValues.userPrompt || "",
    },

  });

  useEffect(() => {
    if (open) {
      form.reset({

        variableName: defaultValues.variableName || "",
        model: defaultValues.model || AVAILABLE_MODELS[0],
        credentialId: defaultValues.credentialId || "",
        systemPrompt: defaultValues.systemPrompt || "",
        userPrompt: defaultValues.userPrompt || "",

      })
    }
  }, [open, defaultValues, form])
  const watchVariableName = form.watch("variableName") || "myAnthropic";


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
          <DialogTitle>Anthropic Config</DialogTitle>
          <DialogDescription>
            Configure AI model and prompts for this Node
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
                    <Input placeholder="myAnthropic" {...field} />
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
              name="credentialId"
              render={({ field }) => (

                <FormItem>
                  <FormLabel>Anthropic Credential</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingCredentials || !credentials?.length}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a Credential" />
                      </SelectTrigger>
                      <SelectContent>
                        {credentials?.map((credential) => (
                          <SelectItem key={credential.id} value={credential.id}>
                            <div className="flex items-center gap-x-2">
                              <Image src="/logos/anthropic.svg" alt="Anthropic" width={24} height={24} />
                              <span>{credential.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel> Select Model</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>

                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {AVAILABLE_MODELS.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The Anthropic model to use for completion
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />





            <FormField
              control={form.control}
              name="systemPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>System Prompt(Optional)</FormLabel>
                  <Textarea className="min-h-[80px] font-mono text-sm" placeholder="Your are a Helpful assistant..." {...field}
                  />
                  <FormDescription>
                    Sets the behaviour of the assistant. Use{"{{variables}}"} for simple values or {"{{json variable}}"} to stringify objects
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="userPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Prompt</FormLabel>
                  <Textarea className="min-h-[120px] font-mono text-sm" placeholder="summarize this text: {{json.httpResponse.data}}" {...field}
                  />
                  <FormDescription>
                    Prompt to send to AI. Use {'{{variables}}'} for simple values or {'{{json variable}}'} to stringify objects
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
