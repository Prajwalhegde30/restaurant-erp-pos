'use client';

import { usePosStore } from '../../store/posStore';
import { Card, CardContent, Badge, cn } from '@repo/ui';
import { useActiveOrders, ActiveOrder } from '../../hooks/useOrders';

const MOCK_TABLES = [
  { id: 't1', name: 'Table 1', capacity: 4 },
  { id: 't2', name: 'Table 2', capacity: 4 },
  { id: 't3', name: 'Table 3', capacity: 2 },
  { id: 't4', name: 'Table 4', capacity: 6 },
  { id: 't5', name: 'Table 5', capacity: 2 },
  { id: 't6', name: 'Table 6', capacity: 8 },
];

export function TableMap({ branchId }: { branchId: string }) {
  const { activeTableId, setActiveTable } = usePosStore();
  const { data: activeOrdersResponse } = useActiveOrders(branchId);
  const activeOrders = activeOrdersResponse || [];

  return (
    <div className="p-4 grid grid-cols-3 gap-4">
      {MOCK_TABLES.map((table) => {
        // Find if this table has an active order
        const activeOrder = activeOrders.find((o: ActiveOrder) => o.tableId === table.id);
        const isOccupied = !!activeOrder;
        const isSelected = activeTableId === table.id;

        return (
          <Card
            key={table.id}
            className={cn(
              'cursor-pointer transition-all hover:ring-2 hover:ring-primary/50',
              isSelected ? 'ring-2 ring-primary border-primary' : '',
              isOccupied ? 'bg-amber-50 dark:bg-amber-950/20' : 'bg-card',
            )}
            onClick={() =>
              setActiveTable(
                table.id,
                activeOrder?.id,
                activeOrder?.version,
                activeOrder?.totalAmount,
              )
            }
          >
            <CardContent className="p-6 flex flex-col items-center justify-center min-h-[120px]">
              <h3 className="font-bold text-lg mb-2">{table.name}</h3>
              <div className="flex gap-2">
                <Badge variant="outline">{table.capacity} Seats</Badge>
                {isOccupied && (
                  <Badge variant="default" className="bg-amber-500">
                    Occupied
                  </Badge>
                )}
              </div>
              {isOccupied && activeOrder && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Order: #{activeOrder.orderNumber || activeOrder.id.substring(0, 6)}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
