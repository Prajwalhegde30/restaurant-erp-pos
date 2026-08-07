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

  static async postJournal(
    tenantId: string,
    userId: string,
    data: {
      description: string;
      referenceId?: string;
      referenceType?: string;
      entries: {
        ledgerAccountId: string;
        entryType: 'DEBIT' | 'CREDIT';
        amount: number;
        description?: string;
      }[];
    },
  ) {
    // 1. Fiscal Period Validation
    const now = new Date();
    const activePeriod = await prisma.fiscalPeriod.findFirst({
      where: {
        tenantId,
        isClosed: false,
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });

    if (!activePeriod) {
      throw new Error('No open Fiscal Period exists for the current date. Cannot post journal.');
    }

    // 2. Ledger Accounts Validation
    const accountIds = data.entries.map((e) => e.ledgerAccountId);
    const uniqueAccountIds = [...new Set(accountIds)];
    const accounts = await prisma.ledgerAccount.findMany({
      where: {
        tenantId,
        id: { in: uniqueAccountIds },
        isDeleted: false,
      },
    });

    if (accounts.length !== uniqueAccountIds.length) {
      throw new Error('One or more referenced Ledger Accounts do not exist or are deleted.');
    }

    // 3. Atomically Post the Journal
    return await prisma.$transaction(async (tx) => {
      const journal = await tx.journal.create({
        data: {
          tenantId,
          description: data.description,
          referenceId: data.referenceId,
          referenceType: data.referenceType,
          isPosted: true,
          postedAt: new Date(),
          createdBy: userId,
          updatedBy: userId,
          journalEntries: {
            create: data.entries.map((entry) => ({
              tenantId,
              ledgerAccountId: entry.ledgerAccountId,
              entryType: entry.entryType,
              amount: entry.amount,
              description: entry.description,
              createdBy: userId,
            })),
          },
        },
        include: {
          journalEntries: true,
        },
      });

      return journal;
    });
  }
}
