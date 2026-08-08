'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Skeleton, EmptyState } from '@repo/ui';
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
import { BarChart3, TrendingUp, Store, Users, Utensils, AlertCircle } from 'lucide-react';

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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Static placeholders for demo */}
        <Card className="shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Branches
            </CardTitle>
            <Store className="h-4 w-4 text-muted-foreground opacity-70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground mt-1">+1 from last month</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Staff
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground opacity-70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-emerald-500 font-medium mt-1">+3 new hires</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Menu Items</CardTitle>
            <Utensils className="h-4 w-4 text-muted-foreground opacity-70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground mt-1">Across 8 categories</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm transition-shadow hover:shadow-md border-amber-200 dark:border-amber-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-600 dark:text-amber-500">
              Pending Approvals
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500 opacity-70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-500">2</div>
            <p className="text-xs text-amber-600/80 dark:text-amber-500/80 mt-1">
              Requires attention
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Product Mix (Sales Volume)</CardTitle>
          </CardHeader>
          <CardContent>
            {pmixLoading ? (
              <div className="h-72 w-full flex flex-col gap-2">
                <Skeleton className="h-full w-full" />
              </div>
            ) : pmixChartData.length === 0 ? (
              <div className="h-72 flex items-center justify-center">
                <EmptyState
                  icon={BarChart3}
                  title="No PMIX Data"
                  description="No sales data recorded for the selected period."
                />
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
              <div className="h-72 w-full flex flex-col gap-2">
                <Skeleton className="h-full w-full" />
              </div>
            ) : laborChartData.length === 0 ? (
              <div className="h-72 flex items-center justify-center">
                <EmptyState
                  icon={TrendingUp}
                  title="No Labor Data"
                  description="No labor or sales correlation recorded for this period."
                />
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
