/**
 * @repo/database — Public Entry Point
 *
 * Exports the PrismaClient singleton and all generated Prisma types.
 *
 * Rules:
 * - CodingStandards.md §4  — All shared packages must export via an index.ts barrier file.
 * - CodingStandards.md §12 — Every mutation transaction uses this shared client.
 * - CodingStandards.md §13 — No Prisma imports outside @repo/database.
 *
 * Singleton pattern prevents connection pool exhaustion in long-running processes
 * and across Next.js hot-reload cycles in development.
 *
 * References:
 *   docs/Architecture.md    — §5.3 @repo/database bounded context
 *   docs/CodingStandards.md — §4 TurboRepo Standards, §12 Database Coding Standards
 *   docs/DatabaseSchema.md  — §7 Multi-Tenant Strategy (tenant_id required in every query)
 */
import { PrismaClient } from '@prisma/client';
/**
 * The single authoritative PrismaClient instance for the entire monorepo.
 *
 * The globalThis guard ensures:
 * - One connection pool per process in production.
 * - The same instance survives Next.js hot-reload cycles in development,
 *   preventing "Too many connections" errors.
 *
 * Usage:
 *   import { prisma } from '@repo/database';
 *   const orders = await prisma.order.findMany({ where: { tenantId } });
 */
export const prisma = globalThis.__prisma ?? new PrismaClient();
// Persist the instance on globalThis so hot-reloads reuse the same pool.
// In production runtimes (workers, serverless) this is a no-op because the
// module is only evaluated once per process lifetime.
globalThis.__prisma = prisma;
// Re-export PrismaClient class for consumers that need to type-annotate
export { PrismaClient } from '@prisma/client';
