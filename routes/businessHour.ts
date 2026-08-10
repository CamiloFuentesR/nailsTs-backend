import { Router } from 'express';
import { isAdminRole, validateJWT } from '../middleware';
import {
  createBusinessHour,
  deleteBusinessHour,
  getAllBusinessHours,
  getAllBusinessHoursByData,
  getBusinessHourById,
  updateBusinessHour,
} from '../controllers/businessHour';

const router = Router();

router.post('/', validateJWT, isAdminRole, createBusinessHour);
router.get('/', getAllBusinessHours);
router.get('/bydata', getAllBusinessHoursByData);
router.put('/:id', validateJWT, isAdminRole, updateBusinessHour);
router.delete('/:id', validateJWT, isAdminRole, deleteBusinessHour);
router.get('/:id', validateJWT, getBusinessHourById);
// router.get('/', validateJWT, getAllBusinessHours);
export default router;
