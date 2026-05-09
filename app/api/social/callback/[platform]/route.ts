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

// Token exchange URLs per platform
const PLATFORM_TOKEN_URLS: Record<string, string> = {
  linkedin: "https://www.linkedin.com/oauth/v2/accessToken",
  youtube: "https://oauth2.googleapis.com/token",
  instagram: "https://api.instagram.com/oauth/access_token",
  facebook: "https://graph.facebook.com/v18.0/oauth/access_token",
  twitter: "https://api.twitter.com/2/oauth2/token",
  tiktok: "https://open.tiktokapis.com/v2/oauth/token/",
  pinterest: "https://api.pinterest.com/v5/oauth/token",
};

// Map platform names to their environment variable prefixes
const PLATFORM_ENV_KEYS: Record<string, { clientId: string; clientSecret: string; redirectUri: string }> = {
  instagram: { clientId: "META_APP_ID", clientSecret: "META_APP_SECRET", redirectUri: "META_REDIRECT_URI" },
  facebook: { clientId: "META_APP_ID", clientSecret: "META_APP_SECRET", redirectUri: "META_REDIRECT_URI" },
  linkedin: { clientId: "LINKEDIN_CLIENT_ID", clientSecret: "LINKEDIN_CLIENT_SECRET", redirectUri: "LINKEDIN_REDIRECT_URI" },
  youtube: { clientId: "GOOGLE_CLIENT_ID", clientSecret: "GOOGLE_CLIENT_SECRET", redirectUri: "GOOGLE_REDIRECT_URI" },
  tiktok: { clientId: "TIKTOK_CLIENT_KEY", clientSecret: "TIKTOK_CLIENT_SECRET", redirectUri: "TIKTOK_REDIRECT_URI" },
  pinterest: { clientId: "PINTEREST_APP_ID", clientSecret: "PINTEREST_APP_SECRET", redirectUri: "PINTEREST_REDIRECT_URI" },
  twitter: { clientId: "TWITTER_CLIENT_ID", clientSecret: "TWITTER_CLIENT_SECRET", redirectUri: "TWITTER_REDIRECT_URI" },
};

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
  const error = searchParams.get("error");

  // Handle OAuth denial / errors from the provider
  if (error) {
    console.error(`OAuth error for ${platform}:`, error, searchParams.get("error_description"));
    const errorUrl = new URL("/settings/connections", request.url);
    errorUrl.searchParams.set("error", platform);
    return NextResponse.redirect(errorUrl);
  }

  if (!code) {
    return NextResponse.json(
      { error: "Missing authorization code" },
      { status: 400 }
    );
  }

  try {
    // Find the user in our database
    const dbUser = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const envKeys = PLATFORM_ENV_KEYS[platform];
    const clientId = envKeys ? process.env[envKeys.clientId] : undefined;
    const clientSecret = envKeys ? process.env[envKeys.clientSecret] : undefined;
    const redirectUri = envKeys ? process.env[envKeys.redirectUri] : undefined;
    const tokenUrl = PLATFORM_TOKEN_URLS[platform];

    let accessToken = "stub_access_token";
    let refreshToken: string | null = "stub_refresh_token";
    let expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    let platformUserId = `${platform}_user_${Date.now()}`;
    let platformUsername = `stub_${platform}_user`;

    // If we have real credentials, do the real token exchange
    if (clientId && clientSecret && redirectUri && tokenUrl && !clientId.startsWith("xxxx")) {
      // Step 1: Exchange code for access token
      const tokenResponse = await fetch(tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
          client_id: clientId,
          client_secret: clientSecret,
        }),
      });

      if (!tokenResponse.ok) {
        const errorBody = await tokenResponse.text();
        console.error(`Token exchange failed for ${platform}:`, errorBody);
        const errorUrl = new URL("/settings/connections", request.url);
        errorUrl.searchParams.set("error", platform);
        return NextResponse.redirect(errorUrl);
      }

      const tokenData = await tokenResponse.json();
      accessToken = tokenData.access_token;
      refreshToken = tokenData.refresh_token || null;
      expiresAt = tokenData.expires_in
        ? new Date(Date.now() + tokenData.expires_in * 1000)
        : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 days default

      // Step 2: Fetch user profile (platform-specific)
      if (platform === "linkedin") {
        const profileResponse = await fetch("https://api.linkedin.com/v2/userinfo", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (profileResponse.ok) {
          const profile = await profileResponse.json();
          platformUserId = profile.sub || platformUserId;
          platformUsername = profile.name || profile.email || platformUsername;
        }
      }
    }

    // Step 3: Store the social account
    // Check if this platform is already connected for this user
    const existingAccount = await db.query.socialAccounts.findFirst({
      where: and(
        eq(socialAccounts.userId, dbUser.id),
        eq(socialAccounts.platform, platform)
      ),
    });

    if (existingAccount) {
      // Update existing
      await db
        .update(socialAccounts)
        .set({
          accessToken,
          refreshToken,
          expiresAt,
          platformUserId,
          platformUsername,
          updatedAt: new Date(),
        })
        .where(eq(socialAccounts.id, existingAccount.id));
    } else {
      // Insert new
      await db.insert(socialAccounts).values({
        userId: dbUser.id,
        platform,
        accessToken,
        refreshToken,
        expiresAt,
        platformUserId,
        platformUsername,
      });
    }

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
