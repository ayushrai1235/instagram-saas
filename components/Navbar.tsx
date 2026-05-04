import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

export default async function Navbar() {
  const { userId } = await auth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0a0a0a]/60 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6366f1] group-hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-white">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-white/90 transition-colors">
              Social Copilot
            </span>
          </Link>

          <nav className="hidden md:flex gap-6">
            <Link href="/#features" className="text-sm text-white/60 hover:text-white transition-colors">
              Features
            </Link>
            <Link href="/#how-it-works" className="text-sm text-white/60 hover:text-white transition-colors">
              How it Works
            </Link>
            <Link href="/#testimonials" className="text-sm text-white/60 hover:text-white transition-colors">
              Testimonials
            </Link>
            <Link href="/pricing" className="text-sm text-white/60 hover:text-white transition-colors">
              Pricing
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {!userId ? (
            <>
              <SignInButton mode="modal">
                <button className="hidden sm:inline-flex text-sm text-white/60 hover:text-white transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button className="bg-[#6366f1] text-white hover:bg-[#4f51c0] hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all duration-300 border-none">
                  Get Started
                </Button>
              </SignUpButton>
            </>
          ) : (
            <>
              <Link href="/dashboard" className="hidden sm:inline-flex text-sm text-white/60 hover:text-white transition-colors mr-4">
                Dashboard
              </Link>
              <UserButton appearance={{ elements: { userButtonAvatarBox: "w-9 h-9" } }} />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
