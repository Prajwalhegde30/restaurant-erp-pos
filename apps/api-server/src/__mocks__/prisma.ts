import { vi, beforeEach } from 'vitest';

export const prismaMock = {
  user: {
    findFirst: vi.fn(),
  },
};

vi.mock('@repo/database', () => ({
  __esModule: true,
  prisma: prismaMock,
  default: prismaMock,
}));

beforeEach(() => {
  vi.clearAllMocks();
});
