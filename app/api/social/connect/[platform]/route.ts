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

  // TODO: In production, generate the actual OAuth authorization URL
  // with proper client_id, redirect_uri, state, and PKCE code_challenge
  //
  // const config = PLATFORM_OAUTH_CONFIGS[platform];
  // const state = crypto.randomUUID(); // Store in session for CSRF protection
  // const authorizationUrl = new URL(config.authUrl);
  // authorizationUrl.searchParams.set("client_id", process.env[`${platform.toUpperCase()}_CLIENT_ID`]!);
  // authorizationUrl.searchParams.set("redirect_uri", `${process.env.NEXT_PUBLIC_APP_URL}/api/social/callback/${platform}`);
  // authorizationUrl.searchParams.set("scope", config.scopes.join(" "));
  // authorizationUrl.searchParams.set("state", state);
  // authorizationUrl.searchParams.set("response_type", "code");
  // return NextResponse.redirect(authorizationUrl.toString());

  // Stub: redirect back to connections page with a message
  const redirectUrl = new URL("/settings/connections", request.url);
  redirectUrl.searchParams.set("connect", platform);
  redirectUrl.searchParams.set("status", "pending");
  return NextResponse.redirect(redirectUrl);
}
