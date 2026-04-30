import { Request, Response, NextFunction } from 'express';
import { LaboratoryService } from './laboratory.service';
import { AuthenticatedRequest } from '../../shared/types';

const service = new LaboratoryService();

export class LaboratoryController {
  async createTest(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as AuthenticatedRequest).user;
      const test = await service.createTest(tenantId, req.body);
      res.status(201).json(test);
    } catch (error) {
      next(error);
    }
  }

  async getTests(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as AuthenticatedRequest).user;
      const tests = await service.getTests(tenantId);
      res.json(tests);
    } catch (error) {
      next(error);
    }
  }

  async createRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId, userId } = (req as AuthenticatedRequest).user;
      const request = await service.createRequest(tenantId, userId, req.body);
      res.status(201).json(request);
    } catch (error) {
      next(error);
    }
  }

  async getRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as AuthenticatedRequest).user;
      const result = await service.getRequests(tenantId, req.query as any);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateRequestStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as AuthenticatedRequest).user;
      const request = await service.updateRequestStatus(tenantId, req.params.id, req.body.status);
      res.json(request);
    } catch (error) {
      next(error);
    }
  }

  async createResult(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId, userId } = (req as AuthenticatedRequest).user;
      const result = await service.createResult(tenantId, userId, req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getResult(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as AuthenticatedRequest).user;
      const result = await service.getResult(tenantId, req.params.requestId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
