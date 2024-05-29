import { Router } from 'express'
import { getUser, getUsers, createtUser } from '../controllers/user';
import { check } from 'express-validator'
import { validateFields } from '../middleware/validateFields';
import { validateJWT } from '../middleware/validateJWT';

const router = Router();

router.get('/',validateJWT, getUsers);
router.get('/:id', getUser)
router.post('/', [
    validateJWT,
    check('email')
        .isEmail().withMessage('El email no es válido'),
    validateFields
], createtUser)


export default router