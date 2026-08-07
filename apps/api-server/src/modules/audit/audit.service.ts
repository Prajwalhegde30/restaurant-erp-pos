import { prisma } from '@repo/database';
import { Prisma } from '@repo/types/src/generated';

export class AuditService {
  static async getAuditLogs(
    tenantId: string,
    params: {
      branchId?: string;
      userId?: string;
      action?: string;
      startDate?: Date;
      endDate?: Date;
      search?: string;
      limit?: number;
      cursor?: string;
    },
  ) {
    const limit = params.limit || 50;

    const where: Prisma.AuditLogWhereInput = {
      tenantId,
    };

    if (params.branchId) {
      where.branchId = params.branchId;
    }

    if (params.userId) {
      where.userId = params.userId;
    }

    if (params.action) {
      where.action = params.action;
    }

    if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) where.createdAt.gte = params.startDate;
      if (params.endDate) where.createdAt.lte = params.endDate;
    }

    if (params.search) {
      where.OR = [
        { action: { contains: params.search, mode: 'insensitive' } },
        { reason: { contains: params.search, mode: 'insensitive' } },
        { entityType: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      cursor: params.cursor ? { id: params.cursor } : undefined,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        branch: { select: { id: true, name: true } },
      },
    });

    let hasMore = false;
    let nextCursor: string | undefined = undefined;

    if (logs.length > limit) {
      hasMore = true;
      const nextItem = logs.pop();
      nextCursor = nextItem?.id;
    }

    return { data: logs, hasMore, nextCursor };
  }
}
