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

/**
 * The structured claims embedded inside every access JWT.
 *
 * All UUIDs are stored as plain strings to remain compatible with
 * PostgreSQL UUID columns and Prisma's string-typed UUID fields.
 *
 * Note: branch_id is nullable because tenant-wide roles (e.g., Finance Controller)
 * are not scoped to a single branch — RBAC.md §13.3.
 */
export interface JwtAccessPayload {
  /** The authenticated user's UUID — primary identity claim */
  sub: string; // JWT standard "subject" claim — maps to User.id

  /** The tenant this token is valid within — used for all isolation checks */
  tenantId: string;

  /**
   * The branch the user is currently operating in.
   * NULL for tenant-wide roles (Finance Controller, Auditor, etc.)
   * — RBAC.md §13.3: "distinguished by a branch_id = NULL assignment"
   */
  branchId: string | null;

  /**
   * The primary role assignment ID active for this session.
   * Used by the authorization middleware to look up the cached permission
   * matrix in Redis — Architecture.md §10.2.
   *
   * Note: A user may hold multiple role assignments (RBAC.md §11.2).
   * This field carries the role selected at login for the active branch context.
   */
  roleId: string;

  /** Token type discriminator — prevents access tokens being used as refresh tokens */
  tokenType: 'access';
}

/**
 * The structured claims embedded inside every refresh JWT.
 *
 * Refresh tokens carry a minimal surface area: only enough to identify
 * the subject and issue a new access token. They do NOT contain role or
 * branch context — those are resolved fresh at access token re-issuance.
 */
export interface JwtRefreshPayload {
  /** The authenticated user's UUID */
  sub: string;

  /** The tenant context — required to query the correct user record on refresh */
  tenantId: string;

  /** Token type discriminator — prevents refresh tokens being used as access tokens */
  tokenType: 'refresh';
}

/**
 * Union of all valid JWT payload shapes produced by this service.
 */
export type JwtPayload = JwtAccessPayload | JwtRefreshPayload;

/**
 * The result of a successful token generation at login.
 * Returned from signTokenPair() and consumed by the auth controller.
 */
export interface TokenPair {
  /** Short-lived bearer token — Authorization: Bearer <accessToken> */
  accessToken: string;

  /**
   * Long-lived token used exclusively to obtain a new access token.
   * Must be stored securely by the client (httpOnly cookie, secure storage).
   */
  refreshToken: string;

  /** Access token expiry in seconds — clients use this to schedule proactive refresh */
  expiresIn: number;
}

/**
 * Configuration for token signing, resolved from environment variables.
 * Validated at module load time to fail fast if secrets are missing.
 */
export interface JwtConfig {
  /**
   * Secret key used to sign and verify access tokens.
   * Source: JWT_ACCESS_SECRET environment variable.
   * Must be a cryptographically random string of at least 64 characters.
   */
  accessSecret: string;

  /**
   * Secret key used to sign and verify refresh tokens.
   * Source: JWT_REFRESH_SECRET environment variable.
   * Must be different from accessSecret. Rotation of this key invalidates
   * all active refresh tokens (forcing users to re-authenticate).
   */
  refreshSecret: string;

  /**
   * Access token Time-To-Live in seconds.
   * Source: JWT_ACCESS_TTL_SECONDS environment variable.
   * Default: 900 (15 minutes) — RBAC.md §20.6.
   */
  accessTtlSeconds: number;

  /**
   * Refresh token Time-To-Live in seconds.
   * Source: JWT_REFRESH_TTL_SECONDS environment variable.
   * Default: 604800 (7 days).
   */
  refreshTtlSeconds: number;
}
