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
import { SCMNotifierData, SCMNotifierDataSchema } from './types';

interface SCMNotifierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: SCMNotifierData) => void;
  initialData?: Partial<SCMNotifierData>;
}

export const SCMNotifierDialog: React.FC<SCMNotifierDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  initialData = {}
}) => {
  const form = useForm<SCMNotifierData>({
    resolver: zodResolver(SCMNotifierDataSchema),
    defaultValues: {
      variableName: '',
      channels: ['slack'],
      notifyOnSuccess: true,
      notifyOnFailure: true,
      messageTemplate: '',
      ...initialData
    }
  });

  const handleSubmit: SubmitHandler<SCMNotifierData> = (data) => {
    onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configure SCM Notifier</DialogTitle>
          <DialogDescription>
            Send notifications when SCM Mapper analysis completes or fails.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <div>
              <Label htmlFor="variableName">Variable Name</Label>
              <Input
                id="variableName"
                placeholder="e.g., notifications"
                {...form.register('variableName')}
              />
              {form.formState.errors.variableName && (
                <p className="text-sm text-red-600">{(form.formState.errors.variableName.message as string) || 'Required'}</p>
              )}
            </div>

            <div>
              <Label htmlFor="channels">Notification Channels</Label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value="slack"
                    {...form.register('channels')}
                  />
                  <span className="text-sm">Slack</span>
                </label>
              </div>
              {form.formState.errors.channels && (
                <p className="text-sm text-red-600">{(form.formState.errors.channels.message as string) || 'Select at least one'}</p>
              )}
            </div>

            <div>
              <Label htmlFor="notifyOnSuccess">Notify on Success</Label>
              <div className="flex items-center space-x-2">
                <input
                  id="notifyOnSuccess"
                  type="checkbox"
                  {...form.register('notifyOnSuccess')}
                />
                <span className="text-sm">Send notifications on successful completion</span>
              </div>
            </div>

            <div>
              <Label htmlFor="notifyOnFailure">Notify on Failure</Label>
              <div className="flex items-center space-x-2">
                <input
                  id="notifyOnFailure"
                  type="checkbox"
                  {...form.register('notifyOnFailure')}
                />
                <span className="text-sm">Send notifications on failure</span>
              </div>
            </div>

            <div>
              <Label htmlFor="messageTemplate">Message Template (Optional)</Label>
              <Input
                id="messageTemplate"
                placeholder="SCM Mapper Analysis Complete! 🎯"
                {...form.register('messageTemplate')}
              />
              {form.formState.errors.messageTemplate && (
                <p className="text-sm text-red-600">{(form.formState.errors.messageTemplate.message as string) || 'Invalid'}</p>
              )}
              <div className="text-xs text-gray-500 mt-1">
                Available variables: {"{{mappingsCount}}"}, {"{{status}}"}, {"{{avgConfidence}}"}
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
