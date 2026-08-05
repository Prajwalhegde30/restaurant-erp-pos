import { SubscriptionManager } from './SubscriptionManager';
import { EventDeserializer } from '../serialization/EventDeserializer';
import { logger } from '@repo/logger';

export class EventDispatcher {
  constructor(private subscriptionManager: SubscriptionManager) {}

  /**
   * Safely dispatches raw string payloads from Redis to registered typed callbacks.
   */
  public async dispatch(channel: string, message: string): Promise<void> {
    const event = EventDeserializer.deserialize(message);

    if (!event) {
      // Deserialization failed or event was malformed. Logging is handled inside deserializer.
      return;
    }

    const callbacks = this.subscriptionManager.getCallbacks(channel);

    if (callbacks.length === 0) {
      // Possible race condition if subscribed but no callbacks exist, or gracefully ignored.
      return;
    }

    // Execute all callbacks, isolating errors so one failing callback doesn't crash others.
    for (const callback of callbacks) {
      try {
        await callback(event);
      } catch (error) {
        logger.error(
          {
            channel,
            eventId: event.eventId,
            eventType: event.eventType,
            error,
          },
          'Error executing Pub/Sub event callback',
        );
      }
    }
  }
}
