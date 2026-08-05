import { prisma } from '@repo/database';

export class LedgerService {
  static async getJournalEntries(
    tenantId: string,
    filters: { journalId?: string; ledgerAccountId?: string },
  ) {
    const where: Record<string, string> = { tenantId };

    if (filters.journalId) {
      where.journalId = filters.journalId;
    }
    if (filters.ledgerAccountId) {
      where.ledgerAccountId = filters.ledgerAccountId;
    }

    return await prisma.journalEntry.findMany({
      where,
      include: {
        ledgerAccount: {
          select: { name: true, code: true, type: true },
        },
        journal: {
          select: { description: true, referenceId: true, postedAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  static async getLedgerAccounts(tenantId: string) {
    return await prisma.ledgerAccount.findMany({
      where: { tenantId, isDeleted: false },
      orderBy: { code: 'asc' },
    });
  }
}
