import { DomainEvent } from '../contracts/events';
import { logger } from '@repo/logger';
import { isValidEventType } from '../registry/EventRegistry';

export class EventDeserializer {
  /**
   * Safely deserializes a Redis JSON string into a DomainEvent.
   * Catches parsing errors and validates the base structure.
   */
  static deserialize<T>(payloadString: string): DomainEvent<T> | null {
    try {
      const parsed = JSON.parse(payloadString) as Partial<DomainEvent<T>>;

      if (!parsed.eventId || !parsed.eventType || !parsed.tenantId || !parsed.payload) {
        logger.warn({ parsed }, 'Pub/Sub event missing required DomainEvent fields');
        return null;
      }

      if (!isValidEventType(parsed.eventType)) {
        logger.warn({ eventType: parsed.eventType }, 'Received unregistered Pub/Sub event type');
      }

      return parsed as DomainEvent<T>;
    } catch (error) {
      logger.error(
        { error, payloadSnippet: payloadString.substring(0, 100) },
        'Failed to deserialize Pub/Sub event',
      );
      return null;
    }
  }
}
