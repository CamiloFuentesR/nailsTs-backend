import { Router } from 'express';
import { validateJWT } from '../middleware/validateJWT';
import {
  createService,
  getServices,
  getServicesByCategory,
  getServicesById,
  updateService,
} from '../controllers/service';

const router = Router();

router.get('/', getServices);
router.post('/', validateJWT, createService);
router.get('/:id', validateJWT, getServicesById);
router.get('/bycat/:id', getServicesByCategory);
router.put('/:id', validateJWT, updateService);

export default router;
