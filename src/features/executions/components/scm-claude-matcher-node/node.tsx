import React, { memo, useState } from 'react';
import { Bot } from 'lucide-react';
import { BaseExecutionNode } from '../base-execution-node';
import { type NodeProps, useReactFlow } from '@xyflow/react';
import { type SCMClaudeMatcherData } from './types';
import { SCMClaudeMatcherDialog } from './dialog';
import { toast } from 'sonner';

export type SCMClaudeMatcherNodeProps = NodeProps & {
  data: SCMClaudeMatcherData;
};

export const SCMClaudeMatcherNode = memo((props: SCMClaudeMatcherNodeProps) => {
  const { data, id } = props;
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const handleOpenSettings = () => {
    setDialogOpen(true);
  };

  const handleSubmit = async (values: SCMClaudeMatcherData) => {
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
      toast.success('Claude Matcher configuration saved');
      return true;
    } catch (error) {
      toast.error('Failed to save configuration');
      return false;
    }
  };

  return (
    <>
      <SCMClaudeMatcherDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        initialData={data}
      />
      <BaseExecutionNode
        {...props}
        icon={Bot}
        name="SCM Claude Matcher"
        description="AI parameter matching"
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      >
        <div className="flex flex-col gap-1 mt-2 text-left">
          <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Model
          </div>
          <div className="text-xs font-mono bg-muted/50 p-1 rounded border truncate">
            {data.model || 'Claude 3.5 Sonnet'}
          </div>
        </div>
      </BaseExecutionNode>
    </>
  );
});

SCMClaudeMatcherNode.displayName = 'SCMClaudeMatcherNode';

