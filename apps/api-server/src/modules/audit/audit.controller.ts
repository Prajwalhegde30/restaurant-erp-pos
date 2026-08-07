import { Response, NextFunction } from 'express';
import { AuditService } from './audit.service';
import { AuthRequest } from '@repo/auth';

export class AuditController {
  static async getLogs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const cursor = req.query.cursor as string | undefined;
      const branchId = req.query.branchId as string | undefined;
      const userId = req.query.userId as string | undefined;
      const action = req.query.action as string | undefined;
      const search = req.query.search as string | undefined;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      const result = await AuditService.getAuditLogs(tenantId, {
        branchId,
        userId,
        action,
        search,
        startDate,
        endDate,
        limit,
        cursor,
      });

      res.status(200).json({
        data: result.data,
        has_more: result.hasMore,
        next_cursor: result.nextCursor,
      });
    } catch (err) {
      next(err);
    }
  }
}
