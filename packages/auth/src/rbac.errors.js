/**
 * RBAC Authorization Error Classes
 *
 * Typed errors for the authorization layer.
 *
 * CodingStandards.md §19 — Error Handling Standards:
 *   "Throw typed custom errors (e.g., ValidationError, AuthorizationError, NotFoundError)."
 *
 * RBAC.md §4 — Authentication vs. Authorization:
 *   "Authorization failure mode: 403 Forbidden"
 *
 * These errors are thrown by assertPermission() and caught by HTTP middleware
 * (implemented in Task 2.3), mapping them to HTTP status code 403.
 */
import { AuthError } from './errors.js';
/**
 * Base class for all 403 Forbidden authorization errors.
 *
 * Authority: RBAC.md §4 — "Authorization failure mode: 403 Forbidden"
 */
export class AuthorizationError extends AuthError {
  statusCode = 403;
  constructor(message = 'Access forbidden: insufficient permissions') {
    super(message);
  }
}
/**
 * Thrown when a user attempts to access resources belonging to a different tenant.
 *
 * Authority:
 * - RBAC.md §5.2 Layer 1 — Tenant Isolation Check:
 *   "Is the user's tenant_id claim consistent with the resource being requested?
 *    Cross-tenant access is rejected before any other check."
 * - RBAC.md §12.1 — Tenant Isolation:
 *   "Rejects any request where this claim is absent or mismatched before evaluating any permission."
 */
export class CrossTenantViolationError extends AuthorizationError {
  userTenantId;
  targetTenantId;
  constructor(userTenantId, targetTenantId) {
    super(
      `Tenant isolation violation: user from tenant '${userTenantId}' ` +
        `attempted to access resource in tenant '${targetTenantId}'`,
    );
    this.userTenantId = userTenantId;
    this.targetTenantId = targetTenantId;
  }
}
/**
 * Thrown when a user attempts to access a branch outside their assigned branch scope.
 *
 * Authority:
 * - RBAC.md §5.2 Layer 2 — Branch Scope Check
 * - RBAC.md §13.1 — Branch Scoping:
 *   "Most operational permissions are branch-scoped. A cashier at Branch A cannot
 *    bill orders at Branch B even if they are employed by the same restaurant chain."
 */
export class BranchScopeViolationError extends AuthorizationError {
  userBranchId;
  targetBranchId;
  constructor(userBranchId, targetBranchId) {
    super(
      `Branch scope violation: user operating in branch '${userBranchId ?? 'NULL'}' ` +
        `cannot access resource in branch '${targetBranchId}'`,
    );
    this.userBranchId = userBranchId;
    this.targetBranchId = targetBranchId;
  }
}
/**
 * Thrown when permission evaluation results in DENY.
 *
 * Authority: RBAC.md §6 — Permission Resolution Flow
 */
export class PermissionDeniedError extends AuthorizationError {
  permission;
  reason;
  requiredScope;
  constructor(permission, reason, requiredScope) {
    super(
      `Permission denied for '${permission}': ${reason}` +
        (requiredScope ? ` (required scope: ${requiredScope})` : ''),
    );
    this.permission = permission;
    this.reason = reason;
    this.requiredScope = requiredScope;
  }
}
/**
 * Thrown when role inheritance forms a circular reference.
 * This is a configuration/system error rather than a user authorization error.
 *
 * Authority: RBAC.md §14.2 — "Circular inheritance is prohibited — rejected at role configuration time"
 */
export class CircularInheritanceError extends Error {
  roleId;
  cyclePath;
  constructor(roleId, cyclePath) {
    super(
      `Circular role inheritance detected for role '${roleId}'. Path: ${cyclePath.join(' -> ')} -> ${roleId}`,
    );
    this.roleId = roleId;
    this.cyclePath = cyclePath;
    this.name = 'CircularInheritanceError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
