import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: 'https://2f532076fe099af23434206521f33835@o4511740959391744.ingest.us.sentry.io/4511743715377152',
  tracesSampleRate: 0.1,
  environment: process.env.VERCEL_ENV || 'development',
});

export default Sentry;
