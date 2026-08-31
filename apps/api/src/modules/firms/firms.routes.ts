import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth';
import { authorizeRoles } from '../../middleware/rbac';
import { sendSuccess } from '../../utils/response';
import prisma from '../../config/db';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

// Get Firm Profile
router.get('/profile', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const firm = await prisma.firm.findUnique({
      where: { id: req.firmId! },
    });
    return sendSuccess(res, firm);
  } catch (error) {
    return next(error);
  }
});

// Update Firm Settings (Admin only)
router.put('/profile', authorizeRoles(Role.ADMIN), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, companyNumber, vatNumber, address, postcode } = req.body;
    const firm = await prisma.firm.update({
      where: { id: req.firmId! },
      data: { name, companyNumber, vatNumber, address, postcode },
    });
    return sendSuccess(res, firm, 'Firm details updated');
  } catch (error) {
    return next(error);
  }
});

// List Firm Users
router.get('/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      where: { firmId: req.firmId! },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    return sendSuccess(res, users);
  } catch (error) {
    return next(error);
  }
});

export default router;
