import { Request, Response, NextFunction } from 'express';
import { InventoryService } from './inventory.service';
import { AuthenticatedRequest } from '../../shared/types';

const service = new InventoryService();

export class InventoryController {
  async getStockSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as AuthenticatedRequest).user;
      const summary = await service.getStockSummary(tenantId);
      res.json(summary);
    } catch (error) {
      next(error);
    }
  }

  async checkAlerts(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as AuthenticatedRequest).user;
      const alerts = await service.checkAndCreateAlerts(tenantId);
      res.json(alerts);
    } catch (error) {
      next(error);
    }
  }

  async getAlerts(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as AuthenticatedRequest).user;
      const resolved = req.query.resolved === 'true' ? true : req.query.resolved === 'false' ? false : undefined;
      const alerts = await service.getAlerts(tenantId, resolved);
      res.json(alerts);
    } catch (error) {
      next(error);
    }
  }

  async resolveAlert(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as AuthenticatedRequest).user;
      const alert = await service.resolveAlert(tenantId, req.params.id);
      res.json(alert);
    } catch (error) {
      next(error);
    }
  }
}
