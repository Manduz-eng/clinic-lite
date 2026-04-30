import { Router } from 'express';
import { AccountsController } from './accounts.controller';
import { authenticate } from '../../middleware/auth';
import { requirePermission } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';
import { createExpenseCategorySchema, createExpenseSchema, approveExpenseSchema } from './accounts.schema';

const router = Router();
const controller = new AccountsController();

router.use(authenticate);

router.post('/expense-categories', requirePermission('accounts', 'create'), validate(createExpenseCategorySchema), controller.createExpenseCategory);
router.get('/expense-categories', requirePermission('accounts', 'read'), controller.getExpenseCategories);

router.post('/expenses', requirePermission('accounts', 'create'), validate(createExpenseSchema), controller.createExpense);
router.get('/expenses', requirePermission('accounts', 'read'), controller.getExpenses);
router.put('/expenses/:id/approve', requirePermission('accounts', 'approve'), validate(approveExpenseSchema), controller.approveExpense);

router.get('/ledger', requirePermission('accounts', 'read'), controller.getLedger);
router.get('/reports/daily-revenue', requirePermission('accounts', 'read'), controller.getDailyRevenue);
router.get('/reports/revenue', requirePermission('accounts', 'read'), controller.getRevenueReport);

export { router as accountsRoutes };
