import { Router } from 'express';
import { SuppliersController } from './suppliers.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', SuppliersController.list);
router.get('/:id', SuppliersController.getById);
router.post('/', SuppliersController.create);
router.put('/:id', SuppliersController.update);

export default router;
