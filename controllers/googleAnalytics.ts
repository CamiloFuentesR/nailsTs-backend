import { Request, RequestHandler, Response } from 'express';
import { google } from 'googleapis';

// Inicializa la API de Google Analytics Data v1 (GA4)
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
});

const analytics = google.analyticsdata({
  version: 'v1beta',
  auth,
});

export const getGoogleAnalyticsEventsByPage: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const propertyId = `properties/${process.env.GOOGLE_ANALYTICS_PROPERTY_ID}`;

    const startDate = 'today';
    const endDate = 'today';
    console.log(
      'Clave privada:',
      process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    );
    const response = await analytics.properties.runReport({
      property: propertyId,
      requestBody: {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'eventName' }, { name: 'pagePath' }],
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
  } catch (error) {
    console.error('Error al obtener datos de Analytics:', error);
    res.status(500).json({ error: 'Error al obtener los datos de Analytics' });
  }
};
