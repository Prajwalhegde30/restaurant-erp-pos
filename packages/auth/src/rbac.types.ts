/**
 * RBAC Matrix & Evaluation Type Definitions
 *
 * Defines the domain models and input/output contracts for the RBAC evaluation
 * engine in @repo/auth.
 *
 * Authority References:
 * - RBAC.md §5.2 — Resolution Layers (Tenant Isolation, Branch Scope, Roles,
 *                  Direct Overrides, Temporal Grants, Approval Thresholds)
 * - RBAC.md §8.3 — Permission Scopes (own, branch, tenant, any)
 * - RBAC.md §11  — Role Assignment Model (effective_from, effective_until)
 * - RBAC.md §14  — Role Inheritance (parentRoleId, additive, DENY wins)
 * - RBAC.md §15  — Temporary Permission Grants (wall-clock expiration)
 * - RBAC.md §17.2 — Two-Stage Authorization Model (ALLOW, DENY, ESCALATE)
 */

/**
 * Permission Scopes in ascending order of breadth.
 *
 * - `own`: Only records created by or assigned to the requesting user
 * - `branch`: All records within the user's currently active branch
 * - `tenant`: All records within the user's tenant, across all branches
 * - `any`: Widest scope; used only for highly elevated roles
 *
 * Authority: RBAC.md §8.3
 */
export type PermissionScope = 'own' | 'branch' | 'tenant' | 'any';

/**
 * Effect of a permission grant or override.
 *
 * Authority: RBAC.md §6.1 — "Explicit DENY always wins over any ALLOW at any layer."
 */
export type PermissionEffect = 'ALLOW' | 'DENY';

/**
 * Possible decisions produced by the RBAC evaluation engine.
 *
 * - `ALLOW`: User holds the permission and action is below (or has no) threshold
 * - `DENY`: User does not hold the permission at all (or is explicitly denied)
 * - `ESCALATE`: User holds base permission, but action exceeds configured threshold
 *
 * Authority: RBAC.md §17.2
 */
export type AuthorizationDecision = 'ALLOW' | 'DENY' | 'ESCALATE';

/**
 * A single permission grant on a Role or Direct Override.
 *
 * Authority: RBAC.md §8.2 (Permission Components) & §15.2 (Temporal Grants)
 */
export interface PermissionGrant {
  /** Permission identifier (e.g. 'orders.edit' or 'orders.edit.own') */
  permission: string;
  /**
   * Scope of the permission grant.
   * If omitted, defaults to 'branch' for branch-scoped roles or parsed from suffix.
   */
  scope?: PermissionScope;
  /** Whether this grant allows or explicitly denies the permission (default: ALLOW) */
  effect: PermissionEffect;
  /** Optional threshold value above which approval escalation is triggered (RBAC.md §17.1) */
  thresholdValue?: number;
  /** Optional start timestamp for temporal permissions (RBAC.md §15.2) */
  effectiveFrom?: Date | string | number | null;
  /** Optional expiration timestamp for temporal permissions (RBAC.md §15.2) */
  effectiveUntil?: Date | string | number | null;
}

/**
 * A Role definition in the cached RBAC matrix.
 *
 * Authority: RBAC.md §7.1 & §14.1 (Inheritance Model)
 */
export interface RoleDefinition {
  /** Unique role UUID */
  id: string;
  /** Human-readable role name (e.g. 'Branch Manager', 'Waiter') */
  name: string;
  /** Tenant ID owning this role definition */
  tenantId: string;
  /**
   * Parent role ID from which this role inherits permissions.
   * Additive inheritance: child receives parent permissions, but explicit DENY
   * on child overrides parent ALLOW (RBAC.md §14.2).
   */
  parentRoleId?: string | null;
  /** Array of permission grants/denials configured on this role */
  permissions: PermissionGrant[];
}

/**
 * A User Role Assignment binding a user to a role within a tenant and branch context.
 *
 * Authority: RBAC.md §11.1
 */
export interface UserRoleAssignment {
  /** UUID of the assigned user */
  userId: string;
  /** UUID of the assigned role */
  roleId: string;
  /** UUID of the tenant context */
  tenantId: string;
  /**
   * Branch ID where the assignment applies.
   * NULL indicates a tenant-wide role assignment (Finance Controller, Auditor, etc.)
   * per RBAC.md §13.3.
   */
  branchId: string | null;
  /** When the assignment becomes active (RBAC.md §11.1) */
  effectiveFrom?: Date | string | number | null;
  /** When the assignment expires (null for permanent assignments, RBAC.md §11.1) */
  effectiveUntil?: Date | string | number | null;
}

/**
 * A direct permission override or temporary grant for a specific user.
 *
 * Authority: RBAC.md §5.2 (Layer 4 & 5) & §15.2 (Temporary Grants)
 */
export interface UserPermissionOverride extends PermissionGrant {
  /** Unique override ID */
  id?: string;
  /** UUID of the user */
  userId: string;
  /** Tenant context */
  tenantId: string;
  /**
   * Branch context where override applies.
   * NULL for tenant-wide overrides.
   */
  branchId?: string | null;
}

/**
 * Complete RBAC matrix data structure supplied to the evaluation engine.
 * Typically loaded from Redis cache by the application layer.
 *
 * Authority: Architecture.md §10.2 & RBAC.md §5.1
 */
export interface RbacMatrix {
  /** Roles available in the tenant, keyed by role ID */
  roles: Record<string, RoleDefinition> | Map<string, RoleDefinition>;
  /** Active role assignments for the evaluated user */
  userAssignments?: UserRoleAssignment[];
  /** Direct permission overrides / temporal grants for the evaluated user */
  userOverrides?: UserPermissionOverride[];
}

/**
 * The input context for evaluating a permission request.
 *
 * Authority: RBAC.md §6 — "Incoming Request: user_id, action, resource, branch_id"
 */
export interface EvaluationContext {
  /** Requesting user's UUID (from JWT sub) */
  userId: string;
  /** Requesting user's tenant ID (from JWT tenantId) */
  tenantId: string;
  /**
   * Requesting user's active branch ID (from JWT branchId).
   * NULL if operating under a tenant-wide role.
   */
  branchId: string | null;
  /** The requested permission string (e.g., 'orders.edit' or 'refunds.issue') */
  permission: string;
  /** The tenant ID of the target resource being accessed */
  targetTenantId: string;
  /**
   * The branch ID of the target resource being accessed.
   * Omit or NULL for tenant-wide resources (e.g., 'periods.reopen').
   */
  targetBranchId?: string | null;
  /**
   * The user ID of the creator/owner of the target resource.
   * Required when evaluating 'own' scope permissions (RBAC.md §8.3).
   */
  targetOwnerId?: string | null;
  /**
   * Numeric value associated with the action, used for threshold checks
   * (e.g., discount percentage or refund dollar amount per RBAC.md §17.1).
   */
  actionValue?: number;
  /**
   * Optional evaluation wall-clock timestamp in milliseconds (defaults to Date.now()).
   * Used for deterministic testing of temporal grants.
   */
  timestamp?: number;
}

/**
 * Detailed result returned by evaluatePermissions().
 *
 * Authority: RBAC.md §6 & §17.2
 */
export interface PermissionEvaluationResult {
  /** Final authorization decision: ALLOW, DENY, or ESCALATE */
  decision: AuthorizationDecision;
  /** Explanatory reason for audit logging and diagnostics */
  reason: string;
  /** The effective scope at which permission was matched (if ALLOW or ESCALATE) */
  matchedScope?: PermissionScope;
  /** The specific grant that produced the decision */
  matchedGrant?: {
    permission: string;
    scope: PermissionScope;
    effect: PermissionEffect;
    source: string; // 'role:<roleId>' | 'override:<id>' | 'inherited:<roleId>'
  };
  /** Threshold value that caused escalation (if decision === 'ESCALATE') */
  thresholdValue?: number;
}
