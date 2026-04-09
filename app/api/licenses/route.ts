import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { sdkLicenses } from '@/drizzle/schema';
import { eq, desc } from 'drizzle-orm';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { sendLicenseRegeneratedEmail } from '@/lib/email';

/**
 * GET /api/licenses
 * 
 * List all SDK licenses for the authenticated user
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's email
    const userEmail = session.user.email;
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email not found' },
        { status: 400 }
      );
    }

    // Find all licenses associated with this email
    const licenses = await db.query.sdkLicenses.findMany({
      where: eq(sdkLicenses.customerEmail, userEmail),
      orderBy: desc(sdkLicenses.createdAt),
    });

    // Format the response with masked keys
    const formattedLicenses = licenses.map((license) => ({
      id: license.id,
      licenseKey: license.licenseKey,
      licenseKeyMasked: maskLicenseKey(license.licenseKey),
      tier: license.tier,
      status: license.status,
      features: license.features || [],
      usageLimits: license.usageLimits || {},
      currentUsage: license.currentUsage || {},
      expiresAt: license.expiresAt,
      lastVerifiedAt: license.lastVerifiedAt,
      createdAt: license.createdAt,
      updatedAt: license.updatedAt,
    }));

    return NextResponse.json({
      licenses: formattedLicenses,
      count: formattedLicenses.length,
    });
  } catch (error) {
    console.error('Error fetching licenses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/licenses/:id/regenerate
 * 
 * Regenerate a license key (creates new key, invalidates old)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const licenseId = pathParts[pathParts.length - 2]; // /api/licenses/[id]/regenerate

    if (!licenseId || licenseId === 'licenses') {
      return NextResponse.json(
        { error: 'License ID required' },
        { status: 400 }
      );
    }

    // Get the license
    const license = await db.query.sdkLicenses.findFirst({
      where: eq(sdkLicenses.id, licenseId),
    });

    if (!license) {
      return NextResponse.json(
        { error: 'License not found' },
        { status: 404 }
      );
    }

    // Verify the user owns this license
    if (license.customerEmail !== session.user.email) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Generate new license key
    const newLicenseKey = generateLicenseKey();

    // Update the license with new key
    await db
      .update(sdkLicenses)
      .set({
        licenseKey: newLicenseKey,
        updatedAt: new Date(),
        metadata: {
          ...(license.metadata as Record<string, unknown> || {}),
          regeneratedAt: new Date().toISOString(),
          previousKey: license.licenseKey,
        },
      })
      .where(eq(sdkLicenses.id, license.id));

    // Send email with new key
    await sendLicenseRegeneratedEmail({
      to: license.customerEmail,
      licenseKey: newLicenseKey,
    });

    return NextResponse.json({
      success: true,
      licenseId: license.id,
      licenseKey: newLicenseKey,
      licenseKeyMasked: maskLicenseKey(newLicenseKey),
      message: 'License key regenerated. Check your email for the new key.',
    });
  } catch (error) {
    console.error('Error regenerating license:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper: Mask license key for display (show only first and last 4 chars)
function maskLicenseKey(key: string): string {
  if (key.length <= 8) return '****';
  return `${key.slice(0, 4)}****${key.slice(-4)}`;
}

// Helper: Generate a secure license key
function generateLicenseKey(): string {
  const bytes = crypto.randomBytes(16);
  return `DREW-${bytes.toString('hex').toUpperCase().slice(0, 16).match(/.{4}/g)?.join('-')}`;
}
