/**
 * Tenant Context Injection Type Definitions
 *
 * Defines the execution-scoped tenant context model, configuration options,
 * and structural abstractions for AsyncLocalStorage and Prisma query isolation.
 *
 * Authority References:
 * - Architecture.md §9.1 — Data Isolation Strategy:
 *     "Every table in the system (except global dictionaries) must contain a tenant_id column."
 *     "A mandatory database extension intercepts every query. It automatically injects
 *      WHERE tenant_id = ? into reads and tenant_id: ? into writes based on the
 *      async local storage execution context."
 * - PhaseScope.md Task 2.4 — Tenant Context Injection:
 *     "Force all DB queries to respect tenant_id. Scope: AsyncLocalStorage /
 *      Prisma Client Extension."
 * - CodingStandards.md §4 — Clean Architecture, transport independence.
 */
export {};
