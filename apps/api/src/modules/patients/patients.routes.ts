import { Router } from 'express';
import { PatientController } from './patients.controller';
import { authenticate } from '../../middleware/auth';
import { requirePermission } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';
import { createPatientSchema, updatePatientSchema } from './patients.schema';

const router = Router();
const controller = new PatientController();

router.use(authenticate);

router.post('/', requirePermission('reception', 'create'), validate(createPatientSchema), controller.create);
router.get('/', requirePermission('reception', 'read'), controller.findAll);
router.get('/:id', requirePermission('reception', 'read'), controller.findById);
router.put('/:id', requirePermission('reception', 'update'), validate(updatePatientSchema), controller.update);
router.delete('/:id', requirePermission('reception', 'delete'), controller.delete);
router.put('/:id/status', requirePermission('reception', 'update'), controller.updateStatus);

export { router as patientRoutes };
