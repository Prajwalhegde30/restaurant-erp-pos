import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './logger.middleware';
import { ZodError } from 'zod';

export function errorHandler(
  err: unknown,
  req: AuthenticatedRequest,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) {
  const correlationId = (req.headers['x-correlation-id'] as string) || 'unknown';

  // Log the error
  if (req.logger) {
    req.logger.error(
      { err, correlation_id: correlationId },
      (err as Error).message || 'Unhandled exception',
    );
  } else {
    console.error(`[${correlationId}]`, err);
  }

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        type: 'validation_error',
        code: 'invalid_parameter',
        message: 'Request payload validation failed.',
        details: err.errors.map((e) => ({
          field: e.path.join('.'),
          issue: e.message,
        })),
        correlation_id: correlationId,
        doc_url: 'https://docs.api.example.com/errors/invalid_parameter',
      },
    });
  }

  // Handle Auth Errors from @repo/auth
  const errorName = err instanceof Error ? err.name : '';
  const errorMessage = err instanceof Error ? err.message : 'Unknown error';

  if (
    errorName === 'MissingAuthHeaderError' ||
    errorName === 'InvalidAuthHeaderFormatError' ||
    errorName === 'TokenInvalidError' ||
    errorName === 'TokenExpiredError'
  ) {
    return res.status(401).json({
      error: {
        type: 'authentication_error',
        code: 'unauthorized',
        message: errorMessage || 'Authentication failed.',
        correlation_id: correlationId,
      },
    });
  }

  if (
    errorName === 'AuthorizationError' ||
    errorName === 'PermissionDeniedError' ||
    errorName === 'CrossTenantViolationError'
  ) {
    return res.status(403).json({
      error: {
        type: 'authorization_error',
        code: 'forbidden',
        message: err.message || 'You do not have permission to access this resource.',
        correlation_id: correlationId,
      },
    });
  }

  // Fallback 500 error
  return res.status(500).json({
    error: {
      type: 'server_error',
      code: 'internal_server_error',
      message: 'An unexpected error occurred.',
      correlation_id: correlationId,
    },
  });
}
