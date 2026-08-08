import { expect, test, describe } from 'vitest';
import { signTokenPair, verifyAccessToken } from './index';
describe('Auth Package', () => {
  const config = {
    accessSecret: 'access',
    refreshSecret: 'refresh',
    accessTtlSeconds: 3600,
    refreshTtlSeconds: 86400,
  };
  test('should sign and verify tokens', () => {
    const payload = {
      sub: 'user-1',
      tenantId: 'tenant-1',
      roleId: 'role-1',
      branchId: 'branch-1',
    };
    const tokens = signTokenPair(payload, { sub: 'user-1', tenantId: 'tenant-1' }, config);
    expect(tokens.accessToken).toBeDefined();
    expect(tokens.refreshToken).toBeDefined();
    const decoded = verifyAccessToken(tokens.accessToken, config);
    expect(decoded?.sub).toBe('user-1');
  });
});
