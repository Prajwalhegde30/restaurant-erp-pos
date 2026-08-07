import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchApi } from '../lib/apiClient';

export interface AuditLogSearchParams {
  branchId?: string;
  userId?: string;
  action?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export const useAuditLogs = (params: AuditLogSearchParams = {}) => {
  return useInfiniteQuery({
    queryKey: ['audit-logs', params],
    queryFn: async ({ pageParam = undefined }) => {
      const searchParams = new URLSearchParams();
      if (pageParam) searchParams.set('cursor', pageParam as string);
      if (params.branchId) searchParams.set('branchId', params.branchId);
      if (params.userId) searchParams.set('userId', params.userId);
      if (params.action) searchParams.set('action', params.action);
      if (params.search) searchParams.set('search', params.search);
      if (params.startDate) searchParams.set('startDate', params.startDate);
      if (params.endDate) searchParams.set('endDate', params.endDate);
      if (params.limit) searchParams.set('limit', params.limit.toString());

      return fetchApi<{ data: unknown[]; has_more: boolean; next_cursor: string | undefined }>(
        `/audit-logs?${searchParams.toString()}`,
      );
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.has_more ? lastPage.next_cursor : undefined),
  });
};
