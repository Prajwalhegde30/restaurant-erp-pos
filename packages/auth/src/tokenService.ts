/**
 * JWT Token Service
 *
 * Implements token generation (signing) and token verification for the platform's
 * stateless authentication layer.
 *
 * Authority References:
 *
 * Architecture.md §10.1 — Authentication Flow:
 *   - Both access token and refresh token are generated at login.
 *   - Signature and expiration are validated locally (CPU-side, no DB lookup).
 *   - "API validates Signature & Expiration (Local CPU)"
 *
 * Architecture.md §10.2 — RBAC Evaluation:
 *   - "The JWT payload contains the role_id, tenant_id, and branch_id."
 *   - Permission evaluation occurs at request time against Redis-cached RBAC model.
 *
 * RBAC.md §4 — Authentication vs. Authorization:
 *   - JWT carries: user_id, tenant_id, active branch_id.
 *   - Does NOT embed the full permission set.
 *   - Authentication failure → 401 Unauthorized.
 *
 * RBAC.md §20.6 — Session & Credential Security:
 *   - Access token expiry: 15–30 minutes (configurable).
 *   - Terminating a user's access takes effect within seconds for new actions.
 *
 * CodingStandards.md §19 — Error Handling:
 *   - Throw typed errors; never swallow exceptions silently.
 *
 * CodingStandards.md §22 — Security Standards:
 *   - Prohibited: never log JWT tokens (CodingStandards.md §20).
 */

import jwt from 'jsonwebtoken';

import type { JwtAccessPayload, JwtRefreshPayload, JwtConfig, TokenPair } from './types.js';
import { TokenExpiredError, TokenInvalidError, TokenTypeMismatchError } from './errors.js';

// ─────────────────────────────────────────────────────────────────────────────
// TOKEN SIGNING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Signs an access token for the given user context.
 *
 * The resulting token is short-lived (default 15 minutes — RBAC.md §20.6).
 * It carries only the bootstrap claims required to start authorization evaluation;
 * the full permission set is NEVER embedded (RBAC.md §4).
 *
 * @param payload - The access token claims (user, tenant, branch, role)
 * @param config  - Resolved JWT configuration (secrets + TTLs)
 * @returns Signed JWT string
 */
export function signAccessToken(
  payload: Omit<JwtAccessPayload, 'tokenType'>,
  config: JwtConfig,
): string {
  const claims: JwtAccessPayload = { ...payload, tokenType: 'access' };

  return jwt.sign(claims, config.accessSecret, {
    algorithm: 'HS256',
    expiresIn: config.accessTtlSeconds,
    // 'sub' is already in the payload — jwt library will honour it
  });
}

/**
 * Signs a refresh token for the given user context.
 *
 * Refresh tokens carry a minimal surface area: only the subject (user_id)
 * and tenant_id are required to issue a fresh access token. They carry no
 * role or branch context — those are re-resolved from the database on refresh.
 *
 * @param payload - The refresh token claims (user, tenant)
 * @param config  - Resolved JWT configuration
 * @returns Signed JWT string
 */
export function signRefreshToken(
  payload: Omit<JwtRefreshPayload, 'tokenType'>,
  config: JwtConfig,
): string {
  const claims: JwtRefreshPayload = { ...payload, tokenType: 'refresh' };

  return jwt.sign(claims, config.refreshSecret, {
    algorithm: 'HS256',
    expiresIn: config.refreshTtlSeconds,
  });
}

/**
 * Generates both an access token and a refresh token for a successful login.
 *
 * This is the primary entry point for the auth controller.
 * Architecture.md §10.1: "Generate Access Token (JWT) & Refresh Token"
 *
 * @param accessPayload  - Claims for the access token
 * @param refreshPayload - Claims for the refresh token
 * @param config         - Resolved JWT configuration
 * @returns TokenPair containing both signed tokens and the access TTL
 */
export function signTokenPair(
  accessPayload: Omit<JwtAccessPayload, 'tokenType'>,
  refreshPayload: Omit<JwtRefreshPayload, 'tokenType'>,
  config: JwtConfig,
): TokenPair {
  return {
    accessToken: signAccessToken(accessPayload, config),
    refreshToken: signRefreshToken(refreshPayload, config),
    expiresIn: config.accessTtlSeconds,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// TOKEN VERIFICATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Verifies an access token's signature and expiration locally (CPU-side).
 *
 * Architecture.md §10.1: "Validate Signature & Expiration (Local CPU)"
 * No database or Redis lookup occurs here — that is the responsibility of
 * the RBAC evaluation middleware (Task 2.2).
 *
 * Throws typed errors so the middleware can map them to correct HTTP codes:
 *   - TokenExpiredError     → 401 (client should attempt refresh)
 *   - TokenTypeMismatchError → 401 (refresh token used as access token)
 *   - TokenInvalidError     → 401 (any other signature/format failure)
 *
 * @param token  - The raw JWT string from the Authorization header
 * @param config - Resolved JWT configuration
 * @returns Verified and typed JwtAccessPayload
 * @throws TokenExpiredError | TokenTypeMismatchError | TokenInvalidError
 */
export function verifyAccessToken(token: string, config: JwtConfig): JwtAccessPayload {
  try {
    const payload = jwt.verify(token, config.accessSecret, {
      algorithms: ['HS256'],
    }) as JwtAccessPayload;

    // Enforce token type discriminator — prevents refresh tokens being
    // presented in the Authorization: Bearer slot (RBAC.md §4)
    if (payload.tokenType !== 'access') {
      throw new TokenTypeMismatchError('access', payload.tokenType);
    }

    return payload;
  } catch (err) {
    // Re-throw our own typed errors without wrapping
    if (err instanceof TokenInvalidError || err instanceof TokenTypeMismatchError) {
      throw err;
    }

    // Map jsonwebtoken library errors to our typed hierarchy
    if (err instanceof jwt.TokenExpiredError) {
      throw new TokenExpiredError(
        'Access token has expired. Use the refresh token to obtain a new one.',
      );
    }

    // Covers JsonWebTokenError (malformed), NotBeforeError, and anything else
    throw new TokenInvalidError(`Access token verification failed: ${(err as Error).message}`);
  }
}

/**
 * Verifies a refresh token's signature and expiration locally.
 *
 * Used exclusively by the refresh-token endpoint to issue a new access token.
 * If this throws, the user must re-authenticate from scratch.
 *
 * @param token  - The raw refresh JWT string
 * @param config - Resolved JWT configuration
 * @returns Verified and typed JwtRefreshPayload
 * @throws TokenExpiredError | TokenTypeMismatchError | TokenInvalidError
 */
export function verifyRefreshToken(token: string, config: JwtConfig): JwtRefreshPayload {
  try {
    const payload = jwt.verify(token, config.refreshSecret, {
      algorithms: ['HS256'],
    }) as JwtRefreshPayload;

    // Enforce token type discriminator — prevents access tokens being used
    // in the refresh endpoint
    if (payload.tokenType !== 'refresh') {
      throw new TokenTypeMismatchError('refresh', payload.tokenType);
    }

    return payload;
  } catch (err) {
    if (err instanceof TokenInvalidError || err instanceof TokenTypeMismatchError) {
      throw err;
    }

    if (err instanceof jwt.TokenExpiredError) {
      throw new TokenExpiredError('Refresh token has expired. Please log in again.');
    }

    throw new TokenInvalidError(`Refresh token verification failed: ${(err as Error).message}`);
  }
}
