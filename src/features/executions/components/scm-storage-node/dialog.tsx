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
import { SCMStorageData, SCMStorageDataSchema } from './types';

interface SCMStorageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: SCMStorageData) => void;
  initialData?: Partial<SCMStorageData>;
}

export const SCMStorageDialog: React.FC<SCMStorageDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  initialData = {}
}) => {
  const form = useForm<SCMStorageData>({
    resolver: zodResolver(SCMStorageDataSchema),
    defaultValues: {
      variableName: '',
      storeReports: true,
      storeMappings: true,
      retentionDays: 30,
      enableVersioning: false,
      ...initialData
    }
  });

  const handleSubmit: SubmitHandler<SCMStorageData> = (data) => {
    onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configure SCM Storage</DialogTitle>
          <DialogDescription>
            Save SCM Mapper results to database with configurable retention and versioning.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <div>
              <Label htmlFor="variableName">Variable Name</Label>
              <Input
                id="variableName"
                placeholder="e.g., storage"
                {...form.register('variableName')}
              />
              {form.formState.errors.variableName && (
                <p className="text-sm text-red-600">{(form.formState.errors.variableName.message as string) || 'Required'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Storage Options</Label>
              <div className="space-y-2 border rounded-md p-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    {...form.register('storeReports')}
                  />
                  <span className="text-sm">Store Reports</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    {...form.register('storeMappings')}
                  />
                  <span className="text-sm">Store Mappings</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    {...form.register('enableVersioning')}
                  />
                  <span className="text-sm">Enable Versioning</span>
                </label>
              </div>
            </div>

            <div>
              <Label htmlFor="retentionDays">Retention Days</Label>
              <Input
                id="retentionDays"
                type="number"
                min="1"
                max="365"
                {...form.register('retentionDays', { valueAsNumber: true })}
              />
              {form.formState.errors.retentionDays && (
                <p className="text-sm text-red-600">{(form.formState.errors.retentionDays.message as string) || 'Required'}</p>
              )}
              <div className="text-xs text-gray-500 mt-1">
                Number of days to keep results. Set to 0 for permanent storage.
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
