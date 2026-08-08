/**
 * JWT Payload Type Definitions
 *
 * Defines the minimal claims carried inside every JWT produced by this platform.
 *
 * Design constraints (from frozen documentation):
 *
 * RBAC.md §4 — Authentication vs. Authorization:
 *   "The JWT token produced at authentication carries the minimal context needed
 *    to bootstrap an authorization check: user_id, tenant_id, and active branch_id.
 *    It does NOT embed the full permission set."
 *
 * Architecture.md §10.2 — RBAC Evaluation:
 *   "The JWT payload contains the role_id, tenant_id, and branch_id."
 *
 * RBAC.md §20.6 — Session & Credential Security:
 *   "Access token expiry is short (configurable per deployment, typically 15–30 minutes)."
 *
 * Architecture.md §10.1 — Authentication Flow:
 *   Both an access token and a refresh token are generated at login.
 *   Signature and expiration are validated locally (CPU-side, no DB lookup).
 */
export {};
