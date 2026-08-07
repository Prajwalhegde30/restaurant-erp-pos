import { Response, NextFunction } from 'express';
import { SettingsService } from './settings.service';
import { AuthRequest } from '@repo/auth';
import { ConfigurationSchema } from '@repo/types';

const UpsertConfigurationDto = ConfigurationSchema.pick({
  level: true,
  key: true,
  value: true,
  branchId: true,
  stationId: true,
});

export class SettingsController {
  /**
   * Upsert a setting
   */
  static async upsert(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      const data = UpsertConfigurationDto.parse(req.body);

      // Validate level constraints
      if (data.level === 'GLOBAL' && req.user?.id !== 'SUPERADMIN_OR_SIMILAR') {
        // Just as an example, typically you'd let RBAC handle this via 'global_settings.manage'
        // For now, we allow it if they have the permission applied on the route
      }

      const config = await SettingsService.upsertConfiguration(
        data.level,
        data.key,
        data.value,
        data.level === 'GLOBAL' ? null : tenantId, // GLOBAL ignores tenantId
        data.branchId,
        data.stationId,
      );

      res.status(200).json(config);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get all raw settings
   */
  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      const configs = await SettingsService.getConfigurations(tenantId);

      res.status(200).json({
        data: configs,
        has_more: false,
        next_cursor: null,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Delete a setting
   */
  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      await SettingsService.deleteConfiguration(tenantId, req.params.id);

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  /**
   * Resolve settings for the current context
   */
  static async resolve(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      const { branchId, stationId, key } = req.query;

      const resolved = await SettingsService.resolveConfiguration(
        tenantId,
        branchId as string | undefined,
        stationId as string | undefined,
        key as string | undefined,
      );

      res.status(200).json({
        data: resolved,
      });
    } catch (err) {
      next(err);
    }
  }
}
