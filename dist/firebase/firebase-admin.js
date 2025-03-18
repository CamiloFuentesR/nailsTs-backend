"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.firebaseAdminAuth = void 0;
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
// Configura Firebase Admin usando las variables de entorno
const firebaseAdminApp = (0, app_1.initializeApp)({
    credential: (0, app_1.cert)({
        projectId: process.env.FIREBASE_PROJECT_ID, // Usa el projectId desde .env
        privateKey: process.env.FIREBASE_PRIVATE_KEY,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL, // Usa el clientEmail desde .env
    }),
});
exports.firebaseAdminAuth = (0, auth_1.getAuth)(firebaseAdminApp);
//# sourceMappingURL=firebase-admin.js.map