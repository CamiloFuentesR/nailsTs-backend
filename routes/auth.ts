import { Router } from 'express';
import { check } from 'express-validator';
import { googleSignIn, login, renewToken } from '../controllers/auth';
import { validateFields, validateJWT } from '../middleware';

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
  login,
);

router.post('/renew', validateJWT, renewToken);

router.post(
  '/google',
  [
    check('id_token', 'id_Token de google es necesdario').notEmpty(),
    // validateFields,
  ],
  googleSignIn,
);

export default router;
