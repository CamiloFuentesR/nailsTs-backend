import { Router } from 'express';
import { validateJWT } from '../middleware';
import {
  getGoogleAnalyticsEventsByPage,
  getGoogleAnalyticsUsersByPage,
} from '../controllers/googleAnalytics';

const router = Router();

router.get('/', validateJWT, getGoogleAnalyticsEventsByPage);
router.get('/userByPage', validateJWT, getGoogleAnalyticsUsersByPage);

export default router;
