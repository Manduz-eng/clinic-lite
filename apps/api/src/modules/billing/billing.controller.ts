import { Request, Response, NextFunction } from 'express';
import { BillingService } from './billing.service';
import { AuthenticatedRequest } from '../../shared/types';

const service = new BillingService();

export class BillingController {
  async generateInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId, userId } = (req as AuthenticatedRequest).user;
      const invoice = await service.generateInvoice(tenantId, userId, req.body);
      res.status(201).json(invoice);
    } catch (error) {
      next(error);
    }
  }

  async getInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as AuthenticatedRequest).user;
      const result = await service.getInvoices(tenantId, req.query as any);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getInvoiceById(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as AuthenticatedRequest).user;
      const invoice = await service.getInvoiceById(tenantId, req.params.id);
      res.json(invoice);
    } catch (error) {
      next(error);
    }
  }

  async recordPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId, userId } = (req as AuthenticatedRequest).user;
      const payment = await service.recordPayment(tenantId, userId, req.body);
      res.status(201).json(payment);
    } catch (error) {
      next(error);
    }
  }

  async getPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as AuthenticatedRequest).user;
      const payments = await service.getPayments(tenantId, req.params.invoiceId);
      res.json(payments);
    } catch (error) {
      next(error);
    }
  }
}
