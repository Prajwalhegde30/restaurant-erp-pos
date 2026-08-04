/**
 * API Authentication & Authorization Middleware Service
 *
 * Implements transport-independent authentication and authorization middleware
 * for protecting API gateways across Express, Fastify, and Next.js.
 *
 * Authority References:
 * - Architecture.md §10.1 — Authentication Flow: Stateless JWT verification,
 *                           local CPU-side signature and expiration check.
 * - Architecture.md §10.2 — RBAC Evaluation: Extract role_id, tenant_id, and
 *                           branch_id from JWT payload; assert capability against RBAC matrix.
 * - RBAC.md §4            — Authentication vs. Authorization Failure Modes:
 *                           Authentication failure: 401 Unauthorized;
 *                           Authorization failure: 403 Forbidden.
 * - CodingStandards.md §4  — Clean Architecture, transport independence, index.ts barrier.
 * - CodingStandards.md §19 — Typed custom errors.
 */

import { verifyAccessToken } from './tokenService.js';
import { loadJwtConfig } from './config.js';
import { assertPermission } from './rbacService.js';
import {
  InvalidAuthHeaderFormatError,
  MissingAuthHeaderError,
  UnauthenticatedContextError,
} from './middleware.errors.js';
import type { JwtConfig } from './types.js';
import type {
  AuthenticatedContext,
  AuthMiddlewareOptions,
  AuthRequest,
  AuthResponse,
  HttpMiddleware,
  NextFunction,
  RbacMiddlewareOptions,
} from './middleware.types.js';
import type { EvaluationContext, PermissionEvaluationResult, RbacMatrix } from './rbac.types.js';

// ─────────────────────────────────────────────────────────────────────────────
// PURE DOMAIN HELPER FUNCTIONS (TRANSPORT INDEPENDENT)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extracts the raw JWT Bearer token from an HTTP Authorization header value.
 *
 * Authority: Architecture.md §10.1 — Bearer JWT request authentication.
 *
 * @param headerValue - Raw HTTP Authorization header (string or array)
 * @returns Clean JWT token string
 * @throws MissingAuthHeaderError if header is missing/empty
 * @throws InvalidAuthHeaderFormatError if format does not start with 'Bearer '
 */
export function extractBearerToken(headerValue?: string | string[] | null): string {
  if (!headerValue) {
    throw new MissingAuthHeaderError();
  }

  const raw = Array.isArray(headerValue) ? headerValue[0] : headerValue;
  const trimmed = raw.trim();

  if (!trimmed) {
    throw new MissingAuthHeaderError();
  }

  const match = /^Bearer\s+(.+)$/i.exec(trimmed);
  if (!match || !match[1]) {
    throw new InvalidAuthHeaderFormatError(trimmed);
  }

  return match[1].trim();
}

/**
 * Authenticates an incoming request or raw header/token string, returning a
 * structured AuthenticatedContext.
 *
 * Uses ONLY the JWT utilities from Task 2.1 (verifyAccessToken).
 * Local CPU-side verification per Architecture.md §10.1.
 *
 * @param reqOrToken - HTTP request object with headers, or raw header string, or raw JWT string
 * @param config     - Optional custom JwtConfig override (defaults to loadJwtConfig())
 * @returns AuthenticatedContext bootstrapped from the verified token
 * @throws MissingAuthHeaderError | InvalidAuthHeaderFormatError
 * @throws TokenInvalidError | TokenExpiredError | TokenTypeMismatchError (from Task 2.1)
 */
export function authenticateRequest(
  reqOrToken: AuthRequest | { headers?: Record<string, unknown> } | string,
  config?: JwtConfig,
): AuthenticatedContext {
  let tokenString: string;

  if (typeof reqOrToken === 'string') {
    // If input string starts with 'Bearer ', extract it; otherwise treat as raw JWT
    if (/^Bearer\s+/i.test(reqOrToken)) {
      tokenString = extractBearerToken(reqOrToken);
    } else {
      tokenString = reqOrToken.trim();
      if (!tokenString) {
        throw new MissingAuthHeaderError();
      }
    }
  } else {
    // Extract Authorization header from request object
    const headers = reqOrToken.headers;
    const authHeader = headers?.authorization ?? headers?.Authorization ?? headers?.AUTHORIZATION;

    tokenString = extractBearerToken(authHeader as string | string[] | undefined);
  }

  // Verify signature and expiration via Task 2.1 utility (Architecture.md §10.1)
  const jwtConfig = config ?? loadJwtConfig();
  const payload = verifyAccessToken(tokenString, jwtConfig);

  return {
    userId: payload.sub,
    tenantId: payload.tenantId,
    branchId: payload.branchId,
    roleId: payload.roleId,
    token: tokenString,
    payload,
  };
}

/**
 * Evaluates whether an authenticated request context possesses the required
 * permission against a loaded RBAC matrix.
 *
 * Uses ONLY the RBAC assertion engine from Task 2.2 (assertPermission).
 *
 * Authority: Architecture.md §10.2 & RBAC.md §6
 *
 * @param authContext        - Verified AuthenticatedContext from authenticateRequest()
 * @param requiredPermission - Permission string required (e.g. 'orders.edit')
 * @param rbacData           - Loaded RBAC matrix for the user/tenant
 * @param targetOptions      - Optional target resource attributes for scope/threshold checks
 * @returns PermissionEvaluationResult if decision is ALLOW or ESCALATE
 * @throws CrossTenantViolationError | BranchScopeViolationError | PermissionDeniedError (HTTP 403)
 */
export function authorizeRequest(
  authContext: AuthenticatedContext,
  requiredPermission: string,
  rbacData: RbacMatrix,
  targetOptions?: {
    targetTenantId?: string;
    targetBranchId?: string | null;
    targetOwnerId?: string | null;
    actionValue?: number;
  },
): PermissionEvaluationResult {
  const evalContext: EvaluationContext = {
    userId: authContext.userId,
    tenantId: authContext.tenantId,
    branchId: authContext.branchId,
    permission: requiredPermission,
    targetTenantId: targetOptions?.targetTenantId ?? authContext.tenantId,
    targetBranchId:
      targetOptions?.targetBranchId !== undefined
        ? targetOptions.targetBranchId
        : authContext.branchId,
    targetOwnerId: targetOptions?.targetOwnerId,
    actionValue: targetOptions?.actionValue,
  };

  return assertPermission(evalContext, rbacData);
}

// ─────────────────────────────────────────────────────────────────────────────
// TRANSPORT ADAPTER HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sends a structured JSON error response compatible across Express and Fastify.
 */
function sendErrorResponse(res: AuthResponse, status: number, title: string, error: Error): void {
  const payload = {
    error: title,
    message: error.message,
    code: error.name || 'AuthError',
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

// ─────────────────────────────────────────────────────────────────────────────
// REUSABLE MIDDLEWARE FACTORIES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates an HTTP authentication middleware function for Express / Fastify.
 *
 * Responsibilities:
 * 1. Extracts Bearer JWT from HTTP Authorization header.
 * 2. Verifies signature and expiration locally (Architecture.md §10.1).
 * 3. Populates req.auth, req.user, req.tenantId, req.branchId.
 * 4. Returns HTTP 401 Unauthorized for any authentication failure (RBAC.md §4).
 *
 * @param options - Optional middleware configuration (secret override or error handler)
 * @returns Reusable HTTP middleware function
 */
export function createAuthMiddleware(options?: AuthMiddlewareOptions): HttpMiddleware {
  return async (req: AuthRequest, res: AuthResponse, next?: NextFunction): Promise<void> => {
    try {
      const authContext = authenticateRequest(req, options?.config);

      // Populate authenticated execution context on the request object
      // Authority: PhaseScope.md Task 2.3 — "Populate authenticated request context"
      req.auth = authContext;
      req.user = { id: authContext.userId };
      req.tenantId = authContext.tenantId;
      req.branchId = authContext.branchId;

      if (next) {
        return next();
      }
    } catch (error) {
      if (options?.onAuthError) {
        options.onAuthError(error as Error, req, res);
        return;
      }

      // Return HTTP 401 Unauthorized JSON response per RBAC.md §4
      sendErrorResponse(res, 401, 'Unauthorized', error as Error);
    }
  };
}

/**
 * Creates an HTTP RBAC authorization middleware function for Express / Fastify.
 *
 * Responsibilities:
 * 1. Verifies req.auth was populated by createAuthMiddleware().
 * 2. Loads RBAC matrix via caller-supplied callback (no direct DB/Redis queries).
 * 3. Asserts permission using authorizeRequest() / assertPermission() from Task 2.2.
 * 4. Returns HTTP 403 Forbidden for any authorization failure (RBAC.md §4).
 * 5. Returns HTTP 401 Unauthorized if request context was unauthenticated.
 *
 * @param requiredPermission - Permission string required for the route (e.g. 'orders.edit')
 * @param getRbacMatrix      - Callback to load RBAC matrix for the request
 * @param options            - Optional target resource resolver or custom error handler
 * @returns Reusable HTTP middleware function
 */
export function createRbacMiddleware(
  requiredPermission: string,
  getRbacMatrix: (req: AuthRequest) => RbacMatrix | Promise<RbacMatrix>,
  options?: RbacMiddlewareOptions,
): HttpMiddleware {
  return async (req: AuthRequest, res: AuthResponse, next?: NextFunction): Promise<void> => {
    try {
      if (!req.auth) {
        throw new UnauthenticatedContextError();
      }

      const rbacMatrix = await getRbacMatrix(req);
      const targetContext = options?.getTargetContext ? options.getTargetContext(req) : undefined;

      authorizeRequest(req.auth, requiredPermission, rbacMatrix, targetContext);

      if (next) {
        return next();
      }
    } catch (error) {
      if (options?.onAuthzError) {
        options.onAuthzError(error as Error, req, res);
        return;
      }

      const err = error as { statusCode?: number } & Error;
      const statusCode = err.statusCode === 401 ? 401 : 403;
      const title = statusCode === 401 ? 'Unauthorized' : 'Forbidden';

      sendErrorResponse(res, statusCode, title, error as Error);
    }
  };
}
