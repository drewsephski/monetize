import * as Sentry from '@sentry/nextjs';

// Sentry is initialized in instrumentation-client.ts, sentry.server.config.ts, and sentry.edge.config.ts
// This file provides helper functions for manual error capture

/**
 * Capture an exception with optional context.
 * Works in both client and server environments.
 */
export function captureException(error: Error, context?: Record<string, unknown>) {
  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Capture a message with a specific severity level.
 * Works in both client and server environments.
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, unknown>) {
  Sentry.captureMessage(message, {
    level,
    extra: context,
  });
}

/**
 * Set the current user for Sentry scope.
 * Call with null to clear the user (e.g., on logout).
 */
export function setUser(user: { id: string; email?: string; username?: string } | null) {
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

/**
 * Add a breadcrumb for additional context in error reports.
 */
export function addBreadcrumb(breadcrumb: Sentry.Breadcrumb) {
  Sentry.addBreadcrumb(breadcrumb);
}

/**
 * Start a new performance span/transaction.
 * Useful for manual performance monitoring.
 */
export function startSpan<T>(options: { name: string; op?: string }, callback: () => T): T {
  return Sentry.startSpan(options, callback);
}

// Re-export Sentry for direct access if needed
export { Sentry };
