"use client";

import { Suspense } from "react";
import { CredentialType } from "@/generated/prisma";
import Image from "next/image";
import { useCreateCredentials, useUpdateCredential, useSuspenseCredential } from "../hooks/use-credentials";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import z from "zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { prefetch } from "@/trpc/server";
import { prefetchCredential } from "../server/prefetch";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(CredentialType),
  value: z.string().min(1, "API Key is required"),
});

type FormValues = z.infer<typeof formSchema>;

const credentialTypeOptions = [
  {
    value: CredentialType.GEMINI,
    label: "Gemini",
    logo: "/logos/gemini.svg"
  },
  {
    value: CredentialType.ANTHROPIC,
    label: "Anthropic",
    logo: "/logos/anthropic.svg"
  },
  {
    value: CredentialType.OPENAI,
    label: "OpenAI",
    logo: "/logos/openai.svg"
  },
]

interface CredentialFormProps {
  initialData?: {
    id?: string;
    name: string;
    type: CredentialType;
    value?: string;
  }
}

export const CredentialForm = ({ initialData }: CredentialFormProps) => {
  const router = useRouter();
  const createCredential = useCreateCredentials();
  const updateCredential = useUpdateCredential();
  const { handleError, modal } = useUpgradeModal();
  const isEdit = !!initialData?.id;
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      type: CredentialType.OPENAI,
      value: "",
    }
  })

  const onSubmit = async (values: FormValues) => {
    if (isEdit && initialData?.id) {
      await updateCredential.mutateAsync({
        id: initialData?.id!,
        ...values,
      })
    } else {
      await createCredential.mutateAsync(values, {
        onSuccess: (data) => {
          router.push(`/credentials/${data.id}`);
        },
        onError: (error) => {
          handleError(error);
        }
      })
    }
    router.push("/credentials")
  }
  return (
    <>
      {modal}
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>
            {isEdit ? "Edit Credential" : "Create Credential"}
          </CardTitle>
          <CardDescription>
            {isEdit ? "Update your API Key or credential details" : "Add a new API key or credential to your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control}
                name="name"
                render={({ field }) => (

                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My Api Key" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control}
                name="type"
                render={({ field }) => (

                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                        <SelectContent>
                          {credentialTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center gap-x-2">
                                <Image src={option.logo} alt={option.label} width={24} height={24} />
                                <span>{option.label}</span>
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

              <FormField control={form.control}
                name="value"
                render={({ field }) => (

                  <FormItem>
                    <FormLabel>Value</FormLabel>
                    <FormControl>
                      <Input placeholder="sk-..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />


              <div className="flex gap-4">
                <Button type="submit"
                  disabled={
                    createCredential.isPending || createCredential.isPending
                  }>
                  {isEdit ? "Update" : "Create"}
                </Button>
                <Button type="button" variant="outline"
                  asChild
                >
                  <Link href="/credentials" prefetch>
                    Cancel
                  </Link>


                </Button>
              </div>
            </form>
          </Form>

        </CardContent>
      </Card>
    </>
  )
}

export function CredentialView({ credentialId }: { credentialId: string }) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-8">Loading credential...</div>}>
      <CredentialViewContent credentialId={credentialId} />
    </Suspense>
  );
}

function CredentialViewContent({ credentialId }: { credentialId: string }) {
  const { data: credential, isError } = useSuspenseCredential(credentialId);

  if (isError || !credential) {
    return <div className="flex items-center justify-center p-8 text-red-500">Failed to load credential</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Edit Credential</h2>
      </div>
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <CredentialForm
          initialData={{
            id: credential.id,
            name: credential.name,
            type: credential.type,
            value: credential.value
          }}
        />
      </div>
    </div>
  );
}