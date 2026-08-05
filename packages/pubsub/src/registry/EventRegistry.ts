/**
 * Strict registry of valid Pub/Sub event types.
 * Based on Architecture.md section 6.2 (Enterprise Event Catalog).
 */
export enum EventTypes {
  OrderCreated = 'OrderCreated',
  OrderModified = 'OrderModified',
  OrderCancelled = 'OrderCancelled',
  KitchenTicketCreated = 'KitchenTicketCreated',
  KitchenAccepted = 'KitchenAccepted',
  KitchenRejected = 'KitchenRejected',
  KitchenTicketBumped = 'KitchenTicketBumped',
  MenuUpdated = 'MenuUpdated',
  // Further events can be added as per PRD
}

/**
 * Validates if a string is a registered event type.
 */
export const isValidEventType = (type: string): boolean => {
  return Object.values(EventTypes).includes(type as EventTypes);
};
