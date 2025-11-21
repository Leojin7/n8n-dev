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
import { on } from "events";
const formSchema = z.object({
  method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]),
  endpoint: z.string().url({ message: "Please enter a valid URL" }),
  body: z.string().optional()
});

export type FormType = z.infer<typeof formSchema>
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (values: FormType) => void;
  defaultEndpoint?: string;
  defaultMethod?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  defaultBody?: string;
}

export const HttpRequestDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultEndpoint = "",
  defaultMethod = "GET",
  defaultBody = "",

}: Props) => {

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      endpoint: defaultEndpoint,
      method: defaultMethod,
      body: defaultBody,
    },

  });

  useEffect(() => {
    form.setValue("method", defaultMethod);
    form.setValue("endpoint", defaultEndpoint);
    form.setValue("body", defaultBody);
  }, [open, defaultMethod, defaultEndpoint, defaultBody])
  const watchMethod = form.watch("method");
  const showBodyField = ["POST", "PUT", "PATCH"].includes(watchMethod);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (onSubmit) {
        await onSubmit(values);
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error in form submission:', error);
      // The error will be caught by react-hook-form and shown in the form
      throw error;
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>HTTP Request</DialogTitle>
          <DialogDescription>
            Configure settings for the HTTP request node.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8 mt-4">
            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Method</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Select the HTTP method.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endpoint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endpoint</FormLabel>
                  <Input placeholder="https://example.com/users/{{httpResponse.data.id}}" {...field} />
                  <FormDescription>Enter the endpoint URL.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {showBodyField && (
              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Body</FormLabel>
                    <Textarea className="min-h-[100px] font-mono text-sm" placeholder="Enter the body of the request." {...field}
                    />
                    <FormDescription>
                      JSON with template variables. Use{"{{variables}}"} for simple values or {"{{json variable}"} to stringify objects
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
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
