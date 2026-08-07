'use client';

import { TableMap } from '../../components/pos/TableMap';
import { MenuCatalog } from '../../components/pos/MenuCatalog';
import { Cart } from '../../components/pos/Cart';
import { usePosStore } from '../../store/posStore';

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
      <div className="w-[350px] shrink-0 bg-white dark:bg-zinc-900 shadow-xl z-20">
        {activeTableId ? (
          <Cart branchId={MOCK_BRANCH_ID} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground bg-muted/20">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                <path d="M7 2v20" />
                <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
              </svg>
            </div>
            <p>No table selected.</p>
            <p className="text-sm mt-2">Select a table from the map to open the cart.</p>
          </div>
        )}
      </div>
    </div>
  );
}
