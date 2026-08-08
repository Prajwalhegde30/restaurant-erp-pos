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
export {};
