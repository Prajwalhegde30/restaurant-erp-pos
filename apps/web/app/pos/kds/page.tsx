'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { TicketBoard } from '../../../components/pos/kds/TicketBoard';
import { useKdsStore } from '../../../store/useKdsStore';
import { useKdsOrders } from '../../../hooks/useKdsOrders';
import { useKdsWebSocket } from '../../../hooks/useKdsWebSocket';

function KdsContent() {
  const searchParams = useSearchParams();
  const branchId = searchParams.get('branchId') || 'b1'; // Defaults for local testing
  const [mounted, setMounted] = useState(false);

  const { setTickets, updateTicketStatus } = useKdsStore();

  // 1. Hydrate initial state via REST
  const { data: initialTickets, isLoading, isError } = useKdsOrders(branchId);

  // 2. Connect to WebSockets for real-time updates
  const { isConnected, error: wsError } = useKdsWebSocket(branchId);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hydrate store when REST API returns data
  useEffect(() => {
    if (initialTickets) {
      setTickets(initialTickets);
    }
  }, [initialTickets, setTickets]);

  const handleBumpTicket = (ticketId: string) => {
    // Phase 6.4: This will also emit an API call to the backend
    // For now in 6.3, we just optimistically update the local state to demonstrate the UI
    const store = useKdsStore.getState();
    const ticket = store.tickets.find((t) => t.id === ticketId);
    if (ticket) {
      if (ticket.status === 'PLACED') {
        updateTicketStatus(ticketId, 'IN_PREP');
      } else if (ticket.status === 'IN_PREP') {
        updateTicketStatus(ticketId, 'READY'); // This removes it from the KDS board
      }
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col h-screen bg-slate-100 dark:bg-slate-950">
      {/* KDS Header */}
      <header className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-black tracking-tight">KITCHEN DISPLAY</h1>
          <div className="px-3 py-1 bg-slate-800 rounded-md text-sm font-medium border border-slate-700">
            Branch: {branchId}
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm font-medium">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              {isConnected ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              )}
            </span>
            <span className={isConnected ? 'text-emerald-400' : 'text-red-400'}>
              {isConnected ? 'LIVE SYNC' : 'OFFLINE'}
            </span>
          </div>
          <div className="text-slate-400 border-l border-slate-700 pl-4">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </header>

      {/* Main Board Area */}
      <main className="flex-1 overflow-hidden p-4 md:p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-xl font-medium text-slate-500 animate-pulse">
            Loading active tickets...
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center h-full text-xl font-medium text-red-500">
            Failed to load initial tickets. Check network connection.
          </div>
        ) : (
          <TicketBoard onBumpTicket={handleBumpTicket} />
        )}
      </main>

      {/* Optional WebSocket error banner */}
      {wsError && (
        <div className="bg-red-500 text-white text-sm py-1 px-4 text-center">
          Connection Error: {wsError}
        </div>
      )}
    </div>
  );
}

export default function KdsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen text-xl font-semibold text-slate-500">
          Loading KDS...
        </div>
      }
    >
      <KdsContent />
    </Suspense>
  );
}
