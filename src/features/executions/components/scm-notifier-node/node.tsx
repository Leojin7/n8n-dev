import React, { memo, useState } from 'react';
import { Bell } from 'lucide-react';
import { BaseExecutionNode } from '../base-execution-node';
import { type NodeProps, useReactFlow } from '@xyflow/react';
import { type SCMNotifierData } from './types';
import { SCMNotifierDialog } from './dialog';
import { toast } from 'sonner';

export type SCMNotifierNodeProps = NodeProps & {
  data: SCMNotifierData;
};

export const SCMNotifierNode = memo((props: SCMNotifierNodeProps) => {
  const { data, id } = props;
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const handleOpenSettings = () => {
    setDialogOpen(true);
  };

  const handleSubmit = async (values: SCMNotifierData) => {
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
      toast.success('Notifier configuration saved');
      return true;
    } catch (error) {
      toast.error('Failed to save configuration');
      return false;
    }
  };

  return (
    <>
      <SCMNotifierDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        initialData={data}
      />
      <BaseExecutionNode
        {...props}
        icon={Bell}
        name="SCM Notifier"
        description="Send notifications"
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      >
        <div className="flex flex-col gap-1 mt-2 text-left">
          <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Channels
          </div>
          <div className="text-xs font-mono bg-muted/50 p-1 rounded border">
            {data.channels?.length > 0 ? data.channels.join(', ') : 'None'}
          </div>
        </div>
      </BaseExecutionNode>
    </>
  );
});

SCMNotifierNode.displayName = 'SCMNotifierNode';



