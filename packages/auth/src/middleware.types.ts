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

import type { JwtAccessPayload, JwtConfig } from './types.js';

/**
 * Authenticated execution context bootstrapped from a verified access JWT.
 * Attached to incoming requests by the authentication middleware.
 *
 * Authority: Architecture.md §10.2 & RBAC.md §4
 */
export interface AuthenticatedContext {
  /** Authenticated user UUID (from JWT sub) */
  userId: string;
  /** Authenticated tenant UUID (from JWT tenantId) */
  tenantId: string;
  /**
   * Active branch UUID (from JWT branchId).
   * NULL if operating under a tenant-wide role assignment (RBAC.md §13.3).
   */
  branchId: string | null;
  /** Active role assignment UUID (from JWT roleId) */
  roleId: string;
  /** Raw verified JWT string */
  token: string;
  /** Full decoded access token payload */
  payload: JwtAccessPayload;
}

/**
 * Minimal structural interface for an HTTP request across Express, Fastify, and Next.js.
 * Decouples the middleware from framework-specific type dependencies.
 *
 * Authority: CodingStandards.md §4 — Clean Architecture & transport independence.
 */
export interface AuthRequest extends Record<string, unknown> {
  /** Optional HTTP request headers */
  headers?: {
    authorization?: string | string[];
    [key: string]: unknown;
  };
  /** Authenticated context populated by createAuthMiddleware() */
  auth?: AuthenticatedContext;
  /** Convenience shortcut: user identity */
  user?: { id: string };
  /** Convenience shortcut: active tenant ID */
  tenantId?: string;
  /** Convenience shortcut: active branch ID */
  branchId?: string | null;
}

/**
 * Minimal structural interface for an HTTP response object across Express and Fastify.
 */
export interface AuthResponse {
  /** Set HTTP status code */
  status?: (code: number) => AuthResponse;
  /** Send JSON payload */
  json?: (data: unknown) => unknown;
  /** Send payload (Express/Fastify send) */
  send?: (data: unknown) => unknown;
  [key: string]: unknown;
}

/**
 * Configuration options for createAuthMiddleware().
 */
export interface AuthMiddlewareOptions {
  /**
   * Optional JWT config override.
   * If omitted, loadJwtConfig() is used (Architecture.md §10.1).
   */
  config?: JwtConfig;
  /**
   * Optional custom error handler for authentication failures (HTTP 401).
   * Useful for framework-specific formatting or custom audit logging.
   */
  onAuthError?: (err: Error, req: unknown, res: unknown) => unknown;
}

/**
 * Configuration options for createRbacMiddleware().
 */
export interface RbacMiddlewareOptions {
  /**
   * Optional callback to resolve target resource attributes from the request
   * (e.g., targetTenantId, targetBranchId, targetOwnerId, actionValue)
   * for fine-grained RBAC evaluation per RBAC.md §8.3 & §17.1.
   */
  getTargetContext?: (req: AuthRequest) => {
    targetTenantId?: string;
    targetBranchId?: string | null;
    targetOwnerId?: string | null;
    actionValue?: number;
  };
  /**
   * Optional custom error handler for authorization failures (HTTP 403).
   */
  onAuthzError?: (err: Error, req: unknown, res: unknown) => unknown;
}

/**
 * Function signature for a middleware callback in Express/Fastify.
 */
export type NextFunction = (err?: unknown) => void;

/**
 * Generic HTTP Middleware Handler function signature.
 */
export type HttpMiddleware = (
  req: AuthRequest,
  res: AuthResponse,
  next?: NextFunction,
) => void | Promise<void>;
