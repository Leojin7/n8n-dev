import React, { memo, useState } from 'react';
import { Globe } from 'lucide-react';
import { BaseExecutionNode } from '../base-execution-node';
import { type NodeProps, useReactFlow } from '@xyflow/react';
import { type SCMAPIFetcherData } from './types';
import { SCMAPIFetcherDialog } from './dialog';
import { toast } from 'sonner';

export type SCMAPIFetcherNodeProps = NodeProps & {
  data: SCMAPIFetcherData;
};

export const SCMAPIFetcherNode = memo((props: SCMAPIFetcherNodeProps) => {
  const { data, id } = props;
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const handleOpenSettings = () => {
    setDialogOpen(true);
  };

  const handleSubmit = async (values: SCMAPIFetcherData) => {
    try {
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === id
            ? {
              ...node,
              data: {
                ...node.data,
                ...values,
              },
            }
            : node
        )
      );
      toast.success('API Fetcher configuration saved');
      return true;
    } catch (error) {
      toast.error('Failed to save configuration');
      return false;
    }
  };

  return (
    <>
      <SCMAPIFetcherDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        initialData={data}
      />
      <BaseExecutionNode
        {...props}
        icon={Globe}
        name="SCM API Fetcher"
        description="Fetch official API specifications"
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      >
        <div className="flex flex-col gap-1 mt-2 text-left">
          <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            APIs
          </div>
          <div className="text-xs font-mono bg-muted/50 p-1 rounded border truncate">
            {data.apis?.length > 0 ? data.apis.join(', ') : 'None selected'}
          </div>
        </div>
      </BaseExecutionNode>
    </>
  );
});

SCMAPIFetcherNode.displayName = 'SCMAPIFetcherNode';

