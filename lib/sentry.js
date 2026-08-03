// Edge-runtime Sentry wrapper.
// @sentry/vercel-edge's ESM build pulls in node built-ins (node:async_hooks)
// that the Vercel dev sandbox cannot always polyfill, which made edge
// functions importing this file fail to instantiate locally
// ("Buffer is not defined"). The SDK is loaded lazily so a load failure
// degrades to a no-op instead of crashing the function; in production the
// SDK loads and error tracking behaves exactly as before.
const sentryStub = {
  captureException: () => {},
  captureMessage: () => {},
  withScope: (cb) => cb(),
};

import('@sentry/vercel-edge')
  .then((Sdk) => {
    Sdk.init({
      dsn: 'https://2f532076fe099af23434206521f33835@o4511740959391744.ingest.us.sentry.io/4511743715377152',
      tracesSampleRate: 0.1,
      environment: process.env.VERCEL_ENV || 'development',
    });
    sentryStub.captureException = Sdk.captureException.bind(Sdk);
    sentryStub.captureMessage = Sdk.captureMessage.bind(Sdk);
    sentryStub.withScope = Sdk.withScope.bind(Sdk);
  })
  .catch((e) => {
    console.warn('[Sentry] Edge SDK unavailable, continuing without error tracking:', e.message);
  });

export default sentryStub;
