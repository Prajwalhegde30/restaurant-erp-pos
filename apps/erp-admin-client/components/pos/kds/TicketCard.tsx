import React from 'react';
import { KdsTicket } from '../../../store/useKdsStore';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, Button, Badge } from '@repo/ui';
import { Clock, User, Utensils } from 'lucide-react';

interface TicketCardProps {
  ticket: KdsTicket;
  onBump?: (ticketId: string) => void;
}

export function TicketCard({ ticket, onBump }: TicketCardProps) {
  // Calculate waiting time
  const createdAt = new Date(ticket.createdAt).getTime();
  const now = Date.now();
  const waitingMinutes = Math.floor((now - createdAt) / 60000);

  // Determine priority color based on waiting time
  let headerColor = 'bg-slate-100 dark:bg-slate-800';
  if (waitingMinutes > 20) {
    headerColor = 'bg-red-100 dark:bg-red-900/30';
  } else if (waitingMinutes > 10) {
    headerColor = 'bg-yellow-100 dark:bg-yellow-900/30';
  }

  return (
    <Card className="flex flex-col h-full shadow-md border-2 border-slate-200 dark:border-slate-800 overflow-hidden">
      <CardHeader className={`pb-3 ${headerColor} transition-colors duration-300`}>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <span>#{ticket.id.substring(0, 5).toUpperCase()}</span>
              {ticket.orderType && (
                <Badge variant={ticket.orderType === 'DINE_IN' ? 'default' : 'secondary'}>
                  {ticket.orderType}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1">
                <Utensils className="w-4 h-4" />
                Table {ticket.diningTableId || 'N/A'}
              </span>
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                Waiter {ticket.userId ? ticket.userId.substring(0, 4) : 'Auto'}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-lg font-mono font-semibold">
              <Clock className="w-5 h-5" />
              {waitingMinutes}m
            </div>
            <div className="text-xs font-semibold mt-1">{ticket.status}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow pt-4">
        <ul className="space-y-3">
          {ticket.orderItems.map((item) => (
            <li
              key={item.id}
              className="border-b border-slate-100 dark:border-slate-800 pb-2 last:border-0"
            >
              <div className="flex justify-between items-start">
                <div className="font-semibold text-lg">
                  <span className="mr-2 text-primary">{item.quantity}x</span>
                  {item.menuItemName || 'Menu Item'}
                </div>
              </div>
              {item.notes && (
                <div className="text-sm text-red-500 font-medium mt-1">Note: {item.notes}</div>
              )}
              {item.orderItemModifierSelections && item.orderItemModifierSelections.length > 0 && (
                <ul className="pl-6 mt-1 space-y-1">
                  {item.orderItemModifierSelections.map((mod) => (
                    <li key={mod.id} className="text-sm text-slate-500 dark:text-slate-400">
                      + {mod.modifierOptionId.substring(0, 6)} {/* Ideally hydrated name */}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="pt-3 pb-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <Button
          className="w-full h-12 text-lg font-bold"
          size="lg"
          variant={ticket.status === 'PLACED' ? 'default' : 'secondary'}
          onClick={() => onBump && onBump(ticket.id)}
        >
          {ticket.status === 'PLACED' ? 'START PREP' : 'BUMP TO READY'}
        </Button>
      </CardFooter>
    </Card>
  );
}
