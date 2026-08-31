import { Router } from 'express';
import { CustomersController } from './customers.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', CustomersController.list);
router.get('/:id', CustomersController.getById);
router.post('/', CustomersController.create);
router.put('/:id', CustomersController.update);

export default router;
