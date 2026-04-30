import { Router } from 'express';
import { InventoryController } from './inventory.controller';
import { authenticate } from '../../middleware/auth';
import { requirePermission } from '../../middleware/rbac';

const router = Router();
const controller = new InventoryController();

router.use(authenticate);

router.get('/stock-summary', requirePermission('inventory', 'read'), controller.getStockSummary);
router.post('/check-alerts', requirePermission('inventory', 'create'), controller.checkAlerts);
router.get('/alerts', requirePermission('inventory', 'read'), controller.getAlerts);
router.put('/alerts/:id/resolve', requirePermission('inventory', 'update'), controller.resolveAlert);

export { router as inventoryRoutes };
