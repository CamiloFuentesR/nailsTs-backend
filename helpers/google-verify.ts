import { OAuth2Client } from 'google-auth-library';

const googleClient = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(googleClient);

async function googleVerify(token: string) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: googleClient, // Especifica el CLIENT_ID de la app que accede al backend
      // O, si múltiples clientes acceden al backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();

    // Verificar si el payload está definido
    if (payload) {
      const { name, picture, email } = payload;

      return {
        name,
        picture,
        email,
      };
    } else {
      console.log('Error: El payload es undefined.');
      return null;
    }
  } catch (error) {
    console.log('Error en la verificación de Google:', error);
    return null;
  }
}

export default googleVerify;
