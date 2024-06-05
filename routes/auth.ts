import { Router } from 'express';
import { check } from 'express-validator';
import { login } from '../controllers/auth';
import { validateFields } from '../middleware';

const router = Router();

router.post(
  '/',
  [
    check('email')
      .notEmpty()
      .withMessage('Debe ingresar el email')
      .normalizeEmail()
      .isEmail()
      .withMessage('ingresar email válido'),
    check('password')
      .notEmpty()
      .withMessage('El password no puede estar vacío'),
    validateFields,
  ],
  login
);

export default router;
