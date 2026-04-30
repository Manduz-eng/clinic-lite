import { Router } from 'express';
import { MpesaController } from './mpesa.controller';
import { authenticate } from '../../middleware/auth';
import { requirePermission } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';
import { stkPushSchema } from './mpesa.schema';

const router = Router();
const controller = new MpesaController();

router.post('/stk-push', authenticate, requirePermission('billing', 'create'), validate(stkPushSchema), controller.stkPush);
router.post('/callback', controller.callback);
router.get('/status/:checkoutRequestId', authenticate, controller.getStatus);

export { router as mpesaRoutes };
