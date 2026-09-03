import { Router } from 'express';
import { FirmsController } from './firms.controller';
import { authenticate } from '../../middleware/auth';
import { authorizeRoles } from '../../middleware/rbac';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

// Current Firm Profile & Users
router.get('/profile', FirmsController.getProfile);
router.put('/profile', authorizeRoles(Role.ADMIN), FirmsController.updateProfile);
router.get('/users', FirmsController.getUsers);

// Admin-Only Multi-Company Management
router.get('/', authorizeRoles(Role.ADMIN), FirmsController.list);
router.post('/', authorizeRoles(Role.ADMIN), FirmsController.create);
router.get('/:id', authorizeRoles(Role.ADMIN), FirmsController.getById);
router.put('/:id', authorizeRoles(Role.ADMIN), FirmsController.update);
router.patch('/:id/status', authorizeRoles(Role.ADMIN), FirmsController.setStatus);

export default router;
