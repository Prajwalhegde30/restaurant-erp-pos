/**
 * @repo/database — Public Entry Point
 *
 * This barrel file exports the Prisma Client instance and all generated types.
 * It is the Single Source of Truth for all database access in the monorepo.
 * Reference: docs/Architecture.md §5.3 — @repo/database
 * Reference: docs/CodingStandards.md §13 — Prisma Standards
 */

export { PrismaClient } from '@prisma/client';
export type * from '@prisma/client';
