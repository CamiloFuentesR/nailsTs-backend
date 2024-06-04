import { Router } from 'express';
import { validateJWT } from '../middleware/validateJWT';
import { createService, getServices } from '../controllers/service';

const router = Router();

router.get('/', getServices);
router.post('/', validateJWT, createService);

export default router;
