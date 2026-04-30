import { Request, Response, NextFunction } from 'express';
import { MpesaService } from './mpesa.service';
import { AuthenticatedRequest } from '../../shared/types';

const service = new MpesaService();

export class MpesaController {
  async stkPush(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as AuthenticatedRequest).user;
      const result = await service.initiateSTKPush(tenantId, req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async callback(req: Request, res: Response, next: NextFunction) {
    try {
      await service.handleCallback(req.body);
      res.json({ ResultCode: 0, ResultDesc: 'Success' });
    } catch (error) {
      console.error('M-Pesa callback error:', error);
      res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }
  }

  async getStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = (req as AuthenticatedRequest).user;
      const tx = await service.getTransactionStatus(tenantId, req.params.checkoutRequestId);
      res.json(tx);
    } catch (error) {
      next(error);
    }
  }
}
