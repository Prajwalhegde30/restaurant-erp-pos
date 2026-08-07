import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchApi } from '../lib/apiClient';

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  pointsBalance?: number;
  tier?: string;
}

export function useSearchCustomers(query: string) {
  return useQuery({
    queryKey: ['customers', 'search', query],
    queryFn: async () => {
      if (!query || query.length < 3) return [];
      const res = await fetchApi<{ data: Customer[] }>(`/customers?q=${encodeURIComponent(query)}`);
      return res.data;
    },
    enabled: query.length >= 3,
  });
}

export function useCustomerLoyalty(customerId: string | null) {
  return useQuery({
    queryKey: ['customers', customerId, 'loyalty'],
    queryFn: async () => {
      if (!customerId) return null;
      const res = await fetchApi<{
        data: { pointsBalance: number; tier: string; pointsToNextTier: number };
      }>(`/customers/${customerId}/loyalty/balance`);
      return res.data;
    },
    enabled: !!customerId,
  });
}

export function useApplyCoupon() {
  return useMutation({
    mutationFn: async (payload: { customerId: string; code: string; orderId: string }) => {
      const res = await fetchApi<{ data: unknown }>(
        `/customers/${payload.customerId}/coupon/apply`,
        {
          method: 'POST',
          body: JSON.stringify({ code: payload.code, orderId: payload.orderId }),
        },
      );
      return res.data;
    },
  });
}

export function useRedeemGiftCard() {
  return useMutation({
    mutationFn: async (payload: {
      customerId: string;
      code: string;
      orderId: string;
      amount: number;
    }) => {
      const res = await fetchApi<{ data: unknown }>(
        `/customers/${payload.customerId}/gift-card/redeem`,
        {
          method: 'POST',
          body: JSON.stringify({
            code: payload.code,
            orderId: payload.orderId,
            amount: payload.amount,
          }),
        },
      );
      return res.data;
    },
  });
}
