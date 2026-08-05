import { Request, Response, NextFunction } from 'express';
import { createLoggerWithContext } from '@repo/logger';
import { v4 as uuidv4 } from 'uuid';

export interface AuthenticatedRequest extends Request {
  user?: { tenantId?: string; id?: string; [key: string]: unknown };
  logger?: ReturnType<typeof createLoggerWithContext>;
}

export function loggerMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const correlationId = (req.headers['x-correlation-id'] as string) || uuidv4();

  // Create a logger instance for this request
  const reqLogger = createLoggerWithContext({
    correlation_id: correlationId,
  });

  req.logger = reqLogger;

  // Optionally attach the correlation ID to the response header
  res.setHeader('X-Correlation-ID', correlationId);

  next();
}
