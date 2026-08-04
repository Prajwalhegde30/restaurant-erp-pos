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

/**
 * Execution-scoped tenant context stored in AsyncLocalStorage.
 * Propagates across asynchronous operations without manual context passing.
 *
 * Authority: Architecture.md §9.1 & PhaseScope.md Task 2.4
 */
export interface TenantContext {
  /** Authenticated user UUID */
  userId: string;
  /** Active tenant UUID — mandatory isolation boundary */
  tenantId: string;
  /** Active branch UUID (null for tenant-wide roles per RBAC.md §13.3) */
  branchId: string | null;
  /** Active role assignment UUID */
  roleId: string;
}

/**
 * Configuration options for createTenantContextMiddleware().
 */
export interface TenantMiddlewareOptions {
  /**
   * Whether to require an authenticated request context (req.auth) before
   * entering the AsyncLocalStorage scope.
   * Default: true.
   */
  requireAuth?: boolean;
  /**
   * Optional custom error handler when tenant context injection fails.
   */
  onTenantError?: (err: Error, req: unknown, res: unknown) => unknown;
}

/**
 * Configuration options for createTenantIsolationExtension().
 */
export interface PrismaExtensionOptions {
  /**
   * List of model names exempt from automatic tenant_id injection
   * (e.g., global dictionaries or system tables without tenant_id column).
   *
   * Authority: Architecture.md §9.1 item 1 — "(except global dictionaries)"
   */
  exemptModels?: string[];
  /**
   * Whether to throw MissingTenantContextError when a non-exempt model
   * query runs without an active TenantContext in AsyncLocalStorage.
   * Default: true.
   */
  requireContext?: boolean;
}

/**
 * Structural interface for a generic Prisma query operation interception payload.
 * Decouples @repo/auth from direct @repo/database or @prisma/client package dependencies.
 */
export interface PrismaQueryExtensionArgs {
  /** The model being queried (e.g., 'User', 'Order', 'Tenant') */
  model?: string;
  /** The operation name (e.g., 'findMany', 'create', 'update', 'delete') */
  operation: string;
  /** The query arguments passed to the Prisma operation */
  args: {
    where?: Record<string, unknown>;
    data?: Record<string, unknown> | Array<Record<string, unknown>>;
    create?: Record<string, unknown>;
    update?: Record<string, unknown>;
    [key: string]: unknown;
  };
  /** Callback to execute the underlying query with modified args */
  query: (args: unknown) => Promise<unknown>;
}
