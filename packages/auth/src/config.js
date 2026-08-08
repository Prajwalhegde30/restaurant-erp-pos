/**
 * JWT Configuration Loader
 *
 * Resolves and validates JWT secrets and TTL values from environment variables.
 * Throws JwtConfigurationError at module load time if required secrets are absent.
 *
 * CodingStandards.md §4 — Engineering Philosophy:
 *   "Fail Fast: Validate everything at the boundaries."
 *
 * CodingStandards.md §22 — Security Standards:
 *   "Input Validation: Reject any payload containing unexpected fields."
 *
 * RBAC.md §20.6 — Session & Credential Security:
 *   "Access token expiry is short (configurable per deployment, typically 15–30 minutes)."
 *
 * Environment Variables Required:
 *   JWT_ACCESS_SECRET  — signing key for access tokens (min 64 chars recommended)
 *   JWT_REFRESH_SECRET — signing key for refresh tokens (must differ from access secret)
 *
 * Environment Variables Optional:
 *   JWT_ACCESS_TTL_SECONDS  — default 900 (15 minutes)
 *   JWT_REFRESH_TTL_SECONDS — default 604800 (7 days)
 */
import { JwtConfigurationError } from './errors.js';
function requireEnv(key) {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    throw new JwtConfigurationError(
      `Missing required environment variable: ${key}. ` +
        'Ensure this is set before starting the application.',
    );
  }
  return value.trim();
}
function optionalEnvInt(key, defaultValue) {
  const raw = process.env[key];
  if (!raw) return defaultValue;
  const parsed = parseInt(raw, 10);
  if (isNaN(parsed) || parsed <= 0) {
    throw new JwtConfigurationError(
      `Environment variable ${key} must be a positive integer, got: "${raw}"`,
    );
  }
  return parsed;
}
/**
 * The resolved and validated JWT configuration for this process.
 *
 * This is evaluated lazily (when first imported) rather than at module parse
 * time, to allow test environments to set process.env before this runs.
 */
export function loadJwtConfig() {
  const accessSecret = requireEnv('JWT_ACCESS_SECRET');
  const refreshSecret = requireEnv('JWT_REFRESH_SECRET');
  if (accessSecret === refreshSecret) {
    throw new JwtConfigurationError(
      'JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different keys. ' +
        'Using the same secret for both token types reduces security.',
    );
  }
  return {
    accessSecret,
    refreshSecret,
    accessTtlSeconds: optionalEnvInt('JWT_ACCESS_TTL_SECONDS', 900), // 15 minutes
    refreshTtlSeconds: optionalEnvInt('JWT_REFRESH_TTL_SECONDS', 604800), // 7 days
  };
}
