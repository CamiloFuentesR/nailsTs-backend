// Importar middlewares

import * as validateFields from './validateFields';
import * as validateJWT from './validateJWT';
import * as isAdminRole from './validateRole';
import * as haveRole from './validateRole';

// Combinar todos los middlewares
const middlewares = {
    ...validateFields,
    ...validateJWT,
    ...isAdminRole,
    ...haveRole
};

// Exportar los middlewares combinados
export default middlewares;