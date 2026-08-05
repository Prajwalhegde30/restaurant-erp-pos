import { DomainEvent, EventCallback } from './contracts/events';
import { RedisPublisher } from './core/RedisPublisher';
import { RedisSubscriber } from './core/RedisSubscriber';
import { SubscriptionManager } from './core/SubscriptionManager';
import { ChannelManager } from './core/ChannelManager';
import { logger } from '@repo/logger';

export class EventBus {
  private publisher: RedisPublisher;
  private subscriber: RedisSubscriber;
  private subscriptionManager: SubscriptionManager;

  constructor(redisUrl: string) {
    this.subscriptionManager = new SubscriptionManager();
    this.publisher = new RedisPublisher(redisUrl);
    this.subscriber = new RedisSubscriber(redisUrl, this.subscriptionManager);
  }

  /**
   * Initializes connections to Redis for both publishing and subscribing.
   */
  public async connect(): Promise<void> {
    try {
      await Promise.all([this.publisher.connect(), this.subscriber.connect()]);
      logger.info('EventBus connected successfully');
    } catch (error) {
      logger.error({ error }, 'Failed to connect EventBus');
      throw error;
    }
  }

  /**
   * Gracefully shuts down the EventBus, terminating Redis connections.
   */
  public async disconnect(): Promise<void> {
    try {
      await Promise.all([this.publisher.disconnect(), this.subscriber.disconnect()]);
      logger.info('EventBus disconnected successfully');
    } catch (error) {
      logger.error({ error }, 'Failed to disconnect EventBus');
    }
  }

  /**
   * Publishes a structured DomainEvent to the appropriate channel based on its tenant and branch ID.
   */
  public async publish<T>(event: DomainEvent<T>): Promise<void> {
    await this.publisher.publish(event);
  }

  /**
   * Subscribes a callback to a specific tenant (and optionally branch) channel.
   * Multiple callbacks can be registered to the same logical subscription.
   */
  public async subscribe(
    tenantId: string,
    branchId: string | undefined,
    callback: EventCallback,
  ): Promise<void> {
    const channel = ChannelManager.getChannelName(tenantId, branchId);

    // Add callback locally first
    this.subscriptionManager.addSubscription(channel, callback);

    // Then subscribe via Redis
    await this.subscriber.subscribe(tenantId, branchId);
  }

  /**
   * Unsubscribes a specific callback from a channel.
   * If it's the last callback for that channel, unsubscribes from Redis.
   */
  public async unsubscribe(
    tenantId: string,
    branchId: string | undefined,
    callback: EventCallback,
  ): Promise<void> {
    const channel = ChannelManager.getChannelName(tenantId, branchId);

    this.subscriptionManager.removeSubscription(channel, callback);

    const remainingCallbacks = this.subscriptionManager.getCallbacks(channel);
    if (remainingCallbacks.length === 0) {
      await this.subscriber.unsubscribe(tenantId, branchId);
    }
  }
}
