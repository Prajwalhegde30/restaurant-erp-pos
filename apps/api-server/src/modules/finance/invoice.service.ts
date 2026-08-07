import { prisma } from '@repo/database';

export class InvoiceService {
  static async listInvoices(
    tenantId: string,
    options: { branchId?: string; limit: number; cursor?: string },
  ) {
    const { branchId, limit, cursor } = options;

    const invoices = await prisma.invoice.findMany({
      where: {
        tenantId,
        isDeleted: false,
        ...(branchId ? { branchId } : {}),
      },
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        payments: true,
      },
    });

    const hasMore = invoices.length > limit;
    const data = hasMore ? invoices.slice(0, -1) : invoices;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    return { data, hasMore, nextCursor };
  }

  static async getInvoice(tenantId: string, id: string) {
    return await prisma.invoice.findFirst({
      where: { id, tenantId, isDeleted: false },
      include: {
        payments: true,
        order: {
          include: {
            items: true,
          },
        },
      },
    });
  }
}
