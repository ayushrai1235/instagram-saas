"use server";

import { auth } from "@clerk/nextjs/server";
import { getGeminiProModel } from "@/lib/gemini";

export async function generateCaption(topic: string, tone: string, platform: string) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // TODO: Add rate limiting and check user plan limits here
  
  try {
    const model = getGeminiProModel();
    const prompt = `Write a social media post for ${platform} about: "${topic}".
The tone should be ${tone}.
Keep it within the character limits of ${platform} (e.g. Twitter is 280, LinkedIn is 3000, Instagram is 2200).
Include appropriate emojis and structure it well for maximum engagement.
Do not include any hashtags yet, just the caption text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini AI error:", error);
    throw new Error("Failed to generate caption");
  }
}

export async function generateHashtags(topic: string, platform: string) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const model = getGeminiProModel();
    const prompt = `Generate a list of 10 relevant, high-traffic hashtags for a ${platform} post about: "${topic}".
Return ONLY the hashtags separated by spaces, starting with #. Example: #socialmedia #marketing #tech`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Gemini AI error:", error);
    throw new Error("Failed to generate hashtags");
  }
}
