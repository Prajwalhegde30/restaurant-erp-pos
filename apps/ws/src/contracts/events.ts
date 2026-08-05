export interface ServerToClientEvents {
  new_ticket: (ticket: unknown) => void;
  ticket_bumped: (data: { ticketId: string; status: string }) => void;
  pong: () => void;
}

export interface ClientToServerEvents {
  ping: () => void;
  bump_ticket: (data: { ticketId: string }) => void;
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
