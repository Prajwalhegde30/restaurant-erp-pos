import { Queue } from 'bullmq';
import { Redis } from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
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
