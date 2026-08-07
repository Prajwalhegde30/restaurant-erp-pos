import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '../lib/apiClient';

export interface ActiveOrder {
  id: string;
  orderNumber?: string;
  tableId?: string;
  status: string;
  version: number;
  totalAmount: number;
}

interface CreateOrderPayload {
  branchId: string;
  tableId: string;
  customerId?: string;
  orderType: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';
  items: {
    menuItemId: string;
    quantity: number;
    notes?: string;
  }[];
}

interface ProcessPaymentPayload {
  orderId: string;
  amount: number;
  paymentMethod: 'CASH' | 'CARD' | 'UPI' | 'OTHER';
  currentVersion: number;
}

export function useActiveOrders(branchId: string) {
  return useQuery({
    queryKey: ['orders', branchId, 'active'],
    queryFn: async () => {
      // Assuming a generic GET /orders endpoint returning active orders for a branch
      const res = await fetchApi<{ data: ActiveOrder[] }>(
        `/orders?branchId=${branchId}&status=DRAFT,PLACED,PREPARING,READY,SERVED`,
      );
      return res.data;
    },
    enabled: !!branchId,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateOrderPayload) => {
      const res = await fetchApi<{ data: unknown }>('/orders', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders', variables.branchId] });
    },
  });
}

export function useProcessPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ProcessPaymentPayload) => {
      const res = await fetchApi<{ data: unknown }>('/payments', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
