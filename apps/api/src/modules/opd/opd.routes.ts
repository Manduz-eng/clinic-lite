import { Router } from 'express';
import { OpdController } from './opd.controller';
import { authenticate } from '../../middleware/auth';
import { requirePermission } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';
import { createClinicalNoteSchema, createPrescriptionSchema, updateClinicalNoteSchema } from './opd.schema';

const router = Router();
const controller = new OpdController();

router.use(authenticate);

router.post('/clinical-notes', requirePermission('opd', 'create'), validate(createClinicalNoteSchema), controller.createClinicalNote);
router.get('/clinical-notes/:visitId', requirePermission('opd', 'read'), controller.getClinicalNote);
router.put('/clinical-notes/:id', requirePermission('opd', 'update'), validate(updateClinicalNoteSchema), controller.updateClinicalNote);

router.post('/prescriptions', requirePermission('opd', 'create'), validate(createPrescriptionSchema), controller.createPrescription);
router.get('/prescriptions/:visitId', requirePermission('opd', 'read'), controller.getPrescriptions);

export { router as opdRoutes };
