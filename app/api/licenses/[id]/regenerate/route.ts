import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { sdkLicenses } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { sendLicenseRegeneratedEmail } from '@/lib/email';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/licenses/:id/regenerate
 * 
 * Regenerate a license key (creates new key, invalidates old)
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
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

    const { id: licenseId } = await params;

    if (!licenseId) {
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
    const currentMetadata = (license.metadata as Record<string, unknown>) || {};
    await db
      .update(sdkLicenses)
      .set({
        licenseKey: newLicenseKey,
        updatedAt: new Date(),
        metadata: {
          ...currentMetadata,
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
  const hex = bytes.toString('hex').toUpperCase().slice(0, 16);
  const parts = hex.match(/.{4}/g);
  return `DREW-${parts?.join('-') || hex}`;
}
