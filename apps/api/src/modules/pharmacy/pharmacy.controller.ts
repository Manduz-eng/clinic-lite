import { Request, Response, NextFunction } from 'express';
import { PharmacyService } from './pharmacy.service';
import { AuthenticatedRequest } from '../../shared/types';

const service = new PharmacyService();

export class PharmacyController {
  async createDrug(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as AuthenticatedRequest).user;
      const drug = await service.createDrug(tenantId, req.body);
      res.status(201).json(drug);
    } catch (error) {
      next(error);
    }
  }

  async getDrugs(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as AuthenticatedRequest).user;
      const result = await service.getDrugs(tenantId, req.query as any);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateDrug(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as AuthenticatedRequest).user;
      const drug = await service.updateDrug(tenantId, req.params.id, req.body);
      res.json(drug);
    } catch (error) {
      next(error);
    }
  }

  async addStock(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as AuthenticatedRequest).user;
      const stock = await service.addStock(tenantId, req.body);
      res.status(201).json(stock);
    } catch (error) {
      next(error);
    }
  }

  async getStock(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as AuthenticatedRequest).user;
      const stock = await service.getStock(tenantId, req.query.drugId as string | undefined);
      res.json(stock);
    } catch (error) {
      next(error);
    }
  }

  async dispense(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId, userId } = (req as AuthenticatedRequest).user;
      const result = await service.dispense(tenantId, userId, req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getDispensingQueue(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as AuthenticatedRequest).user;
      const queue = await service.getDispensingQueue(tenantId);
      res.json(queue);
    } catch (error) {
      next(error);
    }
  }
}
