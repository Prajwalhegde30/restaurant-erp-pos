import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import { env } from '../../config/env';

const REDIS_URL = env.REDIS_URL;
export const connection = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
});

export const INVENTORY_DEPLETION_QUEUE_NAME = 'inventory-depletion';

export const inventoryDepletionQueue = new Queue(INVENTORY_DEPLETION_QUEUE_NAME, {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000, // 1s, 2s, 4s...
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});
