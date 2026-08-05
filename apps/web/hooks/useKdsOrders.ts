import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '../lib/apiClient';
import { KdsTicket } from '../store/useKdsStore';

interface GetOrdersResponse {
  data: KdsTicket[];
  has_more: boolean;
  next_cursor: string | null;
}

export function useKdsOrders(branchId: string | null) {
  return useQuery({
    queryKey: ['kdsOrders', branchId],
    queryFn: async () => {
      if (!branchId) return [];

      // Fetch active orders for KDS
      const response = await fetchApi<GetOrdersResponse>(`/orders?branchId=${branchId}&limit=100`);

      // Since the getAll endpoint might not return full details (items) by default,
      // or it returns all orders regardless of status, we filter on the client.
      // We only care about PLACED and IN_PREP orders for the KDS.
      const kdsActiveTickets = response.data.filter(
        (order) => order.status === 'PLACED' || order.status === 'IN_PREP',
      );

      // In a real implementation, if /orders doesn't return `orderItems`,
      // we would need a dedicated endpoint or Promise.all(/orders/:id).
      // Assuming the backend includes items or we rely on WS hydration.
      return kdsActiveTickets;
    },
    enabled: !!branchId,
    refetchInterval: 60000, // Fallback polling every minute just in case WS drops
  });
}
