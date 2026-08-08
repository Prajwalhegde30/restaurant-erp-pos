/**
 * Authentication Error Classes
 *
 * Typed errors for the authentication layer.
 *
 * CodingStandards.md §19 — Error Handling Standards:
 *   "Throw typed custom errors (e.g., ValidationError, AuthorizationError, NotFoundError)."
 *
 * RBAC.md §4 — Authentication vs. Authorization:
 *   "Authentication failure mode: 401 Unauthorized"
 *   "Authorization failure mode: 403 Forbidden"
 *
 * These errors are thrown by the token service and caught by the HTTP middleware
 * (implemented in Task 2.3), which maps them to the correct HTTP status codes.
 */
/**
 * Base class for all auth-related errors.
 * Allows downstream middleware to use instanceof checks cleanly.
 */
export class AuthError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    // Maintain correct prototype chain in transpiled environments
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
/**
 * Thrown when a JWT is missing, malformed, expired, or has an invalid signature.
 * Maps to HTTP 401 Unauthorized.
 *
 * RBAC.md §4: "Authentication failure mode: 401 Unauthorized"
 */
export class TokenInvalidError extends AuthError {
  statusCode = 401;
  constructor(message = 'Token is invalid or has expired') {
    super(message);
  }
}
/**
 * Thrown when a token has expired specifically.
 * Subclass of TokenInvalidError — also maps to HTTP 401.
 * Separated to allow clients to distinguish expiry from forgery,
 * so they can attempt a refresh flow rather than forcing re-login.
 */
export class TokenExpiredError extends TokenInvalidError {
  constructor(message = 'Token has expired') {
    super(message);
  }
}
/**
 * Thrown when a token's type discriminator (`tokenType` claim) does not match
 * the expected type — e.g., a refresh token presented in an access-token slot.
 * Maps to HTTP 401 Unauthorized.
 */
export class TokenTypeMismatchError extends TokenInvalidError {
  constructor(expected, received) {
    super(`Expected token type '${expected}', received '${received}'`);
  }
}
/**
 * Thrown when JWT secret environment variables are missing or empty at startup.
 * This is a configuration error — it should cause the process to exit, not return
 * a 401 to a client.
 *
 * CodingStandards.md §4: "Fail Fast: Validate everything at the boundaries."
 */
export class JwtConfigurationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'JwtConfigurationError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
