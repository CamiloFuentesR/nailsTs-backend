import { Router } from 'express';
import { check } from 'express-validator';
// import { validateFields } from '../middleware/validateFields';
import { login } from '../controllers/auth';
import middlewares from '../middleware';

const router = Router();

router.post(
  '/',
  [check('email').normalizeEmail(), middlewares.validateFields],
  login
);

export default router;
