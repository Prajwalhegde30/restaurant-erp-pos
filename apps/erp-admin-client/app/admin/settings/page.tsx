'use client';

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { fetchApi } from '../../../lib/apiClient';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
  Input,
  Label,
  Button,
} from '@repo/ui';
import { LoadingState } from '../../../components/ui/loading-state';
import { ErrorState } from '../../../components/ui/error-state';
import { Configuration } from '@repo/types';

const SettingsSchema = z.object({
  taxRate: z.string().min(1, 'Tax rate is required'),
  currencyCode: z.string().min(3, 'Currency code must be at least 3 characters'),
});
type SettingsFormValues = z.infer<typeof SettingsSchema>;

export default function SettingsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery<{ data: Configuration[] }>({
    queryKey: ['settings'],
    queryFn: () => fetchApi('/settings'),
  });

  const saveMutation = useMutation({
    mutationFn: async (variables: { key: string; value: string; level: string }) => {
      // Idempotency key is now automatically injected by apiClient
      return fetchApi('/settings', {
        method: 'POST',
        body: JSON.stringify(variables),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(SettingsSchema),
    defaultValues: {
      taxRate: '',
      currencyCode: 'USD',
    },
  });

  useEffect(() => {
    if (data?.data) {
      reset({
        taxRate: String(
          data.data.find((s) => s.key === 'tax_rate' && s.level === 'TENANT')?.value || '',
        ),
        currencyCode: String(
          data.data.find((s) => s.key === 'currency_code' && s.level === 'TENANT')?.value || 'USD',
        ),
      });
    }
  }, [data, reset]);

  const onSubmit = async (values: SettingsFormValues) => {
    const promises = [];

    // Only save what might have changed (for simplicity we save both, but in a real app we'd check dirty fields)
    promises.push(
      saveMutation.mutateAsync({ key: 'tax_rate', value: values.taxRate, level: 'TENANT' }),
    );
    promises.push(
      saveMutation.mutateAsync({
        key: 'currency_code',
        value: values.currencyCode,
        level: 'TENANT',
      }),
    );

    await Promise.all(promises);

    // reset form with new values to clear dirty state
    reset(values);
  };

  if (isLoading) return <LoadingState message="Loading settings..." />;
  if (error) return <ErrorState message={(error as Error).message} onRetry={() => refetch()} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage tenant and branch-level settings.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>Global Store Settings</CardTitle>
              <CardDescription>Settings applied to all branches</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  step="0.01"
                  {...register('taxRate')}
                  disabled={isSubmitting}
                />
                {errors.taxRate && (
                  <p className="text-xs text-destructive">{errors.taxRate.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="currencyCode">Currency Code</Label>
                <Input
                  id="currencyCode"
                  type="text"
                  {...register('currencyCode')}
                  disabled={isSubmitting}
                />
                {errors.currencyCode && (
                  <p className="text-xs text-destructive">{errors.currencyCode.message}</p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isSubmitting || !isDirty}>
                {isSubmitting ? 'Saving...' : 'Save Settings'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
