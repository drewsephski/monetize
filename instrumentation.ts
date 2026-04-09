import * as Sentry from '@sentry/nextjs';

export async function register() {
  try {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
      await import('./sentry.server.config');
    }

    if (process.env.NEXT_RUNTIME === 'edge') {
      await import('./sentry.edge.config');
    }
  } catch (error) {
    // Log but don't crash if Sentry fails to initialize
    console.warn('[Sentry] Failed to initialize:', error);
  }
}

// Automatically captures all unhandled server-side request errors
// Requires @sentry/nextjs >= 8.28.0
export const onRequestError = Sentry.captureRequestError;
