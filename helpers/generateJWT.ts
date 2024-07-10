import { UUIDVersion } from 'express-validator/lib/options';
import jwt, { Secret } from 'jsonwebtoken';

/**
 * Genera un JWT.
 * @param id - ID del usuario en formato UUID.
 * @param name - Nombre del usuario.
 * @param role - Rol del usuario.
 * @returns Una promesa que resuelve con el token generado.
 */
const generateJWT = async (
  id: UUIDVersion,
  name: string = '',
  role: string,
): Promise<string> => {
  const payload = { id, name, role };
  const secretKey: Secret | undefined = process.env.SECRET_KEY;

  if (!secretKey) {
    throw new Error('No se ha definido una llave secreta en el entorno');
  }

  try {
    const token = await new Promise<string>((resolve, reject) => {
      jwt.sign(payload, secretKey, { expiresIn: '1d' }, (err, token) => {
        if (err || !token) {
          console.error('Error al generar el token:', err);
          reject('No se pudo generar el token');
        } else {
          resolve(token);
        }
      });
    });
    return token;
  } catch (error) {
    console.error('Error al generar el token:', error);
    throw new Error('No se pudo generar el token');
  }
};

export default generateJWT;
