import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/logger.middleware';
import { DailyClosingService } from './daily-closing.service';
import { OpenDaySchema, CloseDaySchema } from './daily-closing.schema';

export class DailyClosingController {
  static async open(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const branchId = req.branchId!;

      const data = OpenDaySchema.parse(req.body);
      const closingDate = data.closingDate ? new Date(data.closingDate) : undefined;

      const result = await DailyClosingService.openDay(tenantId, branchId, closingDate);

      return res.status(201).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  static async close(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const branchId = req.branchId!;
      const userId = req.user!.id;
      const { id } = req.params;

      const data = CloseDaySchema.parse(req.body);

      const result = await DailyClosingService.closeDay(tenantId, branchId, id, userId, data.notes);

      return res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }
}
