import { Router } from 'express';
import { VatController } from './vat.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/overview', VatController.getOverview);
router.get('/calculate', VatController.calculatePeriod);
router.post('/returns/:periodKey/prepare', VatController.prepareReturn);
router.get('/returns/:periodKey', VatController.getReturn);
router.post('/returns/:periodKey/submit', VatController.submitReturn);

export default router;
