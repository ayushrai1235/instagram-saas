import { twitterPublisher } from "./twitter";
import { linkedinPublisher } from "./linkedin";
import { instagramPublisher } from "./instagram";
import { facebookPublisher } from "./facebook";

export type PublishContext = {
  content: string;
  mediaUrls: string[];
  accessToken: string;
  refreshToken?: string;
  platformUserId?: string;
};

export type PublishResult = {
  platformPostId: string;
};

export type PublisherFunction = (context: PublishContext) => Promise<PublishResult>;

export const platformPublishers: Record<string, PublisherFunction> = {
  twitter: twitterPublisher,
  linkedin: linkedinPublisher,
  instagram: instagramPublisher,
  facebook: facebookPublisher,
  // Add others as needed
};
