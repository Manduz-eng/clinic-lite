import { Router } from 'express';
import { ProcurementController } from './procurement.controller';
import { authenticate } from '../../middleware/auth';
import { requirePermission } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';
import { createSupplierSchema, updateSupplierSchema, createPurchaseOrderSchema, createGrnSchema, approvePOSchema } from './procurement.schema';

const router = Router();
const controller = new ProcurementController();

router.use(authenticate);

router.post('/suppliers', requirePermission('procurement', 'create'), validate(createSupplierSchema), controller.createSupplier);
router.get('/suppliers', requirePermission('procurement', 'read'), controller.getSuppliers);
router.put('/suppliers/:id', requirePermission('procurement', 'update'), validate(updateSupplierSchema), controller.updateSupplier);

router.post('/purchase-orders', requirePermission('procurement', 'create'), validate(createPurchaseOrderSchema), controller.createPurchaseOrder);
router.get('/purchase-orders', requirePermission('procurement', 'read'), controller.getPurchaseOrders);
router.put('/purchase-orders/:id/approve', requirePermission('procurement', 'approve'), validate(approvePOSchema), controller.approvePO);

router.post('/grn', requirePermission('procurement', 'create'), validate(createGrnSchema), controller.createGRN);
router.get('/grn', requirePermission('procurement', 'read'), controller.getGRNs);

export { router as procurementRoutes };
