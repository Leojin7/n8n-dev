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
import { SCMReportGeneratorData, SCMReportGeneratorDataSchema } from './types';

interface SCMReportGeneratorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: SCMReportGeneratorData) => void;
  initialData?: Partial<SCMReportGeneratorData>;
}

export const SCMReportGeneratorDialog: React.FC<SCMReportGeneratorDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  initialData = {}
}) => {
  const form = useForm<SCMReportGeneratorData>({
    resolver: zodResolver(SCMReportGeneratorDataSchema),
    defaultValues: {
      variableName: '',
      mappings: null,
      formats: ['markdown', 'json'],
      ...initialData
    } as any
  });

  const handleSubmit: SubmitHandler<SCMReportGeneratorData> = (data) => {
    onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Generate Reports</DialogTitle>
          <DialogDescription>
            Generate comprehensive reports in multiple formats from SCM Mapper results.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <div>
              <Label htmlFor="variableName">Variable Name</Label>
              <Input
                id="variableName"
                placeholder="e.g., reports"
                {...form.register('variableName')}
              />
              {form.formState.errors.variableName && (
                <p className="text-sm text-red-600">{form.formState.errors.variableName.message as React.ReactNode}</p>
              )}
            </div>

            <div>
              <Label htmlFor="mappings">Mappings</Label>
              <Input
                id="mappings"
                placeholder="Paste mapping JSON from previous node..."
                {...form.register('mappings')}
              />
              {form.formState.errors.mappings && (
                <p className="text-sm text-red-600">{form.formState.errors.mappings.message as React.ReactNode}</p>
              )}
            </div>

            <div>
              <Label htmlFor="formats">Report Formats</Label>
              <div className="space-y-2">
                {['markdown', 'json', 'html', 'csv'].map((format) => (
                  <label key={format} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      value={format}
                      {...form.register('formats')}
                    />
                    <span className="text-sm capitalize">{format}</span>
                  </label>
                ))}
              </div>
              {form.formState.errors.formats && (
                <p className="text-sm text-red-600">{form.formState.errors.formats.message as React.ReactNode}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="submit">Generate Reports</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
