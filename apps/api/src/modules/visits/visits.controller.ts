import { Request, Response, NextFunction } from 'express';
import { VisitService } from './visits.service';
import { AuthenticatedRequest } from '../../shared/types';

const service = new VisitService();

export class VisitController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId, userId } = (req as AuthenticatedRequest).user;
      const visit = await service.create(tenantId, userId, req.body);
      res.status(201).json(visit);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as AuthenticatedRequest).user;
      const result = await service.findAll(tenantId, req.query as any);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as AuthenticatedRequest).user;
      const visit = await service.findById(tenantId, req.params.id);
      res.json(visit);
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as AuthenticatedRequest).user;
      const visit = await service.updateStatus(tenantId, req.params.id, req.body.status);
      res.json(visit);
    } catch (error) {
      next(error);
    }
  }

  async getQueue(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as AuthenticatedRequest).user;
      const queue = await service.getQueue(tenantId, req.query.status as string | undefined);
      res.json(queue);
    } catch (error) {
      next(error);
    }
  }
}
