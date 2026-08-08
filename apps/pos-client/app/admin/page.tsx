import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui';
import { Store, Users, Utensils, AlertCircle } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to the POS Administration Panel.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Static placeholders until Analytics phase */}
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
    </div>
  );
}
