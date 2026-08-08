import { expect, test, describe, vi, beforeEach } from 'vitest';
import { AuthController } from './auth.controller';
import { Request, Response, NextFunction } from 'express';
const { prismaMock } = vi.hoisted(() => {
  return {
    prismaMock: {
      user: {
        findFirst: vi.fn(),
      },
    },
  };
});

vi.mock('@repo/database', () => ({
  prisma: prismaMock,
}));

vi.mock('@repo/auth', () => ({
  loadJwtConfig: vi.fn(() => ({
    accessSecret: 'secret',
    refreshSecret: 'refresh-secret',
    accessTtlSeconds: 900,
    refreshTtlSeconds: 604800,
  })),
  signTokenPair: vi.fn(() => ({
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    expiresIn: 900,
  })),
}));

describe('Auth Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;
  let jsonMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    jsonMock = vi.fn();
    statusMock = vi.fn(() => ({ json: jsonMock })) as unknown as ReturnType<typeof vi.fn>;
    req = { body: { email: 'admin@dineflow.com', pin: '1234' } };
    res = { status: statusMock } as unknown as Partial<Response>;
    next = vi.fn();
  });

  test('should return 401 if user not found', async () => {
    prismaMock.user.findFirst.mockResolvedValue(null);
    await AuthController.login(req as Request, res as Response, next as unknown as NextFunction);
    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({ error: { message: 'Invalid credentials' } });
  });

  test('should return 401 if pin is wrong', async () => {
    prismaMock.user.findFirst.mockResolvedValue({
      id: '123',
      email: 'admin@dineflow.com',
      pin: '0000',
      tenantId: 'tenant-1',
    } as unknown as Record<string, unknown>);

    await AuthController.login(req as Request, res as Response, next as unknown as NextFunction);
    expect(statusMock).toHaveBeenCalledWith(401);
  });

  test('should return tokens if credentials are correct', async () => {
    prismaMock.user.findFirst.mockResolvedValue({
      id: '123',
      email: 'admin@dineflow.com',
      pin: '1234',
      tenantId: 'tenant-1',
      userRoles: [{ roleId: 'role-1' }],
      branchAssignments: [{ branchId: 'branch-1' }],
    } as unknown as Record<string, unknown>);

    await AuthController.login(req as Request, res as Response, next as unknown as NextFunction);
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: 'access-token',
      }),
    );
  });
});
