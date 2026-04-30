import { Request, Response, NextFunction } from 'express';
import { AccountsService } from './accounts.service';
import { AuthenticatedRequest } from '../../shared/types';

const service = new AccountsService();

export class AccountsController {
  async createExpenseCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as AuthenticatedRequest).user;
      const category = await service.createExpenseCategory(tenantId, req.body);
      res.status(201).json(category);
    } catch (error) {
      next(error);
    }
  }

  async getExpenseCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as AuthenticatedRequest).user;
      const categories = await service.getExpenseCategories(tenantId);
      res.json(categories);
    } catch (error) {
      next(error);
    }
  }

  async createExpense(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId, userId } = (req as AuthenticatedRequest).user;
      const expense = await service.createExpense(tenantId, userId, req.body);
      res.status(201).json(expense);
    } catch (error) {
      next(error);
    }
  }

  async getExpenses(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as AuthenticatedRequest).user;
      const result = await service.getExpenses(tenantId, req.query as any);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async approveExpense(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId, userId } = (req as AuthenticatedRequest).user;
      const expense = await service.approveExpense(tenantId, req.params.id, userId, req.body.status);
      res.json(expense);
    } catch (error) {
      next(error);
    }
  }

  async getLedger(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as AuthenticatedRequest).user;
      const ledger = await service.getLedger(tenantId, req.query as any);
      res.json(ledger);
    } catch (error) {
      next(error);
    }
  }

  async getDailyRevenue(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as AuthenticatedRequest).user;
      const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
      const report = await service.getDailyRevenue(tenantId, date);
      res.json(report);
    } catch (error) {
      next(error);
    }
  }

  async getRevenueReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as AuthenticatedRequest).user;
      const { startDate, endDate } = req.query as any;
      const report = await service.getRevenueReport(tenantId, startDate, endDate);
      res.json(report);
    } catch (error) {
      next(error);
    }
  }
}
