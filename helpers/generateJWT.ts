import jwt, { Secret } from 'jsonwebtoken';

const generateJWT = (id = '', name = '', role = '') => {
    return new Promise((resolve, reject) => {
        const payload = { id, name, role };
        const secretKey: Secret | undefined = process.env.SECRET_KEY || undefined;
        if (!secretKey) {
            return reject('No se ha definido una llave secreta');
        }
        jwt.sign(payload, secretKey, {
            expiresIn: '1h',

        }, (err, token) => {
            if (err) {
                console.error(err);
                reject('No se pudo generar el token');
            } else {
                resolve(token);
            }
        });

    });
}
export default generateJWT;