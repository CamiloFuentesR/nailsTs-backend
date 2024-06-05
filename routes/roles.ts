import { Router } from 'express';
import { createRoles, getRoles } from '../controllers/role';
import { validateJWT } from '../middleware';

const router = Router();

router.get('/', validateJWT, getRoles);
router.get('/', validateJWT, createRoles);

export default router;
