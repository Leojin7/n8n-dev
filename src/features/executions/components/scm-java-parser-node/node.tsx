import React, { memo, useState } from 'react';
import { Code, GitBranch } from 'lucide-react';
import { BaseExecutionNode } from '../base-execution-node';
import { type NodeProps, useReactFlow } from '@xyflow/react';
import { type SCMJavaParserData } from './types';
import { SCMJavaParserDialog } from './dialog';
import { toast } from 'sonner';

export type SCMJavaParserNodeProps = NodeProps & {
  data: SCMJavaParserData;
};

export const SCMJavaParserNode = memo((props: SCMJavaParserNodeProps) => {
  const { data, id } = props;
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const handleOpenSettings = () => {
    setDialogOpen(true);
  };

  const handleSubmit = async (values: SCMJavaParserData) => {
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
      toast.success('Java Parser configuration saved');
      return true;
    } catch (error) {
      toast.error('Failed to save configuration');
      return false;
    }
  };

  return (
    <>
      <SCMJavaParserDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        initialData={data}
      />
      <BaseExecutionNode
        {...props}
        icon={Code}
        name="SCM Java Parser"
        description="Extract parameters from Java code"
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      >
        <div className="flex flex-col gap-1 mt-2 text-left">
          <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            <GitBranch className="size-3" /> {data.branch || 'main'}
          </div>
          <div className="text-xs font-mono bg-muted/50 p-1 rounded border truncate">
            {data.repoUrl || 'No repository URL'}
          </div>
        </div>
      </BaseExecutionNode>
    </>
  );
});

SCMJavaParserNode.displayName = 'SCMJavaParserNode';




