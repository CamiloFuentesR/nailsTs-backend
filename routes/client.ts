import { check } from 'express-validator';
import { validateFields } from '../middleware/validateFields';
import {
  showAllCliens,
  showAllClientActive,
  showAllClientInActive,
  showClientById,
  createClient,
  updateClient,
  showClientByUserId,
} from '../controllers/client';
import { Router } from 'express';
import { validateJWT } from '../middleware/validateJWT';
import { clientByIdExist } from '../helpers/dbValidator';
import { isAdminRole } from '../middleware/validateRole';

const router = Router();

router.get('/', validateJWT, showAllCliens);
router.get('/active', showAllClientActive);
router.get('/inactive', validateJWT, showAllClientInActive);
router.get('/:id', [validateJWT, validateFields], showClientById);
router.get(
  '/clientbyuser/:id',
  [validateJWT, validateFields],
  showClientByUserId,
);

router.post(
  '/',
  [
    validateJWT,
    check('name').notEmpty().withMessage('Debe ingresar nombre'),
    check('phone_number')
      .notEmpty()
      .withMessage('Debe ingresar teléfono')
      .isLength({ min: 8, max: 8 })
      .withMessage('El teléfono debe tener 8 dígitos'),
    validateFields,
  ],
  createClient,
);

router.put(
  '/:id',
  [
    validateJWT,
    isAdminRole,
    check('id').custom(clientByIdExist),
    check('name').notEmpty().withMessage('Debe ingresar nombre'),
    check('phone_number')
      .notEmpty()
      .withMessage('Debe ingresar teléfono')
      .isLength({ min: 8, max: 8 })
      .withMessage('Teléfono inválido')
      .isNumeric()
      .withMessage('Teléfono inválido'),
    validateFields,
  ],
  updateClient,
);

export default router;
