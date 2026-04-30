import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';

interface PermissionCheck {
  module: string;
  action: string;
}

export function requirePermission(module: string, action: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    try {
      const rolePermission = await prisma.rolePermission.findFirst({
        where: {
          roleId: req.user.roleId,
          permission: {
            module,
            action,
          },
        },
      });

      if (!rolePermission) {
        res.status(403).json({
          error: 'Insufficient permissions',
          required: { module, action },
        });
        return;
      }

      next();
    } catch {
      res.status(500).json({ error: 'Permission check failed' });
    }
  };
}

export function requireRole(...roleNames: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!roleNames.includes(req.user.roleName)) {
      res.status(403).json({
        error: 'Insufficient role privileges',
        required: roleNames,
      });
      return;
    }

    next();
  };
}
