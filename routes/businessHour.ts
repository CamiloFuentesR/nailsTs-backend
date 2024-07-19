import { Router } from 'express';
import { validateJWT } from '../middleware';
import {
  createBusinessHour,
  getAllBusinessHours,
  getBusinessHourById,
  updateBusinessHour,
} from '../controllers/businessHour';

const router = Router();

router.post('/', validateJWT, createBusinessHour);
router.put('/', validateJWT, updateBusinessHour);
router.get('/', validateJWT, getAllBusinessHours);
router.get('/:id', validateJWT, getBusinessHourById);
// router.get('/', validateJWT, getAllBusinessHours);
export default router;
