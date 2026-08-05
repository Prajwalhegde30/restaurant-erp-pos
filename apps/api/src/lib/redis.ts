import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = new Redis(redisUrl, {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
});

// Optionally log connection issues
redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});
