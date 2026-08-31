import { Router } from 'express';
import { InvoicesController } from './invoices.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', InvoicesController.list);
router.get('/:id', InvoicesController.getById);
router.post('/', InvoicesController.create);
router.put('/:id', InvoicesController.update);
router.patch('/:id/status', InvoicesController.updateStatus);

export default router;
