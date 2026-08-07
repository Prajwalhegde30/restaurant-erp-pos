import React from 'react';
import { useKdsStore } from '../../../store/useKdsStore';
import { TicketCard } from './TicketCard';
import { Badge } from '@repo/ui';
import { AlertCircle } from 'lucide-react';

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
      <div className="flex flex-col items-center justify-center h-full min-h-[50vh] text-slate-400">
        <UtensilsCrossed className="w-24 h-24 mb-4 opacity-20" />
        <h2 className="text-2xl font-semibold">Kitchen is caught up</h2>
        <p className="mt-2 text-lg">No active tickets right now.</p>
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

// Simple icon for empty state
function UtensilsCrossed(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
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
      <path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8" />
      <path d="M15 15 3.3 3.3a4.24 4.24 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7" />
      <path d="m14 14-7-7" />
      <path d="m8 16-6 6" />
      <path d="m2 16 6 6" />
    </svg>
  );
}
