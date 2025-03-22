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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGoogleAnalyticsUsersByPage = exports.getGoogleAnalyticsEventsByPage = void 0;
const googleapis_1 = require("googleapis");
// Inicializa la API de Google Analytics Data v1 (GA4)
const auth = new googleapis_1.google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: (_a = process.env.GOOGLE_PRIVATE_KEY) === null || _a === void 0 ? void 0 : _a.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
});
const analytics = googleapis_1.google.analyticsdata({
    version: 'v1beta',
    auth,
});
const getGoogleAnalyticsEventsByPage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const propertyId = `properties/${process.env.GOOGLE_ANALYTICS_PROPERTY_ID}`;
        const startDate = '7daysAgo';
        const endDate = 'today';
        const response = yield analytics.properties.runReport({
            property: propertyId,
            requestBody: {
                dateRanges: [{ startDate, endDate }],
                dimensions: [{ name: 'eventName' }, { name: 'pageTitle' }],
                metrics: [{ name: 'eventCount' }],
                dimensionFilter: {
                    filter: {
                        fieldName: 'eventName',
                        stringFilter: {
                            value: 'page_view',
                            matchType: 'EXACT',
                        },
                    },
                },
            },
        });
        // Responde con los datos obtenidos de los eventos
        res.json(response.data);
    }
    catch (error) {
        console.error('Error al obtener datos de Analytics:', error);
        res.status(500).json({ error: 'Error al obtener los datos de Analytics' });
    }
});
exports.getGoogleAnalyticsEventsByPage = getGoogleAnalyticsEventsByPage;
const getGoogleAnalyticsUsersByPage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const propertyId = `properties/${process.env.GOOGLE_ANALYTICS_PROPERTY_ID}`;
        const startDate = '7daysAgo';
        const endDate = 'today';
        const response = yield analytics.properties.runReport({
            property: propertyId,
            requestBody: {
                dateRanges: [{ startDate, endDate }],
                dimensions: [{ name: 'pageTitle' }],
                metrics: [{ name: 'activeUsers' }],
            },
        });
        // Responde con los datos obtenidos de la cantidad de usuarios por página
        res.json(response.data);
    }
    catch (error) {
        console.error('Error al obtener datos de Analytics:', error);
        res.status(500).json({ error: 'Error al obtener los datos de Analytics' });
    }
});
exports.getGoogleAnalyticsUsersByPage = getGoogleAnalyticsUsersByPage;
//# sourceMappingURL=googleAnalytics.js.map