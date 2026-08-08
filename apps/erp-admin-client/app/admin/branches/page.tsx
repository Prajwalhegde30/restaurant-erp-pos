'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { fetchApi } from '../../../lib/apiClient';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Input,
  Label,
} from '@repo/ui';
import { Plus } from 'lucide-react';
import { Branch } from '@repo/types';
import { z } from 'zod';
import { LoadingState } from '../../../components/ui/loading-state';
import { ErrorState } from '../../../components/ui/error-state';
import { EmptyState } from '../../../components/ui/empty-state';
import { ConfirmDialog } from '../../../components/ui/confirm-dialog';

// Minimal schema for Branch creation/editing
const BranchFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  timezone: z.string().min(1, 'Timezone is required'),
  currency: z.string().min(1, 'Currency is required'),
});
type BranchFormValues = z.infer<typeof BranchFormSchema>;

export default function BranchesPage() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useQuery<{ data: Branch[] }>({
    queryKey: ['branches'],
    queryFn: () => fetchApi('/branches'),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BranchFormValues>({
    resolver: zodResolver(BranchFormSchema),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetchApi(`/branches/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      setDeleteId(null);
    },
  });

  const saveMutation = useMutation({
    mutationFn: (values: BranchFormValues) => {
      if (editingBranch) {
        return fetchApi(`/branches/${editingBranch.id}`, {
          method: 'PUT',
          body: JSON.stringify(values),
        });
      } else {
        return fetchApi('/branches', {
          method: 'POST',
          body: JSON.stringify(values),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      handleCloseForm();
    },
  });

  const handleOpenForm = (branch?: Branch) => {
    if (branch) {
      setEditingBranch(branch);
      reset({
        name: branch.name,
        timezone: branch.timezone,
        currency: branch.currency,
      });
    } else {
      setEditingBranch(null);
      reset({ name: '', timezone: 'UTC', currency: 'USD' });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingBranch(null);
    reset();
  };

  const onSubmit = (values: BranchFormValues) => {
    saveMutation.mutate(values);
  };

  if (isLoading) return <LoadingState message="Loading branches..." />;
  if (error) return <ErrorState message={(error as Error).message} onRetry={() => refetch()} />;

  const branches = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Branches</h1>
          <p className="text-muted-foreground">Manage physical store locations.</p>
        </div>
        <Button onClick={() => handleOpenForm()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Branch
        </Button>
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Timezone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {branches.map((branch) => (
                <TableRow key={branch.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">{branch.name}</TableCell>
                  <TableCell>{branch.currency}</TableCell>
                  <TableCell>{branch.timezone}</TableCell>
                  <TableCell>
                    <Badge variant={!branch.isDeleted ? 'default' : 'secondary'}>
                      {!branch.isDeleted ? 'ACTIVE' : 'DELETED'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenForm(branch)}
                      disabled={deleteMutation.isPending || saveMutation.isPending}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteId(branch.id)}
                      disabled={deleteMutation.isPending || saveMutation.isPending}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {branches.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24">
                    <EmptyState
                      title="No branches found"
                      description="You haven't created any branches yet."
                      actionLabel="Add Branch"
                      onAction={() => handleOpenForm()}
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isFormOpen} onOpenChange={(open) => !open && handleCloseForm()}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>{editingBranch ? 'Edit Branch' : 'Add Branch'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Downtown Branch"
                  autoFocus
                  {...register('name')}
                  disabled={isSubmitting}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">
                  Currency <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="currency"
                  placeholder="e.g. USD"
                  {...register('currency')}
                  disabled={isSubmitting}
                />
                {errors.currency && (
                  <p className="text-xs text-destructive">{errors.currency.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">
                  Timezone <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="timezone"
                  placeholder="e.g. America/New_York"
                  {...register('timezone')}
                  disabled={isSubmitting}
                />
                {errors.timezone && (
                  <p className="text-xs text-destructive">{errors.timezone.message}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseForm}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Branch"
        description="Are you sure you want to delete this branch? This action cannot be undone."
        confirmText="Delete"
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
