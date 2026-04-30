import { Request, Response, NextFunction } from 'express';
import { NursingService } from './nursing.service';
import { AuthenticatedRequest } from '../../shared/types';

const service = new NursingService();

export class NursingController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId, userId } = (req as AuthenticatedRequest).user;
      const note = await service.create(tenantId, userId, req.body);
      res.status(201).json(note);
    } catch (error) {
      next(error);
    }
  }

  async findByVisit(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as AuthenticatedRequest).user;
      const notes = await service.findByVisit(tenantId, req.params.visitId);
      res.json(notes);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as AuthenticatedRequest).user;
      const note = await service.update(tenantId, req.params.id, req.body);
      res.json(note);
    } catch (error) {
      next(error);
    }
  }
}
