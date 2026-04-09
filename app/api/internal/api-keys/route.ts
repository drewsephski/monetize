import { NextRequest, NextResponse } from "next/server";
import {
  createApiKey,
  listApiKeys,
  revokeApiKey,
  getApiUsageStats,
} from "@/lib/auth/api-keys";
import { logger } from "@/lib/logger";

/**
 * POST /api/internal/api-keys
 *
 * Create a new API key for the authenticated developer account.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    // TODO: Get developerAccountId from authenticated session
    const developerAccountId = request.headers.get("x-developer-account-id");
    if (!developerAccountId) {
      return NextResponse.json(
        { error: "Developer account ID required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, expiresInDays, rateLimitPerMinute } = body;

    const result = await createApiKey({
      developerAccountId,
      name,
      expiresInDays,
      rateLimitPerMinute,
    });

    logger.info({
      msg: "API key created via API",
      keyId: result.id,
      developerAccountId,
      durationMs: Date.now() - startTime,
    });

    return NextResponse.json({
      success: true,
      apiKey: result,
      warning: "This is the only time the full API key will be shown. Store it securely.",
    });
  } catch (error) {
    logger.error({
      msg: "Failed to create API key",
      error: error instanceof Error ? error.message : String(error),
      durationMs: Date.now() - startTime,
    });

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create API key",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/internal/api-keys
 *
 * List API keys for the authenticated developer account.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // TODO: Get developerAccountId from authenticated session
    const developerAccountId = request.headers.get("x-developer-account-id");
    if (!developerAccountId) {
      return NextResponse.json(
        { error: "Developer account ID required" },
        { status: 401 }
      );
    }

    const keys = await listApiKeys(developerAccountId);

    // Get usage stats
    const stats = await getApiUsageStats(developerAccountId, 30);

    return NextResponse.json({
      keys,
      usageStats: stats,
    });
  } catch (error) {
    logger.error({
      msg: "Failed to list API keys",
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      { error: "Failed to list API keys" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/internal/api-keys
 *
 * Revoke an API key.
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    // TODO: Get developerAccountId from authenticated session
    const developerAccountId = request.headers.get("x-developer-account-id");
    if (!developerAccountId) {
      return NextResponse.json(
        { error: "Developer account ID required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get("id");

    if (!keyId) {
      return NextResponse.json(
        { error: "Key ID required" },
        { status: 400 }
      );
    }

    const success = await revokeApiKey(keyId, developerAccountId);

    if (!success) {
      return NextResponse.json(
        { error: "API key not found or already revoked" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "API key revoked successfully",
    });
  } catch (error) {
    logger.error({
      msg: "Failed to revoke API key",
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      { error: "Failed to revoke API key" },
      { status: 500 }
    );
  }
}
