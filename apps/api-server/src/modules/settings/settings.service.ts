import { prisma, ConfigurationLevel, Prisma } from '@repo/database';

export class SettingsService {
  /**
   * Upsert a configuration setting
   */
  static async upsertConfiguration(
    level: ConfigurationLevel,
    key: string,
    value: Prisma.InputJsonValue,
    tenantId?: string | null,
    branchId?: string | null,
    stationId?: string | null,
  ) {
    // Determine the unique constraint fields based on Prisma unique index
    // @@unique([key, level, tenantId, branchId, stationId])
    // Note: Prisma unique requires handling nulls properly if they are in a composite index,
    // but Prisma's `upsert` with composite unique index including nulls can be tricky.
    // It's often safer to findFirst and then create/update.

    const existing = await prisma.configuration.findFirst({
      where: {
        key,
        level,
        tenantId: tenantId || null,
        branchId: branchId || null,
        stationId: stationId || null,
      },
    });

    if (existing) {
      return await prisma.configuration.update({
        where: { id: existing.id },
        data: { value, isDeleted: false, deletedAt: null },
      });
    }

    return await prisma.configuration.create({
      data: {
        key,
        level,
        value,
        tenantId: tenantId || null,
        branchId: branchId || null,
        stationId: stationId || null,
      },
    });
  }

  /**
   * Get all raw configurations for a tenant
   */
  static async getConfigurations(tenantId: string) {
    return await prisma.configuration.findMany({
      where: {
        OR: [{ tenantId }, { level: 'GLOBAL' }],
        isDeleted: false,
      },
      orderBy: [{ level: 'asc' }, { key: 'asc' }],
    });
  }

  /**
   * Soft delete a configuration
   */
  static async deleteConfiguration(tenantId: string, configId: string) {
    return await prisma.configuration.updateMany({
      where: {
        id: configId,
        tenantId,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  /**
   * Resolve configuration for a given context (Deep Merge)
   * Priority: GLOBAL -> TENANT -> BRANCH -> STATION
   */
  static async resolveConfiguration(
    tenantId: string,
    branchId?: string | null,
    stationId?: string | null,
    key?: string,
  ) {
    const whereClause: Prisma.ConfigurationWhereInput = {
      isDeleted: false,
      OR: [{ level: 'GLOBAL' }, { level: 'TENANT', tenantId }],
    };

    if (branchId) {
      (whereClause.OR as Prisma.ConfigurationWhereInput[]).push({
        level: 'BRANCH',
        tenantId,
        branchId,
      });
    }

    if (stationId) {
      (whereClause.OR as Prisma.ConfigurationWhereInput[]).push({
        level: 'STATION',
        tenantId,
        branchId,
        stationId,
      });
    }

    if (key) {
      whereClause.key = key;
    }

    const configs = await prisma.configuration.findMany({
      where: whereClause,
    });

    // Sort by priority manually to ensure correct merge order
    const priority = {
      GLOBAL: 1,
      TENANT: 2,
      BRANCH: 3,
      STATION: 4,
    };

    configs.sort((a, b) => priority[a.level] - priority[b.level]);

    // Group by key and deep merge
    const resolved: Record<string, unknown> = {};

    for (const config of configs) {
      if (!resolved[config.key]) {
        resolved[config.key] = config.value;
      } else {
        // Simple deep merge logic
        resolved[config.key] = this.deepMerge(resolved[config.key], config.value);
      }
    }

    // If a specific key was requested, return just its value, otherwise return all resolved
    if (key) {
      return resolved[key] || null;
    }

    return resolved;
  }

  /**
   * Simple Deep Merge utility for JSONB objects
   */
  private static deepMerge(target: unknown, source: unknown): unknown {
    if (
      typeof target === 'object' &&
      target !== null &&
      !Array.isArray(target) &&
      typeof source === 'object' &&
      source !== null &&
      !Array.isArray(source)
    ) {
      const merged: Record<string, unknown> = { ...(target as Record<string, unknown>) };
      for (const key of Object.keys(source as Record<string, unknown>)) {
        const srcVal = (source as Record<string, unknown>)[key];
        if (srcVal instanceof Object && key in (target as Record<string, unknown>)) {
          merged[key] = this.deepMerge((target as Record<string, unknown>)[key], srcVal);
        } else {
          merged[key] = srcVal;
        }
      }
      return merged;
    }
    return source; // If not objects, source simply replaces target
  }
}
