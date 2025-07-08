import { Router } from 'express';
import { validateJWT } from '../middleware';
import {
  createBusinessHour,
  getAllBusinessHours,
  getAllBusinessHoursByData,
  getBusinessHourById,
  updateBusinessHour,
} from '../controllers/businessHour';

const router = Router();

router.post('/', validateJWT, createBusinessHour);
router.get('/', getAllBusinessHours);
router.get('/bydata', getAllBusinessHoursByData);
router.put('/:id', validateJWT, updateBusinessHour);
router.get('/:id', validateJWT, getBusinessHourById);
// router.get('/', validateJWT, getAllBusinessHours);
export default router;
