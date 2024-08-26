"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const google_auth_library_1 = require("google-auth-library");
const googleClient = process.env.GOOGLE_CLIENT_ID;
const client = new google_auth_library_1.OAuth2Client(googleClient);
function googleVerify(token) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const ticket = yield client.verifyIdToken({
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
            }
            else {
                console.log('Error: El payload es undefined.');
                return null;
            }
        }
        catch (error) {
            console.log('Error en la verificación de Google:', error);
            return null;
        }
    });
}
exports.default = googleVerify;
//# sourceMappingURL=google-verify.js.map