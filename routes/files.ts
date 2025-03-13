import { Router } from 'express';
import { validateFields, validateJWT } from '../middleware';
import {
  postFileClaudinary,
  showFile,
  updateFile,
  updateFileClaudinary,
  updateFileClientNailsClaudinary,
  uploadFile,
} from '../controllers/files';
import { check } from 'express-validator';
import { authorizedCollection } from '../helpers/dbValidator';
import { validateUpload } from '../helpers/validateUpload';

const router = Router();

router.post(
  '/:collection/:id',
  validateJWT,
  validateUpload,
  validateFields,
  postFileClaudinary,
);

router.put(
  '/nails/:collection/:id',
  validateJWT,
  validateUpload,
  // check('collection').custom(c =>
  //   authorizedCollection(c, ['user', 'category']),
  // ),
  validateFields,
  //   updateFile,
  updateFileClientNailsClaudinary,
);

router.put(
  '/:collection/:id',
  validateJWT,
  validateUpload,
  check('collection').custom(c =>
    authorizedCollection(c, ['user', 'category']),
  ),
  validateFields,
  //   updateFile,
  updateFileClaudinary,
);

router.get(
  '/:collection/:id',
  check('collection').custom(c =>
    authorizedCollection(c, ['user', 'category']),
  ),
  showFile,
);
export default router;
