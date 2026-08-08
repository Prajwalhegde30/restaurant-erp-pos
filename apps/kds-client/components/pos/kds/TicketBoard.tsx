import React from 'react';
import { useKdsStore } from '../../../store/useKdsStore';
import { TicketCard } from './TicketCard';
import { Badge, EmptyState } from '@repo/ui';
import { AlertCircle, UtensilsCrossed } from 'lucide-react';

interface TicketBoardProps {
  onBumpTicket?: (ticketId: string) => void;
}

export function TicketBoard({ onBumpTicket }: TicketBoardProps) {
  const { tickets } = useKdsStore();

  // Sort tickets by creation time (oldest first)
  const sortedTickets = [...tickets].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  const placedTickets = sortedTickets.filter((t) => t.status === 'PLACED');
  const inPrepTickets = sortedTickets.filter((t) => t.status === 'IN_PREP');

  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[50vh] p-8 w-full">
        <div className="max-w-md w-full">
          <EmptyState
            icon={UtensilsCrossed}
            title="Kitchen is caught up"
            description="No active tickets right now."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full overflow-hidden">
      {/* PLACED Tickets Column */}
      <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900/50 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="p-4 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-xl font-bold flex items-center gap-2">
            Incoming
            <Badge variant="secondary" className="text-sm px-2 py-0.5">
              {placedTickets.length}
            </Badge>
          </h2>
          {placedTickets.length > 5 && (
            <span className="text-red-500 flex items-center gap-1 text-sm font-medium animate-pulse">
              <AlertCircle className="w-4 h-4" /> High Volume
            </span>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-max">
            {placedTickets.map((ticket) => (
              <div key={ticket.id}>
                <TicketCard ticket={ticket} onBump={onBumpTicket} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* IN PREP Tickets Column */}
      <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900/50 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-900/50 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-xl font-bold flex items-center gap-2 text-blue-800 dark:text-blue-300">
            In Preparation
            <Badge className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-2 py-0.5">
              {inPrepTickets.length}
            </Badge>
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-max">
            {inPrepTickets.map((ticket) => (
              <div key={ticket.id}>
                <TicketCard ticket={ticket} onBump={onBumpTicket} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
