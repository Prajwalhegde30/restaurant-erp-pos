import { create } from 'zustand';
import { Order, OrderItem, OrderItemModifierSelection } from '@repo/types';

export type OrderStatus =
  'DRAFT' | 'PLACED' | 'IN_PREP' | 'READY' | 'SERVED' | 'PAID' | 'CLOSED' | 'VOIDED' | 'CANCELLED';

export type TicketItem = OrderItem & {
  orderItemModifierSelections?: OrderItemModifierSelection[];
  menuItemName?: string; // Hydrated from frontend catalog if necessary, or just rely on WS payload
};

export type KdsTicket = Order & {
  orderItems: TicketItem[];
};

interface KdsState {
  tickets: KdsTicket[];
  setTickets: (tickets: KdsTicket[]) => void;
  addOrUpdateTicket: (ticket: KdsTicket) => void;
  removeTicket: (ticketId: string) => void;
  updateTicketStatus: (ticketId: string, status: OrderStatus) => void;
}

export const useKdsStore = create<KdsState>((set) => ({
  tickets: [],
  setTickets: (tickets) => set({ tickets }),
  addOrUpdateTicket: (ticket) =>
    set((state) => {
      const existingIndex = state.tickets.findIndex((t) => t.id === ticket.id);
      if (existingIndex >= 0) {
        const newTickets = [...state.tickets];
        newTickets[existingIndex] = ticket;
        return { tickets: newTickets };
      }
      return { tickets: [...state.tickets, ticket] };
    }),
  removeTicket: (ticketId) =>
    set((state) => ({
      tickets: state.tickets.filter((t) => t.id !== ticketId),
    })),
  updateTicketStatus: (ticketId, status) =>
    set((state) => ({
      tickets: state.tickets.map((t) => (t.id === ticketId ? { ...t, status } : t)),
    })),
}));
