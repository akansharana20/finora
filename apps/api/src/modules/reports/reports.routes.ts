import { Router } from 'express';
import { ReportsController } from './reports.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/dashboard', ReportsController.getDashboard);
router.get('/revenue', ReportsController.getRevenue);
router.get('/expense', ReportsController.getExpense);
router.get('/vat', ReportsController.getVat);

export default router;
