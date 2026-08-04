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
 * Authority:
 *   Architecture.md §5.3 — @repo/auth: "Shared JWT validation, RBAC evaluation
 *     logic, and permission matrices."
 *   CodingStandards.md §4 — "All shared packages must export their contents
 *     via an index.ts barrier file."
 *   CodingStandards.md §13 — No Prisma imports here; no application imports
 *     jwt directly — they use this package.
 */

// ─── Types ───────────────────────────────────────────────────────────────────
export type {
  JwtAccessPayload,
  JwtRefreshPayload,
  JwtPayload,
  TokenPair,
  JwtConfig,
} from './types.js';

// ─── Errors ──────────────────────────────────────────────────────────────────
export {
  AuthError,
  TokenInvalidError,
  TokenExpiredError,
  TokenTypeMismatchError,
  JwtConfigurationError,
} from './errors.js';

// ─── Configuration ───────────────────────────────────────────────────────────
export { loadJwtConfig } from './config.js';

// ─── Token Service ───────────────────────────────────────────────────────────
export {
  signAccessToken,
  signRefreshToken,
  signTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
} from './tokenService.js';
