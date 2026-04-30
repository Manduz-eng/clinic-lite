import { Router } from 'express';
import { NursingController } from './nursing.controller';
import { authenticate } from '../../middleware/auth';
import { requirePermission } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';
import { createNursingNoteSchema, updateNursingNoteSchema } from './nursing.schema';

const router = Router();
const controller = new NursingController();

router.use(authenticate);

router.post('/', requirePermission('nursing', 'create'), validate(createNursingNoteSchema), controller.create);
router.get('/:visitId', requirePermission('nursing', 'read'), controller.findByVisit);
router.put('/:id', requirePermission('nursing', 'update'), validate(updateNursingNoteSchema), controller.update);

export { router as nursingRoutes };
