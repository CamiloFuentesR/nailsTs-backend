import { Router } from 'express';
import { isAdminRole, validateJWT } from '../middleware';
import {
  createScheduleRule,
  deleteScheduleRule,
  getScheduleRules,
  replaceWeek,
  updateScheduleRule,
} from '../controllers/scheduleRule';

const router = Router();

// GET público: los clientes deben ver la disponibilidad sin iniciar sesión,
// mismo criterio que businessHour.
router.get('/', getScheduleRules);
// '/week' va antes que '/:id' y que el POST raíz, si no Express nunca la alcanza
router.post('/week', validateJWT, isAdminRole, replaceWeek);
router.post('/', validateJWT, isAdminRole, createScheduleRule);
router.put('/:id', validateJWT, isAdminRole, updateScheduleRule);
router.delete('/:id', validateJWT, isAdminRole, deleteScheduleRule);

export default router;
