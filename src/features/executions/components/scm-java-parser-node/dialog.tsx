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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SCMJavaParserData, SCMJavaParserDataSchema } from './types';
import { SubmitHandler } from 'react-hook-form';

interface SCMJavaParserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: SCMJavaParserData) => void;
  initialData?: Partial<SCMJavaParserData>;
}

export const SCMJavaParserDialog: React.FC<SCMJavaParserDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  initialData = {}
}) => {
  const form = useForm<SCMJavaParserData>({
    resolver: zodResolver(SCMJavaParserDataSchema),
    defaultValues: {
      variableName: '',
      repoUrl: '',
      branch: 'main',
      token: '',
      filePatterns: '**/*.java',
      includeTests: false,
      includePrivate: false,
      ...initialData
    } as any
  });

  const handleSubmit: SubmitHandler<SCMJavaParserData> = (data) => {
    onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configure SCM Java Parser</DialogTitle>
          <DialogDescription>
            Parse Java files from a Git repository to extract parameters and methods.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="variableName">Variable Name</Label>
              <Input
                id="variableName"
                placeholder="e.g., javaParams"
                {...form.register('variableName')}
              />
              {form.formState.errors.variableName && (
                <p className="text-sm text-red-600">{(form.formState.errors.variableName.message as string) || 'Required'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="repoUrl">Repository URL</Label>
              <Input
                id="repoUrl"
                placeholder="https://github.com/user/repo"
                {...form.register('repoUrl')}
              />
              {form.formState.errors.repoUrl && (
                <p className="text-sm text-red-600">{(form.formState.errors.repoUrl.message as string) || 'Invalid URL'}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="branch">Branch</Label>
                <Input
                  id="branch"
                  placeholder="main"
                  {...form.register('branch')}
                />
                {form.formState.errors.branch && (
                  <p className="text-sm text-red-600">{(form.formState.errors.branch.message as string) || 'Required'}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="token">Access Token</Label>
                <Input
                  id="token"
                  type="password"
                  placeholder="Git Personal Access Token"
                  {...form.register('token')}
                />
                {form.formState.errors.token && (
                  <p className="text-sm text-red-600">{(form.formState.errors.token.message as string) || 'Required'}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filePatterns">File Patterns (Optional)</Label>
              <Input
                id="filePatterns"
                placeholder="**/*.java"
                {...form.register('filePatterns')}
              />
              {form.formState.errors.filePatterns && (
                <p className="text-sm text-red-600">{(form.formState.errors.filePatterns.message as string) || 'Invalid pattern'}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center space-x-2">
                <input
                  id="includeTests"
                  type="checkbox"
                  {...form.register('includeTests')}
                />
                <Label htmlFor="includeTests">Include Test Files</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="includePrivate"
                  type="checkbox"
                  {...form.register('includePrivate')}
                />
                <Label htmlFor="includePrivate">Include Private Methods</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit">Start Parsing</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
