import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

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

// In production, each platform would have its own OAuth configuration
// stored in lib/platforms/[platform].ts
const PLATFORM_OAUTH_CONFIGS: Record<
  string,
  { authUrl: string; scopes: string[] }
> = {
  instagram: {
    authUrl: "https://api.instagram.com/oauth/authorize",
    scopes: ["user_profile", "user_media"],
  },
  twitter: {
    authUrl: "https://twitter.com/i/oauth2/authorize",
    scopes: ["tweet.read", "tweet.write", "users.read"],
  },
  linkedin: {
    authUrl: "https://www.linkedin.com/oauth/v2/authorization",
    scopes: ["openid", "profile", "w_member_social"],
  },
  facebook: {
    authUrl: "https://www.facebook.com/v18.0/dialog/oauth",
    scopes: ["pages_manage_posts", "pages_read_engagement"],
  },
  youtube: {
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    scopes: ["https://www.googleapis.com/auth/youtube"],
  },
  tiktok: {
    authUrl: "https://www.tiktok.com/v2/auth/authorize",
    scopes: ["user.info.basic", "video.upload"],
  },
  pinterest: {
    authUrl: "https://www.pinterest.com/oauth",
    scopes: ["boards:read", "pins:read", "pins:write"],
  },
  threads: {
    authUrl: "https://threads.net/oauth/authorize",
    scopes: ["threads_basic", "threads_content_publish"],
  },
  reddit: {
    authUrl: "https://www.reddit.com/api/v1/authorize",
    scopes: ["submit", "identity"],
  },
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

  // Map platform names to their environment variable prefixes
  const PLATFORM_ENV_KEYS: Record<string, { clientId: string; redirectUri: string }> = {
    instagram: { clientId: "META_APP_ID", redirectUri: "META_REDIRECT_URI" },
    facebook: { clientId: "META_APP_ID", redirectUri: "META_REDIRECT_URI" },
    linkedin: { clientId: "LINKEDIN_CLIENT_ID", redirectUri: "LINKEDIN_REDIRECT_URI" },
    youtube: { clientId: "GOOGLE_CLIENT_ID", redirectUri: "GOOGLE_REDIRECT_URI" },
    tiktok: { clientId: "TIKTOK_CLIENT_KEY", redirectUri: "TIKTOK_REDIRECT_URI" },
    pinterest: { clientId: "PINTEREST_APP_ID", redirectUri: "PINTEREST_REDIRECT_URI" },
    twitter: { clientId: "TWITTER_CLIENT_ID", redirectUri: "TWITTER_REDIRECT_URI" },
  };

  const envKeys = PLATFORM_ENV_KEYS[platform];
  const clientId = envKeys ? process.env[envKeys.clientId] : undefined;
  const redirectUri = envKeys ? process.env[envKeys.redirectUri] : undefined;
  const config = PLATFORM_OAUTH_CONFIGS[platform];

  // If we have real credentials, build the actual OAuth URL
  if (clientId && redirectUri && !clientId.startsWith("xxxx")) {
    const state = crypto.randomUUID();
    const authorizationUrl = new URL(config.authUrl);
    authorizationUrl.searchParams.set("client_id", clientId);
    authorizationUrl.searchParams.set("redirect_uri", redirectUri);
    authorizationUrl.searchParams.set("scope", config.scopes.join(" "));
    authorizationUrl.searchParams.set("state", state);
    authorizationUrl.searchParams.set("response_type", "code");
    return NextResponse.redirect(authorizationUrl.toString());
  }

  // Fallback: redirect back to connections page for platforms without real credentials
  const redirectUrl = new URL("/settings/connections", request.url);
  redirectUrl.searchParams.set("connect", platform);
  redirectUrl.searchParams.set("status", "pending");
  return NextResponse.redirect(redirectUrl);
}
