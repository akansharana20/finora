import { Router } from 'express';
import { HmrcController } from './hmrc.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// Public OAuth callback from HMRC redirect (state parameter carries verified firm context)
router.get('/callback', HmrcController.handleCallback);
router.post('/callback', HmrcController.handleCallback);

// All subsequent endpoints require user authentication
router.use(authenticate);

router.get('/connect', HmrcController.getConnectUrl);
router.get('/status', HmrcController.getStatus);
router.post('/disconnect', HmrcController.disconnect);
router.post('/obligations/sync', HmrcController.syncObligations);
router.post('/returns/:periodKey/submit', HmrcController.submitReturn);

export default router;
