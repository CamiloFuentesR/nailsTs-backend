import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Configura Firebase Admin usando las variables de entorno
const firebaseAdminApp = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID, // Usa el projectId desde .env
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL, // Usa el clientEmail desde .env
  }),
});

export const firebaseAdminAuth = getAuth(firebaseAdminApp);
