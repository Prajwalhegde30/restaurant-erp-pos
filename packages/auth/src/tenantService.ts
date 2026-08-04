/**
 * Tenant Context Injection & Data Isolation Service
 *
 * Implements execution-scoped tenant context propagation via AsyncLocalStorage
 * and mandatory database query interception for multi-tenant isolation.
 *
 * Authority References:
 * - Architecture.md §9.1 — Data Isolation Strategy:
 *     1. Tenant ID Stamping: Every table in the system (except global dictionaries)
 *        must contain a tenant_id column.
 *     2. Prisma Middleware/Extensions: A mandatory database extension intercepts
 *        every query. It automatically injects WHERE tenant_id = ? into reads and
 *        tenant_id: ? into writes based on the async local storage execution context.
 * - PhaseScope.md Task 2.4 — Tenant Context Injection:
 *     "Force all DB queries to respect tenant_id. Scope: AsyncLocalStorage /
 *      Prisma Client Extension."
 * - CodingStandards.md §4 — Clean Architecture, transport independence.
 */

import { AsyncLocalStorage } from 'node:async_hooks';
import { UnauthenticatedContextError } from './middleware.errors.js';
import { CrossTenantAccessError, MissingTenantContextError } from './tenant.errors.js';
import type {
  AuthRequest,
  AuthResponse,
  HttpMiddleware,
  NextFunction,
} from './middleware.types.js';
import type {
  PrismaExtensionOptions,
  PrismaQueryExtensionArgs,
  TenantContext,
  TenantMiddlewareOptions,
} from './tenant.types.js';

// ─────────────────────────────────────────────────────────────────────────────
// ASYNCLOCALSTORAGE SINGLETON ENGINE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Singleton AsyncLocalStorage store holding the active TenantContext for the
 * current execution scope.
 *
 * Authority: Architecture.md §9.1 item 2
 */
export const tenantContextStorage = new AsyncLocalStorage<TenantContext>();

// ─────────────────────────────────────────────────────────────────────────────
// CONTEXT ACCESSORS & ASSERTION HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the active TenantContext for the current execution scope, or undefined
 * if no tenant context has been injected.
 */
export function getTenantContext(): TenantContext | undefined {
  return tenantContextStorage.getStore();
}

/**
 * Asserts and returns the active TenantContext for the current execution scope.
 * Throws MissingTenantContextError if no context is present.
 *
 * Authority: Architecture.md §9.1 — mandatory tenant isolation.
 *
 * @throws MissingTenantContextError
 */
export function requireTenantContext(): TenantContext {
  const context = getTenantContext();
  if (!context) {
    throw new MissingTenantContextError();
  }
  return context;
}

/**
 * Returns the active tenant UUID for the current execution scope, or undefined.
 */
export function getTenantId(): string | undefined {
  return getTenantContext()?.tenantId;
}

/**
 * Asserts and returns the active tenant UUID for the current execution scope.
 * Throws MissingTenantContextError if no context is present.
 *
 * @throws MissingTenantContextError
 */
export function requireTenantId(): string {
  return requireTenantContext().tenantId;
}

/**
 * Returns the active branch UUID for the current execution scope, or null/undefined.
 * Null indicates a tenant-wide role assignment (RBAC.md §13.3).
 */
export function getBranchId(): string | null | undefined {
  return getTenantContext()?.branchId;
}

/**
 * Returns the active user UUID for the current execution scope, or undefined.
 */
export function getUserId(): string | undefined {
  return getTenantContext()?.userId;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXECUTION WRAPPER (FUNCTIONAL API)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Runs a synchronous or asynchronous function within an active TenantContext execution scope.
 *
 * Any downstream service calls, repositories, or Prisma query interceptors executed
 * within `fn` (and its async call stack) will automatically receive the injected context.
 *
 * Authority: Architecture.md §9.1 item 2 & PhaseScope.md Task 2.4
 *
 * @param context - TenantContext to bind to the execution scope
 * @param fn      - Callback function to execute
 * @returns Result of the callback function
 */
export function runWithTenantContext<T>(
  context: TenantContext,
  fn: () => T | Promise<T>,
): T | Promise<T> {
  return tenantContextStorage.run(context, fn);
}

// ─────────────────────────────────────────────────────────────────────────────
// HTTP TENANT CONTEXT INJECTION MIDDLEWARE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sends a structured JSON error response compatible across Express and Fastify.
 */
function sendTenantErrorResponse(
  res: AuthResponse,
  status: number,
  title: string,
  error: Error,
): void {
  const payload = {
    error: title,
    message: error.message,
    code: error.name || 'TenantIsolationError',
  };

  if (typeof res.status === 'function') {
    const resWithStatus = res.status(status);
    if (resWithStatus && typeof resWithStatus.json === 'function') {
      resWithStatus.json(payload);
      return;
    }
    if (resWithStatus && typeof resWithStatus.send === 'function') {
      resWithStatus.send(payload);
      return;
    }
  }

  if (typeof res.json === 'function') {
    res.json(payload);
    return;
  }

  if (typeof res.send === 'function') {
    res.send(payload);
    return;
  }
}

/**
 * Creates an HTTP middleware function that injects tenant and branch context from an
 * authenticated request (req.auth) into the AsyncLocalStorage execution scope.
 *
 * Responsibilities:
 * 1. Verifies that req.auth was populated by createAuthMiddleware() (Task 2.3).
 * 2. Extracts userId, tenantId, branchId, and roleId.
 * 3. Wraps the downstream next() handler in runWithTenantContext() so all subsequent
 *    service and database queries inherit the tenant context automatically.
 *
 * Authority: PhaseScope.md Task 2.4 & Architecture.md §9.1
 *
 * @param options - Optional configuration (e.g. requireAuth or custom error handler)
 * @returns Reusable HTTP middleware function
 */
export function createTenantContextMiddleware(options?: TenantMiddlewareOptions): HttpMiddleware {
  return async (req: AuthRequest, res: AuthResponse, next?: NextFunction): Promise<void> => {
    try {
      if (!req.auth) {
        if (options?.requireAuth !== false) {
          throw new UnauthenticatedContextError();
        }
        if (next) {
          return next();
        }
        return;
      }

      const tenantContext: TenantContext = {
        userId: req.auth.userId,
        tenantId: req.auth.tenantId,
        branchId: req.auth.branchId,
        roleId: req.auth.roleId,
      };

      if (next) {
        return tenantContextStorage.run(tenantContext, () => {
          return next();
        });
      }
    } catch (error) {
      if (options?.onTenantError) {
        options.onTenantError(error as Error, req, res);
        return;
      }

      const err = error as { statusCode?: number } & Error;
      const statusCode = err.statusCode === 401 ? 401 : 403;
      const title = statusCode === 401 ? 'Unauthorized' : 'Forbidden';

      sendTenantErrorResponse(res, statusCode, title, error as Error);
    }
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// PRISMA CLIENT QUERY INTERCEPTOR & EXTENSION FACTORY
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Default list of model names exempt from tenant_id query interception.
 * Global dictionaries and IAM root tables per Architecture.md §9.1 item 1.
 */
const DEFAULT_EXEMPT_MODELS = [
  'Tenant',
  'Role',
  'Permission',
  'RolePermission',
  'GlobalDictionary',
];

/**
 * Intercepts a Prisma query operation and enforces mandatory tenant isolation by:
 * 1. Verifying an active TenantContext is present in AsyncLocalStorage.
 * 2. Injected WHERE tenantId = ? into read/update/delete operations.
 * 3. Injected data.tenantId = ? into create/upsert operations.
 * 4. Preventing cross-tenant data access or creation.
 *
 * Authority: Architecture.md §9.1 item 2
 *
 * @param extensionArgs - The Prisma query interception payload
 * @param options       - Optional exemption and assertion rules
 * @returns Executed query promise
 * @throws MissingTenantContextError | CrossTenantAccessError
 */
export async function interceptPrismaQuery(
  extensionArgs: PrismaQueryExtensionArgs,
  options?: PrismaExtensionOptions,
): Promise<unknown> {
  const { model, operation, args, query } = extensionArgs;

  const exemptModels = options?.exemptModels ?? DEFAULT_EXEMPT_MODELS;
  if (model && exemptModels.includes(model)) {
    return query(args);
  }

  const tenantId = getTenantId();
  const requireContext = options?.requireContext ?? true;

  if (!tenantId) {
    if (requireContext) {
      throw new MissingTenantContextError(model, operation);
    }
    return query(args);
  }

  const safeArgs = args || {};

  // Read / Aggregate / Update / Delete operations: inject WHERE tenantId
  if (
    [
      'findUnique',
      'findUniqueOrThrow',
      'findFirst',
      'findFirstOrThrow',
      'findMany',
      'count',
      'aggregate',
      'groupBy',
      'update',
      'updateMany',
      'delete',
      'deleteMany',
      'upsert',
    ].includes(operation)
  ) {
    safeArgs.where = {
      ...(safeArgs.where || {}),
      tenantId,
    };
  }

  // Single create operation: inject or assert data.tenantId
  if (operation === 'create' || operation === 'upsert') {
    const dataObj = operation === 'upsert' ? safeArgs.create : safeArgs.data;
    if (dataObj && typeof dataObj === 'object' && !Array.isArray(dataObj)) {
      const existingTenantId = (dataObj as Record<string, unknown>).tenantId;
      if (existingTenantId !== undefined && String(existingTenantId) !== tenantId) {
        throw new CrossTenantAccessError(tenantId, String(existingTenantId));
      }
      (dataObj as Record<string, unknown>).tenantId = tenantId;
    }
  }

  // Multi-record create operation: inject or assert tenantId for every item
  if (operation === 'createMany' || operation === 'createManyAndReturn') {
    const dataList = safeArgs.data;
    if (Array.isArray(dataList)) {
      for (const item of dataList) {
        if (item && typeof item === 'object') {
          const existingTenantId = (item as Record<string, unknown>).tenantId;
          if (existingTenantId !== undefined && String(existingTenantId) !== tenantId) {
            throw new CrossTenantAccessError(tenantId, String(existingTenantId));
          }
          (item as Record<string, unknown>).tenantId = tenantId;
        }
      }
    } else if (dataList && typeof dataList === 'object') {
      const existingTenantId = (dataList as Record<string, unknown>).tenantId;
      if (existingTenantId !== undefined && String(existingTenantId) !== tenantId) {
        throw new CrossTenantAccessError(tenantId, String(existingTenantId));
      }
      (dataList as Record<string, unknown>).tenantId = tenantId;
    }
  }

  return query(safeArgs);
}

/**
 * Creates a Prisma Client Extension configuration object that automatically
 * enforces tenant isolation across all models (except exempt dictionaries).
 *
 * Authority: Architecture.md §9.1 item 2 & PhaseScope.md Task 2.4
 *
 * Usage with PrismaClient:
 *   const prisma = new PrismaClient().$extends(createTenantIsolationExtension());
 *
 * @param options - Optional exemption list or strict context requirement
 * @returns Prisma Client extension configuration
 */
export function createTenantIsolationExtension(options?: PrismaExtensionOptions) {
  return {
    name: 'tenant-isolation-extension',
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }: PrismaQueryExtensionArgs) {
          return interceptPrismaQuery({ model, operation, args, query }, options);
        },
      },
    },
  };
}
