import { Router } from 'express';
import { PharmacyController } from './pharmacy.controller';
import { authenticate } from '../../middleware/auth';
import { requirePermission } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';
import { createDrugSchema, updateDrugSchema, addStockSchema, dispenseSchema } from './pharmacy.schema';

const router = Router();
const controller = new PharmacyController();

router.use(authenticate);

router.post('/drugs', requirePermission('pharmacy', 'create'), validate(createDrugSchema), controller.createDrug);
router.get('/drugs', requirePermission('pharmacy', 'read'), controller.getDrugs);
router.put('/drugs/:id', requirePermission('pharmacy', 'update'), validate(updateDrugSchema), controller.updateDrug);

router.post('/stock', requirePermission('pharmacy', 'create'), validate(addStockSchema), controller.addStock);
router.get('/stock', requirePermission('pharmacy', 'read'), controller.getStock);

router.post('/dispense', requirePermission('pharmacy', 'create'), validate(dispenseSchema), controller.dispense);
router.get('/dispensing-queue', requirePermission('pharmacy', 'read'), controller.getDispensingQueue);

export { router as pharmacyRoutes };
