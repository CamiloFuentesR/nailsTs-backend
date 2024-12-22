"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middleware_1 = require("../middleware");
const files_1 = require("../controllers/files");
const express_validator_1 = require("express-validator");
const dbValidator_1 = require("../helpers/dbValidator");
const validateUpload_1 = require("../helpers/validateUpload");
const router = (0, express_1.Router)();
router.post('/:collection', middleware_1.validateJWT, validateUpload_1.validateUpload, files_1.uploadFile);
router.put('/:collection/:id', middleware_1.validateJWT, validateUpload_1.validateUpload, (0, express_validator_1.check)('collection').custom(c => (0, dbValidator_1.authorizedCollection)(c, ['users', 'category'])), middleware_1.validateFields, 
//   updateFile,
files_1.updateFileClaudinary);
router.get('/:collection/:id', (0, express_validator_1.check)('collection').custom(c => (0, dbValidator_1.authorizedCollection)(c, ['users', 'category'])), files_1.showFile);
exports.default = router;
//# sourceMappingURL=files.js.map