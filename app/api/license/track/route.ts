import { NextRequest, NextResponse } from 'next/server';
import { trackApiCall, checkUsageLimit } from '@/lib/sdk-usage';
import { z } from 'zod';

const trackSchema = z.object({
  licenseKey: z.string().min(1),
  eventType: z.string().default('api_call'),
  machineId: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

/**
 * POST /api/license/track
 * 
 * Track SDK usage and enforce limits.
 * Returns 429 if usage limit exceeded.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = trackSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: result.error.issues },
        { status: 400 }
      );
    }

    const { licenseKey, eventType, machineId, metadata } = result.data;

    // Track the API call and enforce limits
    const trackResult = await trackApiCall(licenseKey, eventType, machineId, metadata);

    if (!trackResult.success) {
      // Return 429 Too Many Requests if limit exceeded
      if (!trackResult.allowed) {
        // Get current usage for headers
        const usageCheck = await checkUsageLimit(licenseKey);
        
        return NextResponse.json(
          {
            error: trackResult.error || 'Usage limit exceeded',
            code: 'USAGE_LIMIT_EXCEEDED',
            upgradeUrl: 'https://monetize-two.vercel.app/pricing',
          },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': String(usageCheck.limit),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': usageCheck.resetAt?.toISOString() || '',
              'Retry-After': String(Math.ceil((usageCheck.resetAt?.getTime() || Date.now() + 86400000 - Date.now()) / 1000)),
            },
          }
        );
      }

      return NextResponse.json(
        { error: trackResult.error },
        { status: 400 }
      );
    }

    // Return success with rate limit headers
    const usageCheck = await checkUsageLimit(licenseKey);

    return NextResponse.json(
      {
        success: true,
        allowed: true,
        remaining: trackResult.remaining,
      },
      {
        headers: {
          'X-RateLimit-Limit': String(usageCheck.limit),
          'X-RateLimit-Remaining': String(trackResult.remaining),
          'X-RateLimit-Reset': usageCheck.resetAt?.toISOString() || '',
        },
      }
    );
  } catch (error) {
    console.error('Error tracking license usage:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/license/track?licenseKey=xxx
 * 
 * Get current usage without tracking
 */
export async function GET(req: NextRequest) {
  try {
    const licenseKey = req.nextUrl.searchParams.get('licenseKey');

    if (!licenseKey) {
      return NextResponse.json(
        { error: 'licenseKey query parameter required' },
        { status: 400 }
      );
    }

    const usageCheck = await checkUsageLimit(licenseKey);

    if (!usageCheck.allowed && usageCheck.remaining === 0 && usageCheck.limit > 0) {
      // License exists but limit exceeded
    }

    return NextResponse.json({
      allowed: usageCheck.allowed,
      current: usageCheck.current,
      limit: usageCheck.limit,
      remaining: usageCheck.remaining,
      resetAt: usageCheck.resetAt,
      percentage: usageCheck.limit === -1 
        ? 0 
        : Math.round((usageCheck.current / usageCheck.limit) * 100),
    }, {
      headers: {
        'X-RateLimit-Limit': String(usageCheck.limit),
        'X-RateLimit-Remaining': String(usageCheck.remaining),
        'X-RateLimit-Reset': usageCheck.resetAt?.toISOString() || '',
      },
    });
  } catch (error) {
    console.error('Error getting usage:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
