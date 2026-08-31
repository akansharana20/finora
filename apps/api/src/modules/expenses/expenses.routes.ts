import { Router } from 'express';
import { ExpensesController } from './expenses.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', ExpensesController.list);
router.get('/:id', ExpensesController.getById);
router.post('/', ExpensesController.create);
router.delete('/:id', ExpensesController.delete);

export default router;
