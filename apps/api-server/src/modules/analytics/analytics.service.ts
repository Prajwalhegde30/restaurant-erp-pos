import { prisma } from '@repo/database';
import { Prisma } from '@repo/database';

export class AnalyticsService {
  static async getPmixReport(
    tenantId: string,
    branchId?: string,
    startDate?: Date,
    endDate?: Date,
    limit = 50,
    cursor?: string,
  ) {
    const where: Prisma.AnalyticsSnapshotWhereInput = {
      tenantId,
      type: 'PMIX',
    };
    if (branchId) where.branchId = branchId;
    if (startDate || endDate) {
      where.periodStart = {};
      if (startDate) where.periodStart.gte = startDate;
      if (endDate) where.periodStart.lte = endDate;
    }

    const snapshots = await prisma.analyticsSnapshot.findMany({
      where,
      orderBy: { periodStart: 'desc' },
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    let hasMore = false;
    let nextCursor: string | undefined = undefined;

    if (snapshots.length > limit) {
      hasMore = true;
      const nextItem = snapshots.pop();
      nextCursor = nextItem?.id;
    }

    return { data: snapshots, hasMore, nextCursor };
  }

  static async getLaborToSalesReport(
    tenantId: string,
    branchId?: string,
    startDate?: Date,
    endDate?: Date,
    limit = 50,
    cursor?: string,
  ) {
    const where: Prisma.AnalyticsSnapshotWhereInput = {
      tenantId,
      type: 'LABOR_TO_SALES',
    };
    if (branchId) where.branchId = branchId;
    if (startDate || endDate) {
      where.periodStart = {};
      if (startDate) where.periodStart.gte = startDate;
      if (endDate) where.periodStart.lte = endDate;
    }

    const snapshots = await prisma.analyticsSnapshot.findMany({
      where,
      orderBy: { periodStart: 'desc' },
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    let hasMore = false;
    let nextCursor: string | undefined = undefined;

    if (snapshots.length > limit) {
      hasMore = true;
      const nextItem = snapshots.pop();
      nextCursor = nextItem?.id;
    }

    return { data: snapshots, hasMore, nextCursor };
  }
}
