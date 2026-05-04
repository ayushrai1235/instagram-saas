import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@/lib/env";

export const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export const getGeminiProModel = () => {
  return genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
};

export const getGeminiFlashModel = () => {
  return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
};
