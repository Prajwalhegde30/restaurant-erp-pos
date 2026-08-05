import { DomainEvent } from '../contracts/events';
import { logger } from '@repo/logger';

export class EventSerializer {
  /**
   * Serializes a DomainEvent into a JSON string suitable for Redis transmission.
   */
  static serialize<T>(event: DomainEvent<T>): string | null {
    try {
      return JSON.stringify(event);
    } catch (error) {
      logger.error({ eventId: event.eventId, error }, 'Failed to serialize Pub/Sub event');
      return null;
    }
  }
}
