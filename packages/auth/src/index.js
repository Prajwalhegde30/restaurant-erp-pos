/**
 * @repo/auth — Public Entry Point
 *
 * The Single Source of Truth for all authentication and authorization logic
 * in the monorepo. No other package or application should import jwt or
 * perform token operations directly.
 *
 * Task 2.1 Exports — JWT Authentication Service:
 *   - Types: JwtAccessPayload, JwtRefreshPayload, JwtPayload, TokenPair, JwtConfig
 *   - Errors: AuthError, TokenInvalidError, TokenExpiredError,
 *             TokenTypeMismatchError, JwtConfigurationError
 *   - Config: loadJwtConfig
 *   - Service: signAccessToken, signRefreshToken, signTokenPair,
 *              verifyAccessToken, verifyRefreshToken
 *
 * Task 2.2 Exports — RBAC Matrix Logic:
 *   - Types: PermissionScope, PermissionEffect, AuthorizationDecision,
 *            PermissionGrant, RoleDefinition, UserRoleAssignment,
 *            UserPermissionOverride, RbacMatrix, EvaluationContext,
 *            PermissionEvaluationResult
 *   - Errors: AuthorizationError, CrossTenantViolationError,
 *             BranchScopeViolationError, PermissionDeniedError,
 *             CircularInheritanceError
 *   - Service: evaluatePermissions, assertPermission, resolveRoleInheritance,
 *              isTemporalGrantActive, isScopeSufficient
 *
 * Task 2.3 Exports — API Authentication & Authorization Middleware:
 *   - Types: AuthenticatedContext, AuthRequest, AuthResponse,
 *            AuthMiddlewareOptions, RbacMiddlewareOptions, NextFunction,
 *            HttpMiddleware
 *   - Errors: AuthenticationError, MissingAuthHeaderError,
 *             InvalidAuthHeaderFormatError, UnauthenticatedContextError
 *   - Service: extractBearerToken, authenticateRequest, authorizeRequest,
 *              createAuthMiddleware, createRbacMiddleware
 *
 * Task 2.4 Exports — Tenant Context Injection & Data Isolation:
 *   - Types: TenantContext, TenantMiddlewareOptions, PrismaExtensionOptions,
 *            PrismaQueryExtensionArgs
 *   - Errors: TenantIsolationError, MissingTenantContextError,
 *             CrossTenantAccessError
 *   - Service: tenantContextStorage, getTenantContext, requireTenantContext,
 *              getTenantId, requireTenantId, getBranchId, getUserId,
 *              runWithTenantContext, createTenantContextMiddleware,
 *              interceptPrismaQuery, createTenantIsolationExtension
 *
 * Authority:
 *   Architecture.md §5.3 — @repo/auth: "Shared JWT validation, RBAC evaluation
 *     logic, and permission matrices."
 *   CodingStandards.md §4 — "All shared packages must export their contents
 *     via an index.ts barrier file."
 *   CodingStandards.md §13 — No Prisma imports here; no application imports
 *     jwt directly — they use this package.
 */
export {
  AuthError,
  TokenInvalidError,
  TokenExpiredError,
  TokenTypeMismatchError,
  JwtConfigurationError,
} from './errors.js';
export { loadJwtConfig } from './config.js';
export {
  signAccessToken,
  signRefreshToken,
  signTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
} from './tokenService.js';
export {
  AuthorizationError,
  CrossTenantViolationError,
  BranchScopeViolationError,
  PermissionDeniedError,
  CircularInheritanceError,
} from './rbac.errors.js';
export {
  evaluatePermissions,
  assertPermission,
  resolveRoleInheritance,
  isTemporalGrantActive,
  isScopeSufficient,
} from './rbacService.js';
export {
  AuthenticationError,
  MissingAuthHeaderError,
  InvalidAuthHeaderFormatError,
  UnauthenticatedContextError,
} from './middleware.errors.js';
export {
  extractBearerToken,
  authenticateRequest,
  authorizeRequest,
  createAuthMiddleware,
  createRbacMiddleware,
} from './middlewareService.js';
export {
  TenantIsolationError,
  MissingTenantContextError,
  CrossTenantAccessError,
} from './tenant.errors.js';
export {
  tenantContextStorage,
  getTenantContext,
  requireTenantContext,
  getTenantId,
  requireTenantId,
  getBranchId,
  getUserId,
  runWithTenantContext,
  createTenantContextMiddleware,
  interceptPrismaQuery,
  createTenantIsolationExtension,
} from './tenantService.js';
