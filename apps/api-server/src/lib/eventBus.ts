import { EventBus } from '@repo/pubsub';
import { logger } from '@repo/logger';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
export const eventBus = new EventBus(redisUrl);

export async function initEventBus() {
  try {
    await eventBus.connect();
    logger.info('EventBus initialized in API');
  } catch (error) {
    logger.error({ error }, 'Failed to initialize EventBus in API');
    throw error;
  }
}

export async function closeEventBus() {
  await eventBus.disconnect();
}
