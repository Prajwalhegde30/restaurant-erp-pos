/**
 * Tenant Context Injection & Data Isolation Error Classes
 *
 * Typed errors for tenant context assertion failures and cross-tenant
 * data access violations.
 *
 * Authority References:
 * - Architecture.md §9.1 — Data Isolation Strategy:
 *     Mandatory tenant isolation at application and database layers.
 * - CodingStandards.md §19 — Error Handling Standards:
 *     "Throw typed custom errors (e.g., ValidationError, AuthorizationError, NotFoundError)."
 */
/**
 * Base class for all tenant context and data isolation errors.
 */
export class TenantIsolationError extends Error {
  statusCode;
  constructor(message, statusCode = 403) {
    super(message);
    this.name = 'TenantIsolationError';
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
/**
 * Thrown when a database query or service call requiring tenant isolation runs
 * without an active TenantContext in AsyncLocalStorage.
 *
 * Maps to HTTP 401/403 or 500 depending on execution context.
 */
export class MissingTenantContextError extends TenantIsolationError {
  model;
  operation;
  constructor(model, operation) {
    const detail =
      model && operation ? ` for model "${model}" during operation "${operation}"` : '';
    super(
      `Tenant context is missing: execution scope lacks an active TenantContext${detail}. Ensure createTenantContextMiddleware() or runWithTenantContext() wraps this execution.`,
      401,
    );
    this.name = 'MissingTenantContextError';
    this.model = model;
    this.operation = operation;
  }
}
/**
 * Thrown when a query or operation explicitly attempts to read, create, or modify
 * records belonging to a tenantId other than the active TenantContext.
 */
export class CrossTenantAccessError extends TenantIsolationError {
  expectedTenantId;
  attemptedTenantId;
  constructor(expectedTenantId, attemptedTenantId) {
    super(
      `Cross-tenant access violation: active tenant is "${expectedTenantId}", but operation targeted tenant "${attemptedTenantId}"`,
      403,
    );
    this.name = 'CrossTenantAccessError';
    this.expectedTenantId = expectedTenantId;
    this.attemptedTenantId = attemptedTenantId;
  }
}
