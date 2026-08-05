import Redis from 'ioredis';
import { logger } from '@repo/logger';
import { DomainEvent } from '../contracts/events';
import { EventSerializer } from '../serialization/EventSerializer';
import { ChannelManager } from './ChannelManager';

export class RedisPublisher {
  private client: Redis | null = null;
  private isShuttingDown = false;

  constructor(private redisUrl: string) {}

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
      logger.error({ error: err.message }, 'Redis Publisher connection error');
    });

    this.client.on('ready', () => {
      logger.info('Redis Publisher connected');
    });
  }

  public async publish<T>(event: DomainEvent<T>): Promise<void> {
    if (!this.client) {
      throw new Error('RedisPublisher is not connected');
    }

    const payload = EventSerializer.serialize(event);
    if (!payload) {
      return; // Error already logged by serializer
    }

    const channel = ChannelManager.getChannelName(event.tenantId, event.branchId);

    try {
      await this.client.publish(channel, payload);
    } catch (error) {
      logger.error({ channel, eventId: event.eventId, error }, 'Failed to publish event to Redis');
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    this.isShuttingDown = true;
    if (this.client) {
      await this.client.quit();
      this.client = null;
      logger.info('Redis Publisher disconnected');
    }
  }
}
