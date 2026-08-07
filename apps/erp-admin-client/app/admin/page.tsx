'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui';
import { usePmixReport, useLaborToSalesReport } from '../../hooks/useAnalytics';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Loader2 } from 'lucide-react';

export default function AdminDashboard() {
  const { data: pmixData, isLoading: pmixLoading } = usePmixReport();
  const { data: laborData, isLoading: laborLoading } = useLaborToSalesReport();

  const parseChartData = (data: unknown[]) => {
    if (!data) return [];
    return (
      data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((d: any) => ({
          name: new Date(d.periodStart).toLocaleDateString(),
          ...d.metrics,
        }))
        .reverse()
    );
  };

  const pmixChartData = parseChartData(pmixData?.data || []);
  const laborChartData = parseChartData(laborData?.data || []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Analytics Dashboard
        </h1>
        <p className="text-muted-foreground text-gray-500">
          Welcome to the POS Administration Panel.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Product Mix (Sales Volume)</CardTitle>
          </CardHeader>
          <CardContent>
            {pmixLoading ? (
              <div className="h-72 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : pmixChartData.length === 0 ? (
              <div className="h-72 flex items-center justify-center text-gray-500">
                No data available
              </div>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pmixChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalQuantity" fill="#3b82f6" name="Quantity Sold" />
                    <Bar dataKey="totalRevenue" fill="#10b981" name="Revenue ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Labor to Sales Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            {laborLoading ? (
              <div className="h-72 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : laborChartData.length === 0 ? (
              <div className="h-72 flex items-center justify-center text-gray-500">
                No data available
              </div>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={laborChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="laborCost"
                      stroke="#f59e0b"
                      name="Labor Cost ($)"
                    />
                    <Line
                      type="monotone"
                      dataKey="grossSales"
                      stroke="#3b82f6"
                      name="Gross Sales ($)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
