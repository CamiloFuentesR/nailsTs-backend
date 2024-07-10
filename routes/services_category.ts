import { Router } from 'express';
import { validateJWT } from '../middleware/validateJWT';
import {
  createServicesCategory,
  getServicesCategory,
  showServiceCategoryById,
  updateServicesCategory,
} from '../controllers/servicesCategory';

const router = Router();

router.get('/', validateJWT, getServicesCategory);
router.post('/', validateJWT, createServicesCategory);
router.put('/:id', validateJWT, updateServicesCategory);
router.get('/:id', validateJWT, showServiceCategoryById);

export default router;
