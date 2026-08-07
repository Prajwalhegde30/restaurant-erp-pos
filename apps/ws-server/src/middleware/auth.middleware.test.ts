import { expect, test, describe, vi } from 'vitest';
import { authMiddleware } from './auth.middleware';
import { Socket } from 'socket.io';

vi.mock('@repo/auth', () => ({
  loadJwtConfig: vi.fn(),
  verifyAccessToken: vi.fn((token) => {
    if (token === 'valid') return { sub: 'user-1', tenantId: 'tenant-1' };
    return null;
  }),
}));

vi.mock('@repo/logger', () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('WS Auth Middleware', () => {
  test('should reject connection without token', async () => {
    const socket = {
      handshake: { auth: {}, headers: {} },
      id: 'socket-1',
    } as unknown as Socket;
    const next = vi.fn();

    await authMiddleware(socket, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  test('should allow connection with valid token', async () => {
    const socket = {
      handshake: { auth: { token: 'valid' }, headers: {} },
      id: 'socket-2',
      data: {},
    } as unknown as Socket;
    const next = vi.fn();

    await authMiddleware(socket, next);
    expect(next).toHaveBeenCalledWith();
    expect(socket.data.userId).toBe('user-1');
  });
});
