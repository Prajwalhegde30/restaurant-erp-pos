import Redis from 'ioredis';
import { env } from '../config/env';

const redisUrl = env.REDIS_URL;

export const redis = new Redis(redisUrl, {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
});

// Optionally log connection issues
redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});
