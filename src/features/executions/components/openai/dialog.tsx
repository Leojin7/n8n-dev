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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useReactFlow } from "@xyflow/react";
import { toast } from "sonner";
import { Variable } from "lucide-react";

export const AVAILABLE_MODELS = [
  "gpt-4-turbo-preview",
  "gpt-4",
  "gpt-3.5-turbo",
  "gpt-3.5-turbo-16k"
] as const;

const formSchema = z.object({
  variableName: z.string().min(1, { message: "Variable name is required" }).regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
    message: "Variable name must start with a letter or underscore and contain only letters, numbers, and underscores",
  }),
  systemPrompt: z.string().optional(),
  userPrompt: z.string().min(1, "User prompt is required"),
  model: z.string().min(1, "Model is required"),
});

export type OpenAIFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (values: OpenAIFormValues) => void;
  defaultValues?: Partial<OpenAIFormValues>;
}

export const OpenAIDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues.variableName || "",
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
        systemPrompt: defaultValues.systemPrompt || "",
        userPrompt: defaultValues.userPrompt || "",
      });
    }
  }, [open, defaultValues, form]);

  const watchVariableName = form.watch("variableName") || "myOpenAI";


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
          <DialogTitle>OpenAI Config</DialogTitle>
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
                    <Input placeholder="myOpenAI" {...field} />
                  </FormControl>
                  <FormDescription>
                    Use this name to reference the result in other nodes:{" "}
                    {`{{${watchVariableName}.text}}`}
                  </FormDescription>
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
                    The OpenAI ChatGPT model to use for completion

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
                    Sets the behaviour of the assistant. Use{"{{variables}}"} for simple values or {"{{json variable}"} to stringify objects
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
                  <Textarea className="min-h-[120px] font-mono text-sm" placeholder="summarize this text :{{json.httpResonse.data}}" {...field}
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
