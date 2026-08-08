'use client';

import { TableMap } from '../../components/pos/TableMap';
import { MenuCatalog } from '../../components/pos/MenuCatalog';
import { Cart } from '../../components/pos/Cart';
import { usePosStore } from '../../store/posStore';
import { EmptyState } from '@repo/ui';
import { UtensilsCrossed } from 'lucide-react';

// In a real application, branchId would come from user session/context
const MOCK_BRANCH_ID = 'branch-uuid-1';

export default function PosPage() {
  const { activeTableId } = usePosStore();

  return (
    <div className="flex h-full w-full bg-slate-50 dark:bg-zinc-950">
      {/* Left pane: Table Map or Menu depending on selection */}
      <div className="flex-1 flex flex-col min-w-0 border-r">
        {activeTableId ? (
          <MenuCatalog branchId={MOCK_BRANCH_ID} />
        ) : (
          <div className="flex flex-col h-full overflow-y-auto">
            <div className="p-6 border-b bg-white dark:bg-zinc-900 sticky top-0 z-10">
              <h1 className="text-2xl font-bold tracking-tight">Select a Table</h1>
              <p className="text-muted-foreground mt-1">
                Tap a table to start a new order or view an existing one.
              </p>
            </div>
            <TableMap branchId={MOCK_BRANCH_ID} />
          </div>
        )}
      </div>

      {/* Right pane: Always Cart */}
      <div className="w-[350px] shrink-0 bg-white dark:bg-zinc-900 shadow-[0_0_40px_-15px_rgba(0,0,0,0.1)] z-20 flex flex-col h-full border-l border-zinc-200 dark:border-zinc-800">
        {activeTableId ? (
          <Cart branchId={MOCK_BRANCH_ID} />
        ) : (
          <div className="h-full flex flex-col p-4 bg-muted/10">
            <EmptyState
              icon={UtensilsCrossed}
              title="No table selected"
              description="Select a table from the map to open the cart and start taking orders."
            />
          </div>
        )}
      </div>
    </div>
  );
}
