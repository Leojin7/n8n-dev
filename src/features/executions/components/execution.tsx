"use client";

import { ExecutionStatus } from "@/generated/prisma"
import { CheckCircle2Icon, ClockIcon, Loader2Icon, XCircleIcon } from "lucide-react"

import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@radix-ui/react-collapsible";
import { useSuspenseExecution } from "../hooks/use-executions";


const getStatusIcon = (status: ExecutionStatus) => {
  switch (status) {

    case ExecutionStatus.SUCCESS:
      return <CheckCircle2Icon className="size-5 text-green-600" />
    case ExecutionStatus.FAILED:
      return <XCircleIcon className="size-5 text-red-600" />
    case ExecutionStatus.RUNNING:
      return <Loader2Icon className="size-5 text-primary animate-spin" />
    default:
      return <ClockIcon className="size-5 text-muted-foreground" />
  }
}

const formatStatus = (status: ExecutionStatus) => {

  return status.charAt(0) + status.slice(1).toLowerCase();
}


export const ExecutionView = ({ executionId }: { executionId: string }) => {

  const { data: execution } = useSuspenseExecution(executionId);
  const [showStackTrace, setShowStackTrace] = useState(false);

  const duration = execution?.startedAt && execution?.completedAt
    ? (() => {
      const started = new Date(execution.startedAt);
      const completed = new Date(execution.completedAt);
      return Math.round((completed.getTime() - started.getTime()) / 1000);
    })()
    : null;

  return (
    <Card className="shadow-none">

      <CardHeader>
        <div className="flex items-center gap-3">
          {getStatusIcon(execution.status)}
          <div>
            <CardTitle>{formatStatus(execution.status)}</CardTitle>
            <CardDescription>
              Execution for {execution.workflow?.name}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Workflow
            </p>
            <Link href={`/workflows/${execution.workflow?.id}`} prefetch className="text-sm hover:underline text-primary">
              {execution.workflow?.name || 'N/A'}
            </Link>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Status
            </p>
            <p className="text-sm font-medium">{formatStatus(execution.status)}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Started At
            </p>
            <p className="text-sm font-medium">{formatDistanceToNow(execution.startedAt, { addSuffix: true })}</p>
          </div>
          {execution.completedAt && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Completed At
              </p>
              <p className="text-sm font-medium">{formatDistanceToNow(execution.completedAt, { addSuffix: true })}</p>
            </div>
          )}
          {duration !== null ? (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Time Taken In Execution
              </p>
              <p className="text-sm font-medium">{duration} seconds</p>
            </div>
          ) : null}


          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Inngest Event ID
            </p>
            <p className="text-sm font-medium">{execution.inngestEventId}</p>
          </div>
        </div>
        {execution.error && (
          <div>
            <div className="mt-6 p-4 bg-red-50 rounded-md space-y-3">
              <div>
                <p className="text-sm font-medium text-red-700">
                  Error
                </p>
                <p className="text-sm text-red-800 font-mono">
                  {execution.error}
                </p>
              </div>

              {execution.errorStack && (
                <Collapsible
                  open={showStackTrace}
                  onOpenChange={(open) => setShowStackTrace(open)}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm"
                      className="text-red-700 hover:text-red-200 hover:bg-red-600">
                      {showStackTrace ? "Hide Stack Trace" : "Show Stack Trace"}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <pre className="text-xs font-mono text-red-800 overflow-auto mt-2 p-2 bg-red-50 rounded ">
                      {execution.errorStack}
                    </pre>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          </div>
        )}

        {execution.output && (

          <div className="mt-6 p-4 bg-green-50 rounded-md space-y-3">
            <p className="text-sm font-medium mb-0">Output</p>
            <pre className="text-xs font-mono text-green-800 overflow-auto mt-2 p-2 bg-green-50 rounded ">
              {JSON.stringify(execution.output, null, 2)}
            </pre>
          </div>

        )}
      </CardContent>
    </Card>
  )
}