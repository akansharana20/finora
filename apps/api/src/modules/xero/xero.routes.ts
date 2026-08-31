import { Router } from 'express';
import { XeroController } from './xero.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/connect', XeroController.getConnectUrl);
router.get('/callback', XeroController.handleCallback);
router.get('/status', XeroController.getStatus);
router.post('/disconnect', XeroController.disconnect);
router.post('/sync', XeroController.sync);

export default router;
