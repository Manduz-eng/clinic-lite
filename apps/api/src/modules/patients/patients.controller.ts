import { Request, Response, NextFunction } from 'express';
import { PatientService } from './patients.service';
import { AuthenticatedRequest } from '../../shared/types';

const service = new PatientService();

export class PatientController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as AuthenticatedRequest).user;
      const patient = await service.create(tenantId, req.body);
      res.status(201).json(patient);
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
      const patient = await service.findById(tenantId, req.params.id);
      res.json(patient);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as AuthenticatedRequest).user;
      const patient = await service.update(tenantId, req.params.id, req.body);
      res.json(patient);
    } catch (error) {
      next(error);
    }
  }
}
