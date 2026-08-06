import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/logger.middleware';
import { ShiftService } from './shift.service';
import { OpenShiftSchema, CloseShiftSchema } from './shift.schema';

export class ShiftController {
  static async open(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const branchId = req.branchId!;
      const userId = req.user!.id;

      const data = OpenShiftSchema.parse(req.body);

      const result = await ShiftService.openShift(tenantId, branchId, userId, data.openingFloat);

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

      const data = CloseShiftSchema.parse(req.body);

      const result = await ShiftService.closeShift(
        tenantId,
        branchId,
        userId,
        id,
        data.actualCash,
        data.closingFloat,
      );

      return res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }
}
