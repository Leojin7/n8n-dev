import React, { memo, useState } from 'react';
import { Database } from 'lucide-react';
import { BaseExecutionNode } from '../base-execution-node';
import { type NodeProps, useReactFlow } from '@xyflow/react';
import { type SCMStorageData } from './types';
import { SCMStorageDialog } from './dialog';
import { toast } from 'sonner';

export type SCMStorageNodeProps = NodeProps & {
  data: SCMStorageData;
};

export const SCMStorageNode = memo((props: SCMStorageNodeProps) => {
  const { data, id } = props;
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const handleOpenSettings = () => {
    setDialogOpen(true);
  };

  const handleSubmit = async (values: SCMStorageData) => {
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
      toast.success('Storage configuration saved');
      return true;
    } catch (error) {
      toast.error('Failed to save configuration');
      return false;
    }
  };

  return (
    <>
      <SCMStorageDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        initialData={data}
      />
      <BaseExecutionNode
        {...props}
        icon={Database}
        name="SCM Storage"
        description="Store mapping results"
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      >
        <div className="flex flex-col gap-1 mt-2 text-left">
          <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Retention
          </div>
          <div className="text-xs font-mono bg-muted/50 p-1 rounded border truncate">
            {data.retentionDays || 30} days
          </div>
        </div>
      </BaseExecutionNode>
    </>
  );
});

SCMStorageNode.displayName = 'SCMStorageNode';



