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
import { Menu } from '@repo/types';
import { LoadingState } from '../../../components/ui/loading-state';
import { ErrorState } from '../../../components/ui/error-state';
import { EmptyState } from '../../../components/ui/empty-state';
import { ConfirmDialog } from '../../../components/ui/confirm-dialog';

const MenuFormSchema = z.object({
  name: z.string().min(1, 'Menu name is required'),
  description: z.string().optional(),
});
type MenuFormValues = z.infer<typeof MenuFormSchema>;

export default function CatalogPage() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useQuery<{ data: Menu[] }>({
    queryKey: ['menus'],
    queryFn: () => fetchApi('/menus'),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MenuFormValues>({
    resolver: zodResolver(MenuFormSchema),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetchApi(`/menus/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      setDeleteId(null);
    },
  });

  const saveMutation = useMutation({
    mutationFn: (values: MenuFormValues) => {
      if (editingMenu) {
        return fetchApi(`/menus/${editingMenu.id}`, {
          method: 'PUT',
          body: JSON.stringify(values),
        });
      } else {
        return fetchApi('/menus', {
          method: 'POST',
          body: JSON.stringify(values),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      handleCloseForm();
    },
  });

  const handleOpenForm = (menu?: Menu) => {
    if (menu) {
      setEditingMenu(menu);
      reset({
        name: menu.name,
        description: menu.description || '',
      });
    } else {
      setEditingMenu(null);
      reset({ name: '', description: '' });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingMenu(null);
    reset();
  };

  const onSubmit = (values: MenuFormValues) => {
    saveMutation.mutate(values);
  };

  if (isLoading) return <LoadingState message="Loading menus..." />;
  if (error) return <ErrorState message={(error as Error).message} onRetry={() => refetch()} />;

  const menusList = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catalog</h1>
          <p className="text-muted-foreground">Manage your menus, categories, and items.</p>
        </div>
        <div className="space-x-2">
          <Button onClick={() => handleOpenForm()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Menu
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Menu Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {menusList.map((menu) => (
                <TableRow key={menu.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">{menu.name}</TableCell>
                  <TableCell>{menu.description || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={menu.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {menu.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenForm(menu)}
                      disabled={deleteMutation.isPending || saveMutation.isPending}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteId(menu.id)}
                      disabled={deleteMutation.isPending || saveMutation.isPending}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {menusList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-24">
                    <EmptyState
                      title="No menus found"
                      description="You haven't created any menus yet."
                      actionLabel="Add Menu"
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
              <DialogTitle>{editingMenu ? 'Edit Menu' : 'Add Menu'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Menu Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Summer Menu"
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
                  placeholder="e.g. Seasonal dishes and drinks"
                  {...register('description')}
                  disabled={isSubmitting}
                />
                {errors.description && (
                  <p className="text-xs text-destructive">{errors.description.message}</p>
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
        title="Delete Menu"
        description="Are you sure you want to delete this menu? This will also remove associated categories and items."
        confirmText="Delete"
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
