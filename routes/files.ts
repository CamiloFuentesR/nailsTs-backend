import { Router } from 'express';
import { validateFields, validateJWT } from '../middleware';
import {
  showFile,
  updateFile,
  updateFileClaudinary,
  uploadFile,
} from '../controllers/files';
import { check } from 'express-validator';
import { authorizedCollection } from '../helpers/dbValidator';
import { validateUpload } from '../helpers/validateUpload';

const router = Router();

router.post('/:collection', validateJWT, validateUpload, uploadFile);

router.put(
  '/:collection/:id',
  validateJWT,
  validateUpload,
  check('collection').custom(c =>
    authorizedCollection(c, ['users', 'category']),
  ),
  validateFields,
  //   updateFile,
  updateFileClaudinary,
);

router.get(
  '/:collection/:id',
  check('collection').custom(c =>
    authorizedCollection(c, ['users', 'category']),
  ),
  showFile,
);
export default router;
