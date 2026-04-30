import { Router } from 'express';
import { VisitController } from './visits.controller';
import { authenticate } from '../../middleware/auth';
import { requirePermission } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';
import { createVisitSchema, updateVisitStatusSchema } from './visits.schema';

const router = Router();
const controller = new VisitController();

router.use(authenticate);

router.post('/', requirePermission('reception', 'create'), validate(createVisitSchema), controller.create);
router.get('/', requirePermission('reception', 'read'), controller.findAll);
router.get('/queue', requirePermission('reception', 'read'), controller.getQueue);
router.get('/:id', requirePermission('reception', 'read'), controller.findById);
router.put('/:id/status', validate(updateVisitStatusSchema), controller.updateStatus);

export { router as visitRoutes };
