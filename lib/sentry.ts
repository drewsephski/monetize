import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN as string | undefined;
// These are used for source maps upload via @sentry/cli (configured separately)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _SENTRY_ORG = process.env.SENTRY_ORG as string | undefined;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _SENTRY_PROJECT = process.env.SENTRY_PROJECT as string | undefined;

export function initSentry() {
  if (!SENTRY_DSN) {
    console.warn('SENTRY_DSN not set, error tracking disabled');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    release: process.env.VERCEL_GIT_COMMIT_SHA || process.env.NEXT_PUBLIC_APP_VERSION,
    
    // Performance monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Error sampling
    sampleRate: 1.0,
    
    // Enable debug in development
    debug: process.env.NODE_ENV === 'development',
    
    // Before sending, filter out sensitive data
    beforeSend(event: Sentry.Event) {
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
}

export function captureException(error: Error, context?: Record<string, unknown>) {
  if (!SENTRY_DSN) {
    console.error('Error (Sentry not configured):', error, context);
    return;
  }

  Sentry.captureException(error, {
    extra: context,
  });
}

export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, unknown>) {
  if (!SENTRY_DSN) {
    console.log(`[${level}] ${message}`, context);
    return;
  }

  Sentry.captureMessage(message, {
    level,
    extra: context,
  });
}

export function setUser(user: { id: string; email?: string; username?: string } | null) {
  if (!SENTRY_DSN) return;

  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
    });
  } else {
    Sentry.setUser(null);
  }
}

export function addBreadcrumb(breadcrumb: Sentry.Breadcrumb) {
  if (!SENTRY_DSN) return;

  Sentry.addBreadcrumb(breadcrumb);
}

export { Sentry };
