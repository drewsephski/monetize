import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  sendDefaultPii: true,
  tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,

  enableLogs: true,

  environment: process.env.NODE_ENV || 'development',
  release: process.env.VERCEL_GIT_COMMIT_SHA || process.env.NEXT_PUBLIC_APP_VERSION,

  // Enable debug in development
  debug: process.env.NODE_ENV === 'development',

  // Before sending, filter out sensitive data
  beforeSend(event) {
    // Remove potentially sensitive headers
    if (event.request?.headers) {
      const headers = event.request.headers as { [key: string]: string };
      delete headers['authorization'];
      delete headers['cookie'];
      delete headers['x-api-key'];
      delete headers['stripe-signature'];
    }

    // Remove sensitive query params
    if (event.request?.query_string) {
      const query = event.request.query_string as Record<string, string>;
      delete query['licenseKey'];
      delete query['apiKey'];
      delete query['token'];
    }

    // Remove sensitive data from extra context
    if (event.extra) {
      delete event.extra['licenseKey'];
      delete event.extra['apiKey'];
      delete event.extra['password'];
    }

    return event;
  },
});
