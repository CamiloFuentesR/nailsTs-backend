import { Router } from 'express'
import { getUserByid, createtUser, deleteUser, updateUser, getUsersActive, getUsersInactive } from '../controllers/user';
import { check } from 'express-validator'
import { validateFields } from '../middleware/validateFields';
import { validateJWT } from '../middleware/validateJWT';
import { userByIdExist } from '../helpers/dbValidator';

const router = Router();

router.get('/active', validateJWT, getUsersActive);
router.get('/inactive', validateJWT, getUsersInactive);

router.get('/:id', [
    validateJWT,
    check('id').custom(userByIdExist),
    validateFields,
], getUserByid);

router.post('/', [
    check('email')
        .isEmail().withMessage('El email no es válido')
        .normalizeEmail(),
    check('password').notEmpty().withMessage('Debe ingresar un password')
        .isLength({ min: 4 }).withMessage('El password debe tener al menos 5 caracteres'),
    validateFields
], createtUser);

router.put('/:id', [
    validateJWT,
    check('email')
        .isEmail().withMessage('El email no es válido')
        .normalizeEmail(),
    check('state').notEmpty(),
    validateFields
], updateUser)

router.delete('/:id', [
    validateJWT,
    check('id').custom(userByIdExist),
    validateFields
], deleteUser)


export default router