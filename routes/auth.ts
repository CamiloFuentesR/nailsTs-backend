import { Router } from 'express'
import { check } from 'express-validator'
import { validateFields } from '../middleware/validateFields';
import { login } from '../controllers/auth';

const router = Router();

router.post('/', login)


export default router