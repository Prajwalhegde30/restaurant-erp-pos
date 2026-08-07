import { Response, NextFunction, Request } from 'express';
import { prisma } from '@repo/database';
import { signTokenPair, loadJwtConfig } from '@repo/auth';
import { z } from 'zod';

const LoginSchema = z.object({
  email: z.string().email(),
  pin: z.string(),
});

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = LoginSchema.parse(req.body);

      const user = await prisma.user.findFirst({
        where: {
          email: data.email,
          isDeleted: false,
        },
        include: {
          userRoles: {
            where: { isDeleted: false },
          },
          branchAssignments: {
            where: { isDeleted: false },
          },
        },
      });

      if (!user) {
        return res.status(401).json({ error: { message: 'Invalid credentials' } });
      }

      if (user.pin !== data.pin) {
        return res.status(401).json({ error: { message: 'Invalid credentials' } });
      }

      const primaryRole = user.userRoles[0]?.roleId;
      const primaryBranch = user.branchAssignments[0]?.branchId || null;

      if (!primaryRole) {
        return res.status(403).json({ error: { message: 'User has no assigned roles' } });
      }

      const config = loadJwtConfig();
      const tokenPair = signTokenPair(
        {
          sub: user.id,
          tenantId: user.tenantId,
          roleId: primaryRole,
          branchId: primaryBranch,
        },
        config,
      );

      res.status(200).json(tokenPair);
    } catch (err) {
      next(err);
    }
  }
}
