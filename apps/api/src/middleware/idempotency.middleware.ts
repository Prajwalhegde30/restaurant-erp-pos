import { Request, Response, NextFunction } from 'express';
import { redis } from '../lib/redis';
import { logger } from '@repo/logger';

const HTTP_METHODS_TO_CACHE = ['POST', 'PUT', 'PATCH', 'DELETE'];
const IN_PROGRESS_TTL = 60; // 60 seconds to process a request
const COMPLETED_TTL = 86400; // 24 hours

export const idempotencyMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  if (!HTTP_METHODS_TO_CACHE.includes(req.method)) {
    return next();
  }

  const idempotencyKey = req.header('Idempotency-Key');
  if (!idempotencyKey) {
    return res.status(400).json({
      error: {
        code: 'MISSING_IDEMPOTENCY_KEY',
        message: 'Idempotency-Key header is required for state-mutating requests.',
      },
    });
  }

  // Tenant context is injected by auth middleware, which now runs before this middleware.
  interface AuthRequest extends Request {
    tenantId?: string;
    user?: { tenantId?: string };
  }
  const authReq = req as AuthRequest;
  const tenantId = authReq.tenantId || authReq.user?.tenantId;

  if (!tenantId) {
    return res.status(500).json({
      error: {
        code: 'MISSING_TENANT_CONTEXT',
        message: 'Tenant context is required for idempotency.',
      },
    });
  }

  // Normalize path by stripping trailing slashes to avoid false misses
  const normalizedPath = req.originalUrl.split('?')[0].replace(/\/$/, '') || '/';

  // Redis Key Design: tenantId:method:path:idempotencyKey
  const cacheKey = `idempotency:${tenantId}:${req.method}:${normalizedPath}:${idempotencyKey}`;

  try {
    const cachedEntry = await redis.get(cacheKey);

    if (cachedEntry) {
      const parsed = JSON.parse(cachedEntry);
      if (parsed.status === 'in_progress') {
        logger.warn(`Concurrent request blocked for key: ${idempotencyKey}`);
        return res.status(409).json({
          error: {
            code: 'CONCURRENT_REQUEST',
            message: 'A request with this Idempotency-Key is currently being processed.',
          },
        });
      }

      if (parsed.status === 'completed') {
        logger.info(`Returning cached response for idempotency key: ${idempotencyKey}`);

        // Replay headers
        if (parsed.headers) {
          for (const [key, value] of Object.entries(parsed.headers)) {
            // Avoid setting restricted pseudo-headers if any leaked
            if (value !== undefined && value !== null) {
              res.setHeader(key, value as string | number | readonly string[]);
            }
          }
        }

        return res.status(parsed.statusCode).send(parsed.body);
      }
    }

    // Set as in_progress
    await redis.set(cacheKey, JSON.stringify({ status: 'in_progress' }), 'EX', IN_PROGRESS_TTL);

    // Monkey-patch res.send to capture the response
    const originalSend = res.send;

    res.send = function (body) {
      const statusCode = res.statusCode;

      // We only cache successful or client-error responses. Server errors (5xx) are deleted to allow retries.
      if (statusCode >= 500) {
        redis
          .del(cacheKey)
          .catch((err) => logger.error(`Failed to delete idempotency key on 5xx: ${err.message}`));
      } else {
        const cachePayload = {
          status: 'completed',
          statusCode,
          headers: res.getHeaders(),
          body: body, // body is usually a string/Buffer here
        };
        redis.set(cacheKey, JSON.stringify(cachePayload), 'EX', COMPLETED_TTL).catch((err) => {
          logger.error(`Failed to cache idempotency response: ${err.message}`);
        });
      }

      return originalSend.call(this, body);
    };

    next();
  } catch (error) {
    logger.error('Idempotency middleware error:', error);
    // On Redis failure, fail-closed for safety.
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Could not verify idempotency key due to internal cache error.',
      },
    });
  }
};
