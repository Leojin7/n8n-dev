import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { z } from 'zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SCMClaudeMatcherData, SCMClaudeMatcherDataSchema } from './types';

interface SCMClaudeMatcherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: SCMClaudeMatcherData) => void;
  initialData?: Partial<SCMClaudeMatcherData>;
}

export const SCMClaudeMatcherDialog: React.FC<SCMClaudeMatcherDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  initialData = {}
}) => {
  const form = useForm<SCMClaudeMatcherData>({
    resolver: zodResolver(SCMClaudeMatcherDataSchema),
    defaultValues: {
      variableName: '',
      apiSpecs: null,
      model: 'claude-3-5-sonnet-20240620',
      strategy: 'hybrid',
      confidence: 0.7,
      ...initialData
    } as any
  });

  const handleSubmit: SubmitHandler<SCMClaudeMatcherData> = (data) => {
    onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>AI Parameter Matching</DialogTitle>
          <DialogDescription>
            Configure Claude AI to match your Java parameters with official API specifications.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <div>
              <Label htmlFor="variableName">Variable Name</Label>
              <Input
                id="variableName"
                placeholder="e.g., matchedParams"
                {...form.register('variableName')}
              />
              {form.formState.errors.variableName && (
                <p className="text-sm text-red-600">{(form.formState.errors.variableName.message as string) || 'Required'}</p>
              )}
            </div>

            <div>
              <Label htmlFor="model">Claude Model</Label>
              <select
                id="model"
                className="w-full px-3 py-2 border rounded-md"
                {...form.register('model')}
              >
                <option value="claude-3-5-sonnet-20240620">Claude 3.5 Sonnet</option>
                <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
              </select>
              {form.formState.errors.model && (
                <p className="text-sm text-red-600">{(form.formState.errors.model.message as string) || 'Required'}</p>
              )}
            </div>

            <div>
              <Label htmlFor="strategy">Matching Strategy</Label>
              <select
                id="strategy"
                className="w-full px-3 py-2 border rounded-md"
                {...form.register('strategy')}
              >
                <option value="exact">Exact Match</option>
                <option value="semantic">Semantic Match</option>
                <option value="hybrid">Hybrid (Recommended)</option>
              </select>
              {form.formState.errors.strategy && (
                <p className="text-sm text-red-600">{(form.formState.errors.strategy.message as string) || 'Required'}</p>
              )}
            </div>

            <div>
              <Label htmlFor="confidence">Minimum Confidence ({form.watch('confidence')})</Label>
              <input
                id="confidence"
                type="range"
                min="0"
                max="1"
                step="0.1"
                className="w-full"
                {...form.register('confidence', { valueAsNumber: true })}
              />
              {form.formState.errors.confidence && (
                <p className="text-sm text-red-600">{(form.formState.errors.confidence.message as string) || 'Required'}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="submit">Start Matching</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
