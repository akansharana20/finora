import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth';
import { sendSuccess } from '../../utils/response';
import prisma from '../../config/db';

const router = Router();

router.use(authenticate);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const logs = await prisma.auditLog.findMany({
      where: { firmId: req.firmId! },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });
    return sendSuccess(res, logs);
  } catch (error) {
    return next(error);
  }
});

export default router;
