import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { CSPostHogProvider } from './providers';
import SuspendedPostHogPageView from './PostHogPageView';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Social Copilot",
    default: "Social Copilot - AI-Powered Social Media Management",
  },
  description: "Automate your social media presence with AI-generated posts, intelligent scheduling, and an auto-reply engine.",
  openGraph: {
    title: "Social Copilot",
    description: "Automate your social media presence with AI-generated posts, intelligent scheduling, and an auto-reply engine.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Social Copilot",
    description: "Automate your social media presence with AI-generated posts, intelligent scheduling, and an auto-reply engine.",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <CSPostHogProvider>
          <body className="min-h-full flex flex-col">
            <SuspendedPostHogPageView />
            {children}
          </body>
        </CSPostHogProvider>
      </html>
    </ClerkProvider>
  );
}
