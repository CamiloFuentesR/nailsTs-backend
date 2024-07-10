import { Router } from 'express';
import { validateJWT } from '../middleware';
import { createAppointmentState } from '../controllers/appointmentsState';

const router = Router();

router.post('/', validateJWT, createAppointmentState);

export default router;
