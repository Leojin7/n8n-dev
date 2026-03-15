import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SCMAPIFetcherData, SCMAPIFetcherDataSchema } from './types';

interface SCMAPIFetcherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: SCMAPIFetcherData) => void;
  initialData?: Partial<SCMAPIFetcherData>;
}

export const SCMAPIFetcherDialog: React.FC<SCMAPIFetcherDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  initialData = {}
}) => {
  const form = useForm<SCMAPIFetcherData>({
    resolver: zodResolver(SCMAPIFetcherDataSchema),
    defaultValues: {
      variableName: '',
      apis: [],
      includeVersions: true,
      includeExamples: true,
      ...initialData
    } as any
  });

  const handleSubmit: SubmitHandler<SCMAPIFetcherData> = (data) => {
    onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configure API Fetcher</DialogTitle>
          <DialogDescription>
            Select official APIs to fetch specifications for parameter matching.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <div>
              <Label htmlFor="variableName">Variable Name</Label>
              <Input
                id="variableName"
                placeholder="e.g., apiSpecs"
                {...form.register('variableName')}
              />
              {form.formState.errors.variableName && (
                <p className="text-sm text-red-600">{(form.formState.errors.variableName.message as string) || 'Required'}</p>
              )}
            </div>

            <div>
              <Label htmlFor="apis">Available APIs</Label>
              <div className="space-y-2 border rounded-md p-3">
                {['GitHub', 'GitLab', 'Bitbucket', 'Stripe', 'Twilio'].map((api) => (
                  <label key={api} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      value={api.toLowerCase()}
                      {...form.register('apis')}
                    />
                    <span className="text-sm">{api}</span>
                  </label>
                ))}
              </div>
              {form.formState.errors.apis && (
                <p className="text-sm text-red-600">{(form.formState.errors.apis.message as string) || 'Select at least one'}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center space-x-2">
                <input
                  id="includeVersions"
                  type="checkbox"
                  {...form.register('includeVersions')}
                />
                <Label htmlFor="includeVersions">Include API Versions</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="includeExamples"
                  type="checkbox"
                  {...form.register('includeExamples')}
                />
                <Label htmlFor="includeExamples">Include Response Examples</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit">Save Configuration</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
