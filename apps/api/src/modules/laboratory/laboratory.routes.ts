import { Router } from 'express';
import { LaboratoryController } from './laboratory.controller';
import { authenticate } from '../../middleware/auth';
import { requirePermission } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';
import { createLabTestSchema, createLabRequestSchema, createLabResultSchema, updateLabRequestStatusSchema } from './laboratory.schema';

const router = Router();
const controller = new LaboratoryController();

router.use(authenticate);

router.post('/tests', requirePermission('laboratory', 'create'), validate(createLabTestSchema), controller.createTest);
router.get('/tests', requirePermission('laboratory', 'read'), controller.getTests);

router.post('/requests', requirePermission('laboratory', 'create'), validate(createLabRequestSchema), controller.createRequest);
router.get('/requests', requirePermission('laboratory', 'read'), controller.getRequests);
router.put('/requests/:id/status', requirePermission('laboratory', 'update'), validate(updateLabRequestStatusSchema), controller.updateRequestStatus);

router.post('/results', requirePermission('laboratory', 'create'), validate(createLabResultSchema), controller.createResult);
router.get('/results/:requestId', requirePermission('laboratory', 'read'), controller.getResult);

export { router as laboratoryRoutes };
