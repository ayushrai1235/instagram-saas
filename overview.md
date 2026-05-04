---
id: "f57a0a1f-2221-43d3-b264-3ecff7e89564"
title: "Social Copilot — Master Architecture & Product Overview"
createdAt: "2026-05-04T18:47:42.846Z"
updatedAt: "2026-05-04T18:48:35.199Z"
type: spec
---

# Social Copilot — Master Architecture & Product Overview

# Social Copilot — Master Architecture & Product Overview

## 1. Product Vision

**Social Copilot** is a professional SaaS platform that enables creators, marketers, and businesses to manage all their social media presence from a single dashboard. Users connect multiple social platforms, compose posts once, publish or schedule them across channels, and leverage AI-powered auto-reply features — all backed by a subscription billing model.

## 2. Technology Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack, React 19.2) |
| Language | TypeScript 5.1+ |
| UI Components | Shadcn/ui + Tailwind CSS |
| Authentication & Billing | Clerk (Auth + Clerk Billing → Stripe) |
| Database | NeonDB (PostgreSQL, serverless) |
| ORM | Drizzle ORM |
| File Storage & AI Media | ImageKit |
| Background Jobs | BullMQ + Redis (Upstash Redis) |
| AI Model | Google Gemini AI (via `@google/generative-ai`) |
| Node.js Runtime | ≥ 20.9.0 (Next.js 16 requirement) |

## 3. Supported Social Platforms

| Platform | Post | Schedule | Auto-Reply |
| --- | --- | --- | --- |
| Instagram | ✅ | ✅ | ✅ |
| YouTube | ✅ | ✅ | ✅ |
| TikTok | ✅ | ✅ | ✅ |
| Facebook | ✅ | ✅ | ✅ |
| LinkedIn | ✅ | ✅ | ✅ |
| Pinterest | ✅ | ✅ | ❌ |
| Discord | ✅ | ✅ | ✅ |
| Twitter / X | ✅ | ✅ | ✅ |
| Slack | ✅ | ✅ | ✅ |

## 4. High-Level Architecture

```mermaid
graph TD
    A[User Browser] --> B[Next.js 16 App Router]
    B --> C[Clerk Auth + Billing]
    B --> D[Drizzle ORM]
    D --> E[NeonDB PostgreSQL]
    B --> F[ImageKit SDK]
    B --> G[BullMQ Queue]
    G --> H[Redis - Upstash]
    G --> I[BullMQ Workers]
    I --> J[Social Platform APIs]
    I --> K[Gemini AI]
    I --> F
    B --> L[Gemini AI - Server Actions]
```

## 5. Application Modules

| # | Module | Description |
| --- | --- | --- |
| 1 | Landing Page | Public marketing page with pricing table |
| 2 | Authentication | Clerk sign-up / sign-in / org management |
| 3 | Dashboard | Overview stats, quick actions |
| 4 | Platform Connections | OAuth connect/disconnect per platform |
| 5 | Post Composer | Rich editor, multi-platform targeting, media upload |
| 6 | Post Scheduler | Date/time picker, BullMQ delayed jobs |
| 7 | Calendar View | Full-calendar view of all scheduled posts |
| 8 | Auto-Reply Engine | Keyword rules + AI-generated replies via Gemini |
| 9 | Media Library | ImageKit-backed file manager with AI transforms |
| 10 | Billing & Plans | Clerk Billing + Stripe, Free/Premium plans |
| 11 | Analytics | Per-platform engagement metrics |
| 12 | Settings | Profile, notifications, connected accounts |

## 6. Subscription Plans

| Feature | Free | Premium |
| --- | --- | --- |
| Connected Platforms | 2 | Unlimited |
| Scheduled Posts / Month | 10 | Unlimited |
| Auto-Reply Rules | 2 | Unlimited |
| AI Caption Generation | 5 / month | Unlimited |
| Media Storage (ImageKit) | 500 MB | 10 GB |
| Team Members | 1 | 5 |
| Analytics | Basic | Advanced |
| Priority Support | ❌ | ✅ |

## 7. Database Schema (Drizzle ORM)

### Core Tables

```
users              → synced from Clerk webhook
social_accounts    → platform, access_token, refresh_token, expires_at
posts              → content, media_urls, status, scheduled_at, platforms[]
post_platforms     → post_id, platform, platform_post_id, status
auto_reply_rules   → user_id, platform, trigger_type, keywords[], reply_template, ai_enabled
comment_events     → post_id, platform, comment_id, comment_text, replied_at
media_assets       → user_id, imagekit_file_id, url, type, size
```

### Entity Relationships

```mermaid
classDiagram
    class User {
        +id: string
        +clerkId: string
        +email: string
        +plan: enum
    }
    class SocialAccount {
        +id: string
        +userId: string
        +platform: enum
        +accessToken: string
        +refreshToken: string
        +expiresAt: timestamp
    }
    class Post {
        +id: string
        +userId: string
        +content: string
        +mediaUrls: string[]
        +status: enum
        +scheduledAt: timestamp
    }
    class PostPlatform {
        +postId: string
        +platform: enum
        +platformPostId: string
        +status: enum
    }
    class AutoReplyRule {
        +id: string
        +userId: string
        +platform: enum
        +triggerType: enum
        +keywords: string[]
        +replyTemplate: string
        +aiEnabled: boolean
    }
    class MediaAsset {
        +id: string
        +userId: string
        +imagekitFileId: string
        +url: string
        +type: enum
    }

    User "1" --> "many" SocialAccount
    User "1" --> "many" Post
    Post "1" --> "many" PostPlatform
    User "1" --> "many" AutoReplyRule
    User "1" --> "many" MediaAsset
```

## 8. BullMQ Job Queues

| Queue Name | Trigger | Worker Action |
| --- | --- | --- |
| `post-publisher` | Scheduled time reached | Publish post to each selected platform API |
| `comment-poller` | Cron every 5 min | Poll platform APIs for new comments |
| `auto-reply` | New comment detected | Run keyword match or Gemini AI → post reply |
| `token-refresh` | Cron every hour | Refresh expiring OAuth tokens |
| `media-transform` | Post-upload | Apply ImageKit AI transformations |

## 9. Post Publishing Flow

```mermaid
sequenceDiagram
    participant U as User
    participant App as Next.js App
    participant DB as NeonDB
    participant Q as BullMQ Queue
    participant W as Worker
    participant P as Platform API

    U->>App: Create post + select platforms + schedule time
    App->>DB: Save post (status: scheduled)
    App->>Q: Enqueue delayed job (post-publisher)
    Q-->>W: Job fires at scheduled time
    W->>DB: Fetch post + platform tokens
    W->>P: Publish via platform API
    P-->>W: Platform post ID
    W->>DB: Update post_platforms (status: published)
    W->>App: Webhook / SSE update
    App-->>U: Real-time status update
```

## 10. Auto-Reply Flow

```mermaid
sequenceDiagram
    participant W as Comment Poller Worker
    participant DB as NeonDB
    participant G as Gemini AI
    participant P as Platform API

    W->>P: Poll for new comments
    P-->>W: New comments list
    W->>DB: Check auto_reply_rules for user
    alt Keyword match found
        W->>DB: Fetch reply_template
        W->>P: Post reply with template
    else AI-enabled rule
        W->>G: Generate reply (comment context + brand voice)
        G-->>W: AI-generated reply text
        W->>P: Post AI reply
    end
    W->>DB: Log to comment_events
```

## 11. Project Directory Structure

```
social-copilot/
├── app/
│   ├── (landing)/              # Public marketing pages
│   │   ├── page.tsx            # Landing page
│   │   └── pricing/page.tsx    # Pricing page
│   ├── (auth)/                 # Clerk auth pages
│   ├── (dashboard)/            # Protected app shell
│   │   ├── layout.tsx          # Sidebar + nav
│   │   ├── dashboard/page.tsx
│   │   ├── compose/page.tsx    # Post composer
│   │   ├── calendar/page.tsx   # Scheduled posts calendar
│   │   ├── auto-reply/page.tsx
│   │   ├── media/page.tsx      # Media library
│   │   ├── analytics/page.tsx
│   │   └── settings/page.tsx
│   ├── api/
│   │   ├── webhooks/clerk/     # Clerk user sync
│   │   ├── webhooks/platforms/ # Platform comment webhooks
│   │   ├── social/connect/     # OAuth initiation
│   │   ├── social/callback/    # OAuth callbacks
│   │   ├── posts/              # CRUD
│   │   ├── media/upload/       # ImageKit upload
│   │   └── auto-reply/         # Rule CRUD
│   └── proxy.ts                # Next.js 16 network boundary
├── workers/
│   ├── post-publisher.worker.ts
│   ├── comment-poller.worker.ts
│   ├── auto-reply.worker.ts
│   └── token-refresh.worker.ts
├── lib/
│   ├── db/
│   │   ├── schema.ts           # Drizzle schema
│   │   └── index.ts            # NeonDB connection
│   ├── queues/
│   │   └── index.ts            # BullMQ queue definitions
│   ├── imagekit/
│   │   └── index.ts            # ImageKit client
│   ├── gemini/
│   │   └── index.ts            # Gemini AI client
│   └── platforms/              # Per-platform API clients
│       ├── instagram.ts
│       ├── youtube.ts
│       ├── tiktok.ts
│       └── ...
├── components/
│   ├── ui/                     # Shadcn components
│   ├── composer/               # Post composer components
│   ├── calendar/               # Calendar view
│   ├── auto-reply/             # Rule builder UI
│   └── media/                  # Media library UI
├── drizzle/
│   └── migrations/
├── .env.example
└── drizzle.config.ts
```

## 12. Environment Variables (`.env.example`)

```env
# ─── App ───────────────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# ─── Clerk (Auth + Billing) ────────────────────────────────────────────────
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# ─── NeonDB (PostgreSQL) ───────────────────────────────────────────────────
DATABASE_URL=postgresql://user:password@ep-xxxx.us-east-1.aws.neon.tech/social_copilot?sslmode=require

# ─── Redis (Upstash for BullMQ) ────────────────────────────────────────────
REDIS_URL=rediss://default:xxxxxxxxxxxxxxxxxxxx@xxxx.upstash.io:6379

# ─── ImageKit ──────────────────────────────────────────────────────────────
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=public_xxxxxxxxxxxxxxxxxxxx
IMAGEKIT_PRIVATE_KEY=private_xxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id

# ─── Google Gemini AI ──────────────────────────────────────────────────────
GEMINI_API_KEY=AIzaxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ─── Social Platform OAuth ─────────────────────────────────────────────────
# Instagram / Facebook (Meta)
META_APP_ID=xxxxxxxxxxxxxxxxxxxx
META_APP_SECRET=xxxxxxxxxxxxxxxxxxxx
META_REDIRECT_URI=http://localhost:3000/api/social/callback/instagram

# YouTube / Google
GOOGLE_CLIENT_ID=xxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxx
GOOGLE_REDIRECT_URI=http://localhost:3000/api/social/callback/youtube

# TikTok
TIKTOK_CLIENT_KEY=xxxxxxxxxxxxxxxxxxxx
TIKTOK_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxx
TIKTOK_REDIRECT_URI=http://localhost:3000/api/social/callback/tiktok

# LinkedIn
LINKEDIN_CLIENT_ID=xxxxxxxxxxxxxxxxxxxx
LINKEDIN_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxx
LINKEDIN_REDIRECT_URI=http://localhost:3000/api/social/callback/linkedin

# Pinterest
PINTEREST_APP_ID=xxxxxxxxxxxxxxxxxxxx
PINTEREST_APP_SECRET=xxxxxxxxxxxxxxxxxxxx
PINTEREST_REDIRECT_URI=http://localhost:3000/api/social/callback/pinterest

# Discord
DISCORD_CLIENT_ID=xxxxxxxxxxxxxxxxxxxx
DISCORD_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxx
DISCORD_REDIRECT_URI=http://localhost:3000/api/social/callback/discord

# Twitter / X
TWITTER_CLIENT_ID=xxxxxxxxxxxxxxxxxxxx
TWITTER_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxx
TWITTER_REDIRECT_URI=http://localhost:3000/api/social/callback/twitter

# Slack
SLACK_CLIENT_ID=xxxxxxxxxxxxxxxxxxxx
SLACK_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxx
SLACK_REDIRECT_URI=http://localhost:3000/api/social/callback/slack
```
