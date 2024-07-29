import { Router } from 'express';
import { validateJWT } from '../middleware/validateJWT';
import {
  createServicesCategorySecondary,
  getServicesCategorySecondary,
  showServiceCategorySecondaryById,
  updateServicesCategorySecondary,
} from '../controllers/serviceCategorySecondary';

const router = Router();

router.post('/', validateJWT, createServicesCategorySecondary);
router.get('/', validateJWT, getServicesCategorySecondary);
router.get('/:id', validateJWT, showServiceCategorySecondaryById);
router.put('/:id', validateJWT, updateServicesCategorySecondary);

export default router;
