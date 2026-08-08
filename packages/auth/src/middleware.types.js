/**
 * API Authentication & Authorization Middleware Type Definitions
 *
 * Defines the request context models, middleware configuration options, and
 * transport-independent abstractions for protecting Express/Fastify API gateways.
 *
 * Authority References:
 * - Architecture.md §10.1 — Authentication Flow: Stateless JWT validation,
 *                           local CPU-side signature and expiration check.
 * - Architecture.md §10.2 — RBAC Evaluation: Extract role_id, tenant_id, and
 *                           branch_id from JWT payload; evaluate against RBAC matrix.
 * - RBAC.md §4            — Authentication failure: 401 Unauthorized;
 *                           Authorization failure: 403 Forbidden.
 * - CodingStandards.md §4  — Clean Architecture, transport independence.
 */
export {};
