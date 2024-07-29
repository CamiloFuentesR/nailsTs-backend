import { Router } from 'express';
import { validateJWT } from '../middleware/validateJWT';

import {
  createServiceSecondary,
  getServicesSecondary,
  getServicesSecondaryByCategory,
  getServicesSecondaryById,
  updateserviceSecondary,
} from '../controllers/servicesSecondary';

const router = Router();

router.post('/', validateJWT, createServiceSecondary);
router.get('/', validateJWT, getServicesSecondary);
router.get('/:id', validateJWT, getServicesSecondaryById);
router.get('/bycat/:id', validateJWT, getServicesSecondaryByCategory);
router.put('/:id', validateJWT, updateserviceSecondary);

export default router;
