import { Router } from 'express';
import { FirmsController } from './firms.controller';
import { authenticate } from '../../middleware/auth';
import { authorizeRoles } from '../../middleware/rbac';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

// Current Firm Profile & Users
router.get('/profile', FirmsController.getProfile);
router.put('/profile', FirmsController.updateProfile);
router.get('/users', FirmsController.getUsers);

// Admin-Only Multi-Company Management
router.get('/', FirmsController.list);
router.post('/', authorizeRoles(Role.ADMIN), FirmsController.create);
router.get('/:id/users', FirmsController.getFirmUsers);
router.get('/:id', FirmsController.getById);
router.put('/:id', FirmsController.update);
router.patch('/:id/status', FirmsController.setStatus);
router.put('/:id/users/:userId', FirmsController.assignUser);
router.delete('/:id/users/:userId', FirmsController.removeUserAssignment);
router.delete('/:id', FirmsController.remove);

export default router;
