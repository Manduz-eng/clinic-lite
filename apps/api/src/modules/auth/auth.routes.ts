import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';
import { registerTenantSchema, loginSchema, refreshTokenSchema, createUserSchema } from './auth.schema';

const router = Router();
const controller = new AuthController();

router.post('/register', validate(registerTenantSchema), controller.register);
router.post('/login', validate(loginSchema), controller.login);
router.post('/refresh', validate(refreshTokenSchema), controller.refresh);
router.get('/me', authenticate, controller.getMe);
router.post('/users', authenticate, requireRole('Admin'), validate(createUserSchema), controller.createUser);
router.get('/users', authenticate, requireRole('Admin'), controller.getUsers);
router.get('/roles', authenticate, controller.getRoles);

export { router as authRoutes };
