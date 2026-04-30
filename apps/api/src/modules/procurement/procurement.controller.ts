import { Request, Response, NextFunction } from 'express';
import { ProcurementService } from './procurement.service';
import { AuthenticatedRequest } from '../../shared/types';

const service = new ProcurementService();

export class ProcurementController {
  async createSupplier(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as AuthenticatedRequest).user;
      const supplier = await service.createSupplier(tenantId, req.body);
      res.status(201).json(supplier);
    } catch (error) {
      next(error);
    }
  }

  async getSuppliers(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as AuthenticatedRequest).user;
      const suppliers = await service.getSuppliers(tenantId);
      res.json(suppliers);
    } catch (error) {
      next(error);
    }
  }

  async updateSupplier(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as AuthenticatedRequest).user;
      const supplier = await service.updateSupplier(tenantId, req.params.id, req.body);
      res.json(supplier);
    } catch (error) {
      next(error);
    }
  }

  async createPurchaseOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId, userId } = (req as AuthenticatedRequest).user;
      const po = await service.createPurchaseOrder(tenantId, userId, req.body);
      res.status(201).json(po);
    } catch (error) {
      next(error);
    }
  }

  async getPurchaseOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as AuthenticatedRequest).user;
      const result = await service.getPurchaseOrders(tenantId, req.query as any);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async approvePO(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId, userId } = (req as AuthenticatedRequest).user;
      const po = await service.approvePO(tenantId, req.params.id, userId, req.body.status);
      res.json(po);
    } catch (error) {
      next(error);
    }
  }

  async createGRN(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId, userId } = (req as AuthenticatedRequest).user;
      const grn = await service.createGRN(tenantId, userId, req.body);
      res.status(201).json(grn);
    } catch (error) {
      next(error);
    }
  }

  async getGRNs(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as AuthenticatedRequest).user;
      const grns = await service.getGRNs(tenantId);
      res.json(grns);
    } catch (error) {
      next(error);
    }
  }
}
