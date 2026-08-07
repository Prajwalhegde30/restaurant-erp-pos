import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '../lib/apiClient';

export interface AnalyticsSearchParams {
  branchId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export const usePmixReport = (params: AnalyticsSearchParams = {}) => {
  return useQuery({
    queryKey: ['analytics-pmix', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.branchId) searchParams.set('branchId', params.branchId);
      if (params.startDate) searchParams.set('startDate', params.startDate);
      if (params.endDate) searchParams.set('endDate', params.endDate);
      if (params.limit) searchParams.set('limit', params.limit.toString());

      return fetchApi<{ data: unknown[]; has_more: boolean; next_cursor: string | undefined }>(
        `/reports/pmix?${searchParams.toString()}`,
      );
    },
  });
};

export const useLaborToSalesReport = (params: AnalyticsSearchParams = {}) => {
  return useQuery({
    queryKey: ['analytics-labor-to-sales', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.branchId) searchParams.set('branchId', params.branchId);
      if (params.startDate) searchParams.set('startDate', params.startDate);
      if (params.endDate) searchParams.set('endDate', params.endDate);
      if (params.limit) searchParams.set('limit', params.limit.toString());

      return fetchApi<{ data: unknown[]; has_more: boolean; next_cursor: string | undefined }>(
        `/reports/labor-to-sales?${searchParams.toString()}`,
      );
    },
  });
};
