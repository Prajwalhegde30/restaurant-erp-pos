import { prisma } from '@repo/database';
import { AnalyticsSnapshotType, Prisma } from '@repo/types/src/generated';

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
      type: AnalyticsSnapshotType.PMIX,
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
      type: AnalyticsSnapshotType.LABOR_TO_SALES,
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
