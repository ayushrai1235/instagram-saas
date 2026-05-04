import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users, socialAccounts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import ConnectionsClient from "./ConnectionsClient";

export const metadata: Metadata = {
  title: "Platform Connections",
  description: "Connect and manage your social media accounts",
};

export default async function ConnectionsPage() {
  const user = await currentUser();

  let connectedPlatforms: {
    id: string;
    platform: string;
    platformUsername: string | null;
  }[] = [];

  try {
    if (user?.id) {
      const dbUser = await db.query.users.findFirst({
        where: eq(users.clerkId, user.id),
      });

      if (dbUser) {
        const accounts = await db
          .select({
            id: socialAccounts.id,
            platform: socialAccounts.platform,
            platformUsername: socialAccounts.platformUsername,
          })
          .from(socialAccounts)
          .where(eq(socialAccounts.userId, dbUser.id));

        connectedPlatforms = accounts;
      }
    }
  } catch (error) {
    console.error("Error fetching connections:", error);
  }

  return <ConnectionsClient connectedPlatforms={connectedPlatforms} />;
}
