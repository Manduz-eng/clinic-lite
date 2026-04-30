import { Request, Response, NextFunction } from 'express';
import { TriageService } from './triage.service';
import { AuthenticatedRequest } from '../../shared/types';

const service = new TriageService();

export class TriageController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId, userId } = (req as AuthenticatedRequest).user;
      const vitals = await service.create(tenantId, userId, req.body);
      res.status(201).json(vitals);
    } catch (error) {
      next(error);
    }
  }

  async findByVisit(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as AuthenticatedRequest).user;
      const vitals = await service.findByVisit(tenantId, req.params.visitId);
      res.json(vitals);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as AuthenticatedRequest).user;
      const vitals = await service.update(tenantId, req.params.id, req.body);
      res.json(vitals);
    } catch (error) {
      next(error);
    }
  }
}
