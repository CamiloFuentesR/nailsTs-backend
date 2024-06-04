import { check } from 'express-validator';
import { validateFields } from '../middleware/validateFields';
import {
  createClient,
  showAllCliens,
  showAllClientActive,
  showAllClientInActive,
  showClientById,
  updateClient,
} from '../controllers/client';
import { Router } from 'express';
import { validateJWT } from '../middleware/validateJWT';
import { updateUser } from '../controllers/user';
import { clientByIdExist } from '../helpers/dbValidator';
import { isAdminRole } from '../middleware/validateRole';

const router = Router();

router.get('/', validateJWT, showAllCliens);
router.get('/active', validateJWT, showAllClientActive);
router.get('/inactive', validateJWT, showAllClientInActive);
router.get('/:id', validateJWT, showClientById);

router.post(
  '/',
  [
    validateJWT,
    check('name').notEmpty().withMessage('Debe ingresar nombre'),
    check('phone_number')
      .notEmpty()
      .withMessage('Debe ingresar teléfono')
      .isLength({ min: 9, max: 9 })
      .withMessage('Teléfono inválido')
      .isNumeric()
      .withMessage('Teléfono inválido'),
    validateFields,
  ],
  createClient
);

router.put(
  '/:id',
  [
    validateJWT,
    isAdminRole,
    check('id').custom(clientByIdExist),
    // check('name').notEmpty().withMessage('Debe ingresar nombre'),
    check('phone_number')
      .notEmpty()
      .withMessage('Debe ingresar teléfono')
      .isLength({ min: 9, max: 9 })
      .withMessage('Teléfono inválido')
      .isNumeric()
      .withMessage('Teléfono inválido'),
    validateFields,
  ],
  updateClient
);

router.delete(
  '/:id',
  [
    validateJWT,
    isAdminRole,
    check('id').custom(clientByIdExist),
    validateFields,
  ],
  updateUser
);

export default router;
