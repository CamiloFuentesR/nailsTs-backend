import { Router } from 'express';
import { validateJWT } from '../middleware/validateJWT';
import {
  createService,
  getServices,
  getServicesByCategory,
  getServicesById,
  updateservice,
} from '../controllers/service';

const router = Router();

router.get('/', getServices);
router.post('/', validateJWT, createService);
router.get('/:id', validateJWT, getServicesById);
router.get('/bycat/:id', validateJWT, getServicesByCategory);
router.put('/:id', validateJWT, updateservice);

export default router;
