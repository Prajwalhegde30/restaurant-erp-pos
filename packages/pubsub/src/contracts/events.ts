/**
 * Represents the base structure of all Pub/Sub events in the system.
 * Follows strict Domain-Driven Design and Enterprise Event Catalog rules.
 */
export interface DomainEvent<T = unknown> {
  /** Unique ID for the event, used for idempotency (Event ID deduplication) */
  eventId: string;

  /** The type of event being published (e.g., 'OrderCreated', 'OrderModified') */
  eventType: string;

  /** ISO 8601 timestamp of when the event occurred */
  timestamp: string;

  /** The multi-tenant partition key */
  tenantId: string;

  /** The branch partition key (if applicable) */
  branchId?: string;

  /** The structured payload of the event */
  payload: T;
}

export type EventCallback<T = unknown> = (event: DomainEvent<T>) => Promise<void> | void;

export interface OrderStatusUpdatedPayload {
  orderId: string;
  status: string;
}

export interface KitchenTicketCreatedPayload {
  id: string;
  orderNumber: string;
  status: string;
  type: string;
  table: string;
  waiter: string;
  time: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    modifiers: string[];
    notes?: string;
  }>;
}
