/**
 * API Authentication Middleware Error Classes
 *
 * Typed errors for HTTP authentication and request context bootstrapping.
 *
 * Authority References:
 * - RBAC.md §4 — Authentication vs. Authorization:
 *     "Authentication failure mode: 401 Unauthorized"
 * - CodingStandards.md §19 — Error Handling Standards:
 *     "Throw typed custom errors (e.g., ValidationError, AuthorizationError, NotFoundError)."
 *
 * These errors map to HTTP status code 401 Unauthorized.
 */

import { AuthError } from './errors.js';

/**
 * Base class for all 401 Unauthorized authentication errors.
 *
 * Authority: RBAC.md §4 — "Authentication failure mode: 401 Unauthorized"
 */
export class AuthenticationError extends AuthError {
  readonly statusCode = 401;

  constructor(message = 'Authentication failed: unauthorized') {
    super(message);
  }
}

/**
 * Thrown when the HTTP Authorization header is absent or empty.
 */
export class MissingAuthHeaderError extends AuthenticationError {
  constructor() {
    super('Missing HTTP Authorization header');
  }
}

/**
 * Thrown when the HTTP Authorization header does not follow the 'Bearer <token>' format.
 */
export class InvalidAuthHeaderFormatError extends AuthenticationError {
  constructor(headerValue?: string) {
    super(
      'Invalid HTTP Authorization header format: expected "Bearer <token>"' +
        (headerValue ? `; received "${headerValue.slice(0, 15)}..."` : ''),
    );
  }
}

/**
 * Thrown when an authorization check (RBAC middleware) is invoked on a request
 * that has not been authenticated via createAuthMiddleware().
 */
export class UnauthenticatedContextError extends AuthenticationError {
  constructor() {
    super(
      'Request context is unauthenticated: createAuthMiddleware() must run before RBAC evaluation',
    );
  }
}
