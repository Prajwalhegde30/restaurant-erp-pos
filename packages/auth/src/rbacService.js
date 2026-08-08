/**
 * RBAC Matrix & Permission Evaluation Service
 *
 * Implements the 6-layer / 7-step permission resolution flow and role inheritance
 * engine for the platform's multi-tenant authorization layer.
 *
 * Authority References:
 * - RBAC.md §5.2 — Resolution Layers:
 *     1. Tenant Isolation Check
 *     2. Branch Scope Check
 *     3. Role-Derived Permissions
 *     4. Direct Permission Overrides
 *     5. Temporary Permission Grants
 *     6. Approval Threshold Check
 * - RBAC.md §6   — Permission Resolution Flow (Explicit DENY always wins)
 * - RBAC.md §8.3 — Permission Scopes (own, branch, tenant, any)
 * - RBAC.md §10.2 — Naming Rules (manage shorthand)
 * - RBAC.md §13.3 — Tenant-Wide Roles (branchId = null)
 * - RBAC.md §14  — Role Inheritance Strategy (additive, child DENY overrides parent ALLOW)
 * - RBAC.md §15.3 — Temporal Expiration Behavior (wall-clock-driven)
 * - RBAC.md §17.2 — Two-Stage Authorization Model (ALLOW, DENY, ESCALATE)
 * - CodingStandards.md §4, §19, §22 — Clean architecture, typed errors, fail fast.
 */
import {
  BranchScopeViolationError,
  CircularInheritanceError,
  CrossTenantViolationError,
  PermissionDeniedError,
} from './rbac.errors.js';
// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL HELPERS
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Helper to retrieve a RoleDefinition from either a Record or Map representation.
 */
function getRole(roles, id) {
  if (roles instanceof Map) {
    return roles.get(id);
  }
  return roles[id];
}
/**
 * Converts various timestamp representations (Date, number, string) into epoch ms.
 */
function toTimestamp(time) {
  if (time === undefined || time === null) return null;
  if (typeof time === 'number') return time;
  if (time instanceof Date) return time.getTime();
  const parsed = Date.parse(time);
  return isNaN(parsed) ? null : parsed;
}
/**
 * Evaluates whether a temporal window is active at a given evaluation timestamp.
 *
 * Authority: RBAC.md §15.3 — "Expiry is clock-driven, not session-driven.
 * Expired grants are silently inactive."
 *
 * @param effectiveFrom  - Optional start timestamp
 * @param effectiveUntil - Optional end timestamp
 * @param now            - Evaluation epoch milliseconds (defaults to Date.now())
 * @returns true if active, false if expired or not yet effective
 */
export function isTemporalGrantActive(effectiveFrom, effectiveUntil, now = Date.now()) {
  const start = toTimestamp(effectiveFrom);
  const end = toTimestamp(effectiveUntil);
  if (start !== null && now < start) {
    return false;
  }
  if (end !== null && now >= end) {
    return false;
  }
  return true;
}
/**
 * Ranks permission scopes numerically by breadth.
 *
 * Authority: RBAC.md §8.3 — "any (4) > tenant (3) > branch (2) > own (1)"
 */
const SCOPE_RANK = {
  own: 1,
  branch: 2,
  tenant: 3,
  any: 4,
};
/**
 * Extracts base permission name and default scope from a permission string.
 *
 * Examples:
 * - 'orders.edit.own'  -> { base: 'orders.edit', inferredScope: 'own' }
 * - 'orders.edit'      -> { base: 'orders.edit', inferredScope: undefined }
 * - 'orders.manage'    -> { base: 'orders.manage', inferredScope: undefined }
 */
function normalizePermissionName(rawPermission) {
  const parts = rawPermission.split('.');
  const lastPart = parts[parts.length - 1];
  if (lastPart === 'own' || lastPart === 'branch' || lastPart === 'tenant' || lastPart === 'any') {
    return {
      base: parts.slice(0, -1).join('.'),
      inferredScope: lastPart,
    };
  }
  return { base: rawPermission };
}
/**
 * Evaluates if a grant's permission string matches the requested permission,
 * supporting `.manage` compound shorthand.
 *
 * Authority: RBAC.md §10.2 rule 4 — "`manage` is a compound shorthand meaning
 * `create + view + edit + delete` within the resource."
 */
function doesPermissionMatch(grantPermission, targetPermission) {
  const normGrant = normalizePermissionName(grantPermission);
  const normTarget = normalizePermissionName(targetPermission);
  // Exact base match (e.g. 'orders.edit' === 'orders.edit')
  if (normGrant.base === normTarget.base) {
    return true;
  }
  // Manage shorthand match (e.g. grant 'orders.manage' matches target 'orders.create')
  if (normGrant.base.endsWith('.manage')) {
    const modulePrefix = normGrant.base.slice(0, -'.manage'.length);
    if (normTarget.base.startsWith(`${modulePrefix}.`)) {
      const actionPart = normTarget.base.slice(modulePrefix.length + 1);
      const shorthandCovered = ['create', 'view', 'edit', 'delete', 'manage'];
      if (shorthandCovered.includes(actionPart)) {
        return true;
      }
    }
  }
  return false;
}
/**
 * Determines whether a grant's scope is sufficient to cover the requested target resource.
 *
 * Authority: RBAC.md §8.3 & §13.3
 */
export function isScopeSufficient(grantScope, context, defaultScope = 'branch') {
  const effectiveScope = grantScope ?? defaultScope;
  switch (effectiveScope) {
    case 'any':
      return true;
    case 'tenant':
      // Tenant isolation check (Layer 1) already guarantees context.targetTenantId === context.tenantId
      return true;
    case 'branch': {
      // If user is operating under a tenant-wide role assignment (branchId === null),
      // or if resource is not branch-scoped (targetBranchId is null/undefined),
      // or if target branch matches user's active branch context
      if (
        context.branchId === null ||
        context.targetBranchId === undefined ||
        context.targetBranchId === null ||
        context.targetBranchId === context.branchId
      ) {
        return true;
      }
      return false;
    }
    case 'own': {
      // Requires targetOwnerId to match requesting user's ID
      if (
        context.targetOwnerId !== undefined &&
        context.targetOwnerId !== null &&
        context.targetOwnerId === context.userId
      ) {
        return true;
      }
      return false;
    }
    default:
      return false;
  }
}
/**
 * Resolves all effective permission grants for a given role, evaluating additive
 * inheritance from parent roles up to maxDepth.
 *
 * Authority:
 * - RBAC.md §14.2 — Inheritance Rules:
 *   - Child role inherits all grants from its parent.
 *   - An explicit DENY at child overrides an inherited ALLOW ("DENY always wins").
 *   - Multi-level inheritance supported up to configurable depth (default: 3).
 *   - Circular inheritance is prohibited (rejected with CircularInheritanceError).
 * - RBAC.md §14.4 — Conflict Resolution:
 *   - Explicit DENY at any role takes absolute priority.
 *   - Explicit GRANT at any active role extends the union.
 *   - Scope conflicts resolve to the broader scope.
 *
 * @param roleId   - Role UUID to resolve
 * @param roleMap  - Record or Map of all available RoleDefinitions
 * @param maxDepth - Maximum inheritance depth (default: 3 per RBAC.md §14.2)
 * @returns Array of resolved and deduplicated permission grants for the role
 * @throws CircularInheritanceError if circular inheritance is detected
 */
export function resolveRoleInheritance(roleId, roleMap, maxDepth = 3) {
  const visited = new Set();
  const chain = [];
  let currentId = roleId;
  let depth = 0;
  while (currentId && depth <= maxDepth) {
    if (visited.has(currentId)) {
      throw new CircularInheritanceError(currentId, Array.from(visited));
    }
    visited.add(currentId);
    const role = getRole(roleMap, currentId);
    if (!role) {
      break;
    }
    chain.push({ role, isInherited: depth > 0 });
    currentId = role.parentRoleId;
    depth++;
  }
  // Merge grants additive from root ancestor down to child role
  // Child explicit DENY overrides parent ALLOW (RBAC.md §14.2 & §14.4)
  const merged = new Map();
  // Iterate in reverse (ancestors first, child role last)
  for (let i = chain.length - 1; i >= 0; i--) {
    const { role, isInherited } = chain[i];
    for (const grant of role.permissions) {
      const norm = normalizePermissionName(grant.permission);
      const effectiveScope = grant.scope ?? norm.inferredScope ?? 'branch';
      const key = norm.base;
      const existing = merged.get(key);
      if (!existing) {
        merged.set(key, {
          ...grant,
          permission: norm.base,
          scope: effectiveScope,
          source: isInherited ? `inherited:${role.id}` : `role:${role.id}`,
        });
        continue;
      }
      // Explicit DENY at child overrides parent ALLOW (RBAC.md §14.2)
      if (grant.effect === 'DENY') {
        merged.set(key, {
          ...grant,
          permission: norm.base,
          scope: effectiveScope,
          effect: 'DENY',
          source: isInherited ? `inherited:${role.id}` : `role:${role.id}`,
        });
        continue;
      }
      // If existing is already DENY, DENY always wins
      if (existing.effect === 'DENY') {
        continue;
      }
      // If both are ALLOW, take the broader scope (RBAC.md §14.4 rule 3)
      const existingRank = SCOPE_RANK[existing.scope ?? 'branch'] ?? 0;
      const newRank = SCOPE_RANK[effectiveScope] ?? 0;
      const broaderScope = newRank > existingRank ? effectiveScope : existing.scope;
      // Retain threshold if present
      const thresholdValue = grant.thresholdValue ?? existing.thresholdValue;
      merged.set(key, {
        permission: norm.base,
        scope: broaderScope,
        effect: 'ALLOW',
        thresholdValue,
        source: isInherited ? `inherited:${role.id}` : `role:${role.id}`,
      });
    }
  }
  return Array.from(merged.values());
}
// ─────────────────────────────────────────────────────────────────────────────
// CORE PERMISSION EVALUATION ENGINE
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Evaluates a user's authorization request against the loaded RBAC matrix.
 *
 * Implements the 6-layer / 7-step Permission Resolution Flow from RBAC.md §5.2 and §6.
 * Pure synchronous evaluation function decoupled from HTTP/WebSocket transport.
 *
 * Authority:
 * - RBAC.md §5.2 — 6 Ordered Resolution Layers
 * - RBAC.md §6   — 7-Step Permission Resolution Flow Diagram
 * - RBAC.md §17.2 — Returns ALLOW, DENY, or ESCALATE
 *
 * @param context  - Request context (user, tenant, branch, action, resource, timestamp)
 * @param rbacData - Cached RBAC matrix (roles, active assignments, user overrides)
 * @returns Structured PermissionEvaluationResult
 */
export function evaluatePermissions(context, rbacData) {
  const evalTime = context.timestamp ?? Date.now();
  // ─── STEP 1: Tenant Isolation Check (RBAC.md §5.2 Layer 1 & §12.1) ───────────
  // "Is the user's tenant_id claim consistent with the resource being requested?
  //  Cross-tenant access is rejected before any other check."
  if (context.tenantId !== context.targetTenantId) {
    return {
      decision: 'DENY',
      reason: `Tenant isolation violation: user tenant '${context.tenantId}' != target tenant '${context.targetTenantId}'`,
    };
  }
  // ─── STEP 2: Branch Scope Check (RBAC.md §5.2 Layer 2 & §13.1) ─────────────
  // "Is the user operating within a branch they are assigned to for the required scope?"
  // Note: branchId === null indicates a tenant-wide role assignment per RBAC.md §13.3.
  if (
    context.branchId !== null &&
    context.targetBranchId !== undefined &&
    context.targetBranchId !== null &&
    context.targetBranchId !== context.branchId
  ) {
    return {
      decision: 'DENY',
      reason: `Branch scope violation: user branch '${context.branchId}' != target branch '${context.targetBranchId}'`,
    };
  }
  // ─── STEP 3: Collect Active Role-Derived Permissions & User Overrides ──────
  // (RBAC.md §5.2 Layers 3, 4, 5 & §11.2 Multi-Role Assignment union)
  const applicableGrants = [];
  // 3A. Active Role Assignments
  if (rbacData.userAssignments) {
    for (const assignment of rbacData.userAssignments) {
      if (assignment.userId !== context.userId || assignment.tenantId !== context.tenantId) {
        continue;
      }
      // Branch match: assignment must match user's active branchId OR be tenant-wide (null)
      if (assignment.branchId !== null && assignment.branchId !== context.branchId) {
        continue;
      }
      // Temporal check: expired assignments are silently inactive (RBAC.md §15.3)
      if (!isTemporalGrantActive(assignment.effectiveFrom, assignment.effectiveUntil, evalTime)) {
        continue;
      }
      // Resolve inheritance for this active role
      const roleGrants = resolveRoleInheritance(assignment.roleId, rbacData.roles);
      applicableGrants.push(...roleGrants);
    }
  }
  // 3B. Direct User Overrides & Temporary Grants (RBAC.md §5.2 Layers 4 & 5)
  if (rbacData.userOverrides) {
    for (const override of rbacData.userOverrides) {
      if (override.userId !== context.userId || override.tenantId !== context.tenantId) {
        continue;
      }
      // Branch match for override
      if (
        override.branchId !== undefined &&
        override.branchId !== null &&
        override.branchId !== context.branchId
      ) {
        continue;
      }
      // Temporal check
      if (!isTemporalGrantActive(override.effectiveFrom, override.effectiveUntil, evalTime)) {
        continue;
      }
      const norm = normalizePermissionName(override.permission);
      applicableGrants.push({
        ...override,
        permission: norm.base,
        scope: override.scope ?? norm.inferredScope ?? 'branch',
        source: `override:${override.id ?? override.permission}`,
      });
    }
  }
  // ─── STEP 4 & 5: Check Explicit DENY Precedence (RBAC.md §6.1) ─────────────
  // "Explicit DENY always wins over any ALLOW at any layer."
  for (const grant of applicableGrants) {
    if (grant.effect === 'DENY' && doesPermissionMatch(grant.permission, context.permission)) {
      const norm = normalizePermissionName(grant.permission);
      const effectiveScope = grant.scope ?? norm.inferredScope ?? 'branch';
      return {
        decision: 'DENY',
        reason: `Explicit DENY override active from source '${grant.source}'`,
        matchedGrant: {
          permission: grant.permission,
          scope: effectiveScope,
          effect: 'DENY',
          source: grant.source,
        },
      };
    }
  }
  // ─── STEP 6: Find Matching ALLOW Grant with Sufficient Scope (RBAC.md §6 & §8.3)
  let bestAllowGrant;
  let bestScopeRank = -1;
  for (const grant of applicableGrants) {
    if (grant.effect === 'ALLOW' && doesPermissionMatch(grant.permission, context.permission)) {
      const norm = normalizePermissionName(grant.permission);
      const effectiveScope = grant.scope ?? norm.inferredScope ?? 'branch';
      if (isScopeSufficient(effectiveScope, context)) {
        const rank = SCOPE_RANK[effectiveScope] ?? 0;
        if (rank > bestScopeRank) {
          bestScopeRank = rank;
          bestAllowGrant = {
            ...grant,
            scope: effectiveScope,
          };
        }
      }
    }
  }
  if (!bestAllowGrant) {
    return {
      decision: 'DENY',
      reason: `User does not hold an active ALLOW grant for '${context.permission}' at sufficient scope`,
    };
  }
  // ─── STEP 7: Approval Threshold Check (RBAC.md §5.2 Layer 6, §6 & §17.2) ───
  // "Does the action require a secondary approval regardless of base permission?"
  const matchedScope = bestAllowGrant.scope ?? 'branch';
  const matchedGrantMeta = {
    permission: bestAllowGrant.permission,
    scope: matchedScope,
    effect: 'ALLOW',
    source: bestAllowGrant.source,
  };
  if (
    bestAllowGrant.thresholdValue !== undefined &&
    context.actionValue !== undefined &&
    context.actionValue > bestAllowGrant.thresholdValue
  ) {
    return {
      decision: 'ESCALATE',
      reason: `Action value (${context.actionValue}) exceeds approval threshold (${bestAllowGrant.thresholdValue}); requires secondary approval per RBAC.md §17.1`,
      matchedScope,
      matchedGrant: matchedGrantMeta,
      thresholdValue: bestAllowGrant.thresholdValue,
    };
  }
  return {
    decision: 'ALLOW',
    reason: 'Permission granted by active role or override',
    matchedScope,
    matchedGrant: matchedGrantMeta,
  };
}
// ─────────────────────────────────────────────────────────────────────────────
// ASSERTION API
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Evaluates permission and throws a typed AuthorizationError (HTTP 403) if DENY.
 *
 * Designed for API controllers and middleware that require fail-fast rejection
 * of unauthorized requests per CodingStandards.md §4 and RBAC.md §4.
 *
 * @param context  - Request context
 * @param rbacData - Cached RBAC matrix
 * @returns PermissionEvaluationResult if decision is ALLOW or ESCALATE
 * @throws CrossTenantViolationError | BranchScopeViolationError | PermissionDeniedError
 */
export function assertPermission(context, rbacData) {
  const result = evaluatePermissions(context, rbacData);
  if (result.decision === 'DENY') {
    if (result.reason.toLowerCase().includes('tenant isolation')) {
      throw new CrossTenantViolationError(context.tenantId, context.targetTenantId);
    }
    if (result.reason.toLowerCase().includes('branch scope')) {
      throw new BranchScopeViolationError(context.branchId, context.targetBranchId ?? 'UNKNOWN');
    }
    throw new PermissionDeniedError(context.permission, result.reason, result.matchedScope);
  }
  return result;
}
