import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { webhookQueue } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { captureException, addBreadcrumb } from '@/lib/sentry';

// Stripe webhook IP ranges (fetched from https://stripe.com/files/ips/ips_webhooks.json)
// These should be periodically updated
const STRIPE_WEBHOOK_IPS = [
  // Primary ranges
  '3.18.12.0/24',
  '3.130.192.0/24',
  '13.235.14.0/24',
  '18.211.135.0/24',
  '35.154.171.0/24',
  '52.15.183.0/24',
  '54.88.235.0/24',
  '54.187.174.0/24',
  '54.187.216.0/24',
  '54.241.32.0/24',
  '99.79.158.0/24',
  '99.79.159.0/24',
  // Additional common ranges
  '54.187.204.0/24',
  '54.241.31.0/24',
];

// Rate limiting store (in production, use Redis)
interface RateLimitEntry {
  count: number;
  resetAt: number;
}
const rateLimitStore = new Map<string, RateLimitEntry>();

// Rate limit configuration
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute window
const RATE_LIMIT_MAX_REQUESTS = 100; // Max requests per window per IP

/**
 * Check if an IP is in the Stripe webhook IP allowlist
 */
export function isStripeWebhookIP(ip: string): boolean {
  // Skip check in development
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  // Handle IPv6 localhost - only allow in development
  if (ip === '::1' || ip === '::ffff:127.0.0.1') {
    return process.env.NODE_ENV !== 'production';
  }

  // Strip IPv6 prefix if present
  const cleanIp = ip.replace('::ffff:', '');

  return STRIPE_WEBHOOK_IPS.some((cidr) => isIPInCIDR(cleanIp, cidr));
}

/**
 * Check if an IP is within a CIDR range
 */
function isIPInCIDR(ip: string, cidr: string): boolean {
  const [range, bits] = cidr.split('/');
  const mask = parseInt(bits!, 10);
  
  const ipParts = ip.split('.').map(Number);
  const rangeParts = range!.split('.').map(Number);
  
  if (ipParts.length !== 4 || rangeParts.length !== 4) {
    return false;
  }

  const ipNum = (ipParts[0]! << 24) | (ipParts[1]! << 16) | (ipParts[2]! << 8) | ipParts[3]!;
  const rangeNum = (rangeParts[0]! << 24) | (rangeParts[1]! << 16) | (rangeParts[2]! << 8) | rangeParts[3]!;
  
  const maskNum = (0xFFFFFFFF << (32 - mask)) >>> 0;
  
  return (ipNum & maskNum) === (rangeNum & maskNum);
}

/**
 * Check rate limit for a given identifier (IP or endpoint)
 */
export function checkRateLimit(identifier: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetAt) {
    // New window
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    };
    rateLimitStore.set(identifier, newEntry);
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1, resetAt: newEntry.resetAt };
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - entry.count, resetAt: entry.resetAt };
}

/**
 * Log webhook request to database for audit trail
 */
export async function logWebhookRequest(
  stripeEventId: string,
  eventType: string,
  payload: Record<string, unknown>,
  ipAddress: string | null,
  userAgent: string | null,
  status: 'pending' | 'processing' | 'completed' | 'failed',
  error?: string
): Promise<void> {
  try {
    await db.insert(webhookQueue).values({
      stripeEventId,
      eventType,
      payload,
      status,
      attempts: status === 'completed' ? 1 : 0,
      lastError: error || null,
    });

    addBreadcrumb({
      category: 'webhook',
      message: `Webhook ${eventType} ${status}`,
      level: status === 'failed' ? 'error' : 'info',
      data: {
        stripeEventId,
        eventType,
        ipAddress: ipAddress ? '[REDACTED]' : null,
        status,
      },
    });
  } catch (err) {
    // Don't fail the webhook if logging fails, but capture the error
    captureException(err as Error, {
      context: 'webhook_logging',
      stripeEventId,
      eventType,
    });
  }
}

/**
 * Middleware to validate and secure webhook requests
 */
export async function validateWebhookRequest(
  req: NextRequest,
  endpoint: string
): Promise<{ valid: boolean; response?: NextResponse; stripeEventId?: string }> {
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                   req.headers.get('x-real-ip') || 
                   'unknown';
  const userAgent = req.headers.get('user-agent');

  // 1. Check IP allowlist for license webhooks
  if (endpoint.includes('/webhooks/license')) {
    if (!isStripeWebhookIP(clientIp)) {
      captureException(new Error('Webhook from unauthorized IP'), {
        context: 'webhook_security',
        endpoint,
        clientIp,
        userAgent,
      });

      return {
        valid: false,
        response: NextResponse.json(
          { error: 'Unauthorized' },
          { 
            status: 403,
            headers: {
              'X-Webhook-Error': 'ip_not_allowed',
            },
          }
        ),
      };
    }
  }

  // 2. Check rate limit
  const rateLimitKey = `${clientIp}:${endpoint}`;
  const rateLimit = checkRateLimit(rateLimitKey);

  if (!rateLimit.allowed) {
    return {
      valid: false,
      response: NextResponse.json(
        { error: 'Rate limit exceeded' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(RATE_LIMIT_MAX_REQUESTS),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimit.resetAt).toISOString(),
            'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
          },
        }
      ),
    };
  }

  // 3. Parse and validate payload
  let payload: string;
  let parsedPayload: Record<string, unknown>;
  
  try {
    payload = await req.text();
    parsedPayload = JSON.parse(payload);
  } catch {
    return {
      valid: false,
      response: NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      ),
    };
  }

  const stripeEventId = parsedPayload.id as string | undefined;
  const eventType = parsedPayload.type as string | undefined;

  if (!stripeEventId || !eventType) {
    return {
      valid: false,
      response: NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      ),
    };
  }

  // 4. Log the request (async, don't wait)
  logWebhookRequest(
    stripeEventId,
    eventType,
    parsedPayload,
    clientIp,
    userAgent,
    'pending'
  ).catch(() => {
    // Logging failure shouldn't block the webhook
  });

  // Return the payload so it can be used for signature verification
  return {
    valid: true,
    stripeEventId,
    // Return a new request with the body re-attached for signature verification
  };
}

/**
 * Update webhook log status after processing
 */
export async function updateWebhookStatus(
  stripeEventId: string,
  status: 'completed' | 'failed',
  error?: string
): Promise<void> {
  try {
    await db
      .update(webhookQueue)
      .set({
        status,
        lastError: error || null,
        processedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(webhookQueue.stripeEventId, stripeEventId));
  } catch (err) {
    captureException(err as Error, {
      context: 'webhook_status_update',
      stripeEventId,
      status,
    });
  }
}
