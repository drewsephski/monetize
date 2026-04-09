import { initSentry } from '@/lib/sentry';

export async function register() {
  // Initialize Sentry for error tracking
  initSentry();
}

export const onRequestError = (error: Error, request: Request, context: { route: string }) => {
  // This will be captured by Sentry automatically
  console.error(`Request error on ${context.route}:`, error);
};
