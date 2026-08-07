export interface ServerToClientEvents {
  KitchenTicketCreated: (ticket: unknown) => void;
  OrderStatusUpdated: (payload: { orderId: string; status: string }) => void;
  OrderModified: (ticket: unknown) => void;
  pong: () => void;
}

export interface ClientToServerEvents {
  ping: () => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId: string;
  tenantId: string;
  roleId: string;
  branchId?: string | null;
}
