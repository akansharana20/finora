import { Router } from 'express';
import { PaymentsController } from './payments.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', PaymentsController.list);
router.post('/', PaymentsController.record);

export default router;
