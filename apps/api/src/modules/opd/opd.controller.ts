import { Request, Response, NextFunction } from 'express';
import { OpdService } from './opd.service';
import { AuthenticatedRequest } from '../../shared/types';

const service = new OpdService();

export class OpdController {
  async createClinicalNote(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId, userId } = (req as AuthenticatedRequest).user;
      const note = await service.createClinicalNote(tenantId, userId, req.body);
      res.status(201).json(note);
    } catch (error) {
      next(error);
    }
  }

  async getClinicalNote(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as AuthenticatedRequest).user;
      const note = await service.getClinicalNote(tenantId, req.params.visitId);
      res.json(note);
    } catch (error) {
      next(error);
    }
  }

  async updateClinicalNote(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as AuthenticatedRequest).user;
      const note = await service.updateClinicalNote(tenantId, req.params.id, req.body);
      res.json(note);
    } catch (error) {
      next(error);
    }
  }

  async createPrescription(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId, userId } = (req as AuthenticatedRequest).user;
      const rx = await service.createPrescription(tenantId, userId, req.body);
      res.status(201).json(rx);
    } catch (error) {
      next(error);
    }
  }

  async getPrescriptions(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as AuthenticatedRequest).user;
      const prescriptions = await service.getPrescriptions(tenantId, req.params.visitId);
      res.json(prescriptions);
    } catch (error) {
      next(error);
    }
  }
}
