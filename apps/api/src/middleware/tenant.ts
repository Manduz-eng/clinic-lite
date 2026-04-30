import { Request, Response, NextFunction } from 'express';

export function tenantContext(req: Request, res: Response, next: NextFunction): void {
  if (!req.user?.tenantId) {
    res.status(400).json({ error: 'Tenant context required' });
    return;
  }
  next();
}
