import { Router } from 'express';
import { HmrcController } from './hmrc.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/connect', HmrcController.getConnectUrl);
router.get('/callback', HmrcController.handleCallback);
router.get('/status', HmrcController.getStatus);
router.post('/disconnect', HmrcController.disconnect);
router.post('/obligations/sync', HmrcController.syncObligations);
router.post('/returns/:periodKey/submit', HmrcController.submitReturn);

export default router;
