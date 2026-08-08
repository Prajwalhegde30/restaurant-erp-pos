'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { RoleWithRelations } from '@repo/types';
import { LoadingState } from '../../../components/ui/loading-state';
import { ErrorState } from '../../../components/ui/error-state';
import { EmptyState } from '../../../components/ui/empty-state';
import { ConfirmDialog } from '../../../components/ui/confirm-dialog';

const RoleFormSchema = z.object({
  name: z.string().min(1, 'Role name is required'),
  description: z.string().optional(),
});
type RoleFormValues = z.infer<typeof RoleFormSchema>;

export default function RolesPage() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleWithRelations | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useQuery<{ data: RoleWithRelations[] }>({
    queryKey: ['roles'],
    queryFn: () => fetchApi('/roles'),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(RoleFormSchema),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetchApi(`/roles/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setDeleteId(null);
    },
  });

  const saveMutation = useMutation({
    mutationFn: (values: RoleFormValues) => {
      if (editingRole) {
        return fetchApi(`/roles/${editingRole.id}`, {
          method: 'PUT',
          body: JSON.stringify(values),
        });
      } else {
        return fetchApi('/roles', {
          method: 'POST',
          body: JSON.stringify(values),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      handleCloseForm();
    },
  });

  const handleOpenForm = (role?: RoleWithRelations) => {
    if (role) {
      setEditingRole(role);
      reset({
        name: role.name,
        description: '', // Could be role.description if it existed in the type, but let's just clear it
      });
    } else {
      setEditingRole(null);
      reset({ name: '', description: '' });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingRole(null);
    reset();
  };

  const onSubmit = (values: RoleFormValues) => {
    saveMutation.mutate(values);
  };

  if (isLoading) return <LoadingState message="Loading roles..." />;
  if (error) return <ErrorState message={(error as Error).message} onRetry={() => refetch()} />;

  const rolesList = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
          <p className="text-muted-foreground">Manage RBAC roles across the tenant.</p>
        </div>
        <Button onClick={() => handleOpenForm()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Role
        </Button>
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Role Name</TableHead>
                <TableHead>Permissions Count</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rolesList.map((role) => (
                <TableRow key={role.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{role.permissions?.length || 0}</Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenForm(role)}
                      disabled={deleteMutation.isPending || saveMutation.isPending}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteId(role.id)}
                      disabled={deleteMutation.isPending || saveMutation.isPending}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {rolesList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="h-24">
                    <EmptyState
                      title="No roles found"
                      description="You haven't created any roles yet."
                      actionLabel="Add Role"
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
              <DialogTitle>{editingRole ? 'Edit Role' : 'Add Role'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Role Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Manager"
                  autoFocus
                  {...register('name')}
                  disabled={isSubmitting}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="e.g. Full system access"
                  {...register('description')}
                  disabled={isSubmitting}
                />
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
        title="Delete Role"
        description="Are you sure you want to delete this role? Users assigned to this role may lose access."
        confirmText="Delete"
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
