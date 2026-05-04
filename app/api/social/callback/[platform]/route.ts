import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users, socialAccounts } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

const SUPPORTED_PLATFORMS = [
  "instagram",
  "twitter",
  "linkedin",
  "facebook",
  "youtube",
  "tiktok",
  "pinterest",
  "threads",
  "reddit",
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params;

  // Check authentication
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // Validate platform
  if (!SUPPORTED_PLATFORMS.includes(platform)) {
    return NextResponse.json(
      { error: `Unsupported platform: ${platform}` },
      { status: 400 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code) {
    return NextResponse.json(
      { error: "Missing authorization code" },
      { status: 400 }
    );
  }

  try {
    // TODO: In production, exchange the authorization code for tokens:
    //
    // 1. Verify the `state` parameter against the stored session value (CSRF protection)
    // 2. Exchange `code` for access_token and refresh_token:
    //    const tokenResponse = await fetch(PLATFORM_TOKEN_URLS[platform], {
    //      method: "POST",
    //      body: new URLSearchParams({
    //        grant_type: "authorization_code",
    //        code,
    //        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/social/callback/${platform}`,
    //        client_id: process.env[`${platform.toUpperCase()}_CLIENT_ID`]!,
    //        client_secret: process.env[`${platform.toUpperCase()}_CLIENT_SECRET`]!,
    //      }),
    //    });
    // 3. Fetch the user's profile from the platform API
    // 4. Store in social_accounts table
    // 5. Enqueue the token-refresh job for platforms with short-lived tokens

    // Find the user in our database
    const dbUser = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Stub: Insert a mock social account record
    // In production, the access_token, refresh_token, etc. come from the OAuth exchange
    await db
      .insert(socialAccounts)
      .values({
        userId: dbUser.id,
        platform,
        accessToken: "stub_access_token",
        refreshToken: "stub_refresh_token",
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        platformUserId: `${platform}_user_${Date.now()}`,
        platformUsername: `stub_${platform}_user`,
      })
      .onConflictDoUpdate({
        target: socialAccounts.id,
        set: {
          accessToken: "stub_access_token",
          updatedAt: new Date(),
        },
      });

    // Redirect back to connections page
    const redirectUrl = new URL("/settings/connections", request.url);
    redirectUrl.searchParams.set("connected", platform);
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error(`OAuth callback error for ${platform}:`, error);
    const errorUrl = new URL("/settings/connections", request.url);
    errorUrl.searchParams.set("error", platform);
    return NextResponse.redirect(errorUrl);
  }
}
