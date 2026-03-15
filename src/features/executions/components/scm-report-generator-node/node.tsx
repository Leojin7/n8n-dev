import React, { memo, useState } from 'react';
import { FileText } from 'lucide-react';
import { BaseExecutionNode } from '../base-execution-node';
import { type NodeProps, useReactFlow } from '@xyflow/react';
import { type SCMReportGeneratorData } from './types';
import { SCMReportGeneratorDialog } from './dialog';
import { toast } from 'sonner';

export type SCMReportGeneratorNodeProps = NodeProps & {
  data: SCMReportGeneratorData;
};

export const SCMReportGeneratorNode = memo((props: SCMReportGeneratorNodeProps) => {
  const { data, id } = props;
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const handleOpenSettings = () => {
    setDialogOpen(true);
  };

  const handleSubmit = async (values: SCMReportGeneratorData) => {
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
      toast.success('Report Generator configuration saved');
      return true;
    } catch (error) {
      toast.error('Failed to save configuration');
      return false;
    }
  };

  return (
    <>
      <SCMReportGeneratorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        initialData={data}
      />
      <BaseExecutionNode
        {...props}
        icon={FileText}
        name="SCM Report Generator"
        description="Generate mapping reports"
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      >
        <div className="flex flex-col gap-1 mt-2 text-left">
          <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Formats
          </div>
          <div className="text-xs font-mono bg-muted/50 p-1 rounded border">
            {data.formats?.join(', ') || 'None'}
          </div>
        </div>
      </BaseExecutionNode>
    </>
  );
});

SCMReportGeneratorNode.displayName = 'SCMReportGeneratorNode';

