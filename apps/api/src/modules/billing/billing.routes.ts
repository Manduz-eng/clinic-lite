import { Router } from 'express';
import { BillingController } from './billing.controller';
import { authenticate } from '../../middleware/auth';
import { requirePermission } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';
import { generateInvoiceSchema, recordPaymentSchema } from './billing.schema';

const router = Router();
const controller = new BillingController();

router.use(authenticate);

router.post('/invoices', requirePermission('billing', 'create'), validate(generateInvoiceSchema), controller.generateInvoice);
router.get('/invoices', requirePermission('billing', 'read'), controller.getInvoices);
router.get('/invoices/:id', requirePermission('billing', 'read'), controller.getInvoiceById);

router.post('/payments', requirePermission('billing', 'create'), validate(recordPaymentSchema), controller.recordPayment);
router.get('/payments/:invoiceId', requirePermission('billing', 'read'), controller.getPayments);

export { router as billingRoutes };
