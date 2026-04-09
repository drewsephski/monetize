import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  sendDefaultPii: true,

  // 100% in dev, 10% in production
  tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,

  // Session Replay: 10% of all sessions, 100% of sessions with errors
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  enableLogs: true,

  environment: process.env.NODE_ENV || 'development',
  release: process.env.VERCEL_GIT_COMMIT_SHA || process.env.NEXT_PUBLIC_APP_VERSION,

  // Enable debug in development
  debug: process.env.NODE_ENV === 'development',

  integrations: [
    Sentry.replayIntegration(),
    // Optional: user feedback widget
    // Sentry.feedbackIntegration({ colorScheme: 'system' }),
  ],

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

  // Ignore certain errors
  ignoreErrors: [
    // Network errors that are usually transient
    /^Network error$/,
    /^Failed to fetch$/,
    /^AbortError$/,
    // Browser extension errors
    /^Extension context invalidated$/,
    /^chrome-extension/,
    /^moz-extension/,
  ],

  // Ignore certain URLs (usually bot traffic)
  denyUrls: [
    /^chrome-extension:/,
    /^moz-extension:/,
    /^safari-extension:/,
  ],
});

// Hook into App Router navigation transitions (App Router only)
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
