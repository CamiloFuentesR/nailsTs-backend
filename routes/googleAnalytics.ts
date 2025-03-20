import { Router } from 'express';
import { validateJWT } from '../middleware';
import { getGoogleAnalyticsEventsByPage } from '../controllers/googleAnalytics';

const router = Router();

router.get('/', validateJWT, getGoogleAnalyticsEventsByPage);

export default router;
