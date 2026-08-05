import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '../lib/apiClient';

interface Category {
  id: string;
  name: string;
  description?: string | null;
}

interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description?: string | null;
  basePrice: number;
  isAvailable: boolean;
  image?: string | null;
}

export function useCategories(branchId: string) {
  return useQuery({
    queryKey: ['categories', branchId],
    queryFn: async () => {
      const res = await fetchApi<{ data: Category[] }>(`/categories?branchId=${branchId}`);
      return res.data;
    },
    enabled: !!branchId,
  });
}

export function useMenuItems(categoryId: string | null) {
  return useQuery({
    queryKey: ['menu-items', categoryId],
    queryFn: async () => {
      const res = await fetchApi<{ data: MenuItem[] }>(`/menu-items?categoryId=${categoryId}`);
      return res.data;
    },
    enabled: !!categoryId,
  });
}
