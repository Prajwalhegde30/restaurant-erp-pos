import Redis from 'ioredis';
import { logger } from '@repo/logger';
import { EventDispatcher } from './EventDispatcher';
import { SubscriptionManager } from './SubscriptionManager';
import { ChannelManager } from './ChannelManager';

export class RedisSubscriber {
  private client: Redis | null = null;
  private isShuttingDown = false;
  private dispatcher: EventDispatcher;

  constructor(
    private redisUrl: string,
    private subscriptionManager: SubscriptionManager,
  ) {
    this.dispatcher = new EventDispatcher(this.subscriptionManager);
  }

  public async connect(): Promise<void> {
    if (this.client) return;

    this.client = new Redis(this.redisUrl, {
      retryStrategy: (times) => {
        if (this.isShuttingDown) return null; // Stop retrying on shutdown
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.client.on('error', (err) => {
      logger.error({ error: err.message }, 'Redis Subscriber connection error');
    });

    this.client.on('ready', () => {
      logger.info('Redis Subscriber connected');
      this.resubscribeToActiveChannels();
    });

    this.client.on('message', (channel, message) => {
      // Background dispatch, do not block the event loop heavily
      this.dispatcher.dispatch(channel, message).catch((err) => {
        logger.error({ error: err }, 'Unhandled error in EventDispatcher');
      });
    });
  }

  /**
   * Resubscribe to channels upon reconnecting to Redis.
   */
  private resubscribeToActiveChannels(): void {
    if (!this.client) return;

    const channels = this.subscriptionManager.getActiveChannels();
    if (channels.length > 0) {
      this.client.subscribe(...channels).catch((err) => {
        logger.error({ error: err }, 'Failed to resubscribe to channels');
      });
    }
  }

  public async subscribe(tenantId: string, branchId?: string): Promise<void> {
    if (!this.client) {
      throw new Error('RedisSubscriber is not connected');
    }

    const channel = ChannelManager.getChannelName(tenantId, branchId);
    try {
      await this.client.subscribe(channel);
    } catch (error) {
      logger.error({ channel, error }, 'Failed to subscribe to channel');
      throw error;
    }
  }

  public async unsubscribe(tenantId: string, branchId?: string): Promise<void> {
    if (!this.client) return; // Might be disconnected already

    const channel = ChannelManager.getChannelName(tenantId, branchId);
    try {
      await this.client.unsubscribe(channel);
    } catch (error) {
      logger.error({ channel, error }, 'Failed to unsubscribe from channel');
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    this.isShuttingDown = true;
    if (this.client) {
      await this.client.quit();
      this.client = null;
      logger.info('Redis Subscriber disconnected');
    }
  }
}
