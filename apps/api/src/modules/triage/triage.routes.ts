import { Router } from 'express';
import { TriageController } from './triage.controller';
import { authenticate } from '../../middleware/auth';
import { requirePermission } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';
import { createVitalsSchema, updateVitalsSchema } from './triage.schema';

const router = Router();
const controller = new TriageController();

router.use(authenticate);

router.post('/', requirePermission('triage', 'create'), validate(createVitalsSchema), controller.create);
router.get('/:visitId', requirePermission('triage', 'read'), controller.findByVisit);
router.put('/:id', requirePermission('triage', 'update'), validate(updateVitalsSchema), controller.update);

export { router as triageRoutes };
