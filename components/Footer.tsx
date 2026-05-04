import Link from "next/link";
import { MessageCircle, Briefcase, Camera, Code } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0a0a0a] pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#6366f1]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-white">
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                </svg>
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                Social Copilot
              </span>
            </Link>
            <p className="text-sm text-white/50 leading-relaxed mb-6">
              AI-powered social media management. Create, schedule, and analyze content effortlessly.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="text-white/40 hover:text-white hover:scale-110 transition-all duration-300">
                <MessageCircle className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-white/40 hover:text-white hover:scale-110 transition-all duration-300">
                <Briefcase className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
              <Link href="#" className="text-white/40 hover:text-white hover:scale-110 transition-all duration-300">
                <Camera className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-white/40 hover:text-white hover:scale-110 transition-all duration-300">
                <Code className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4">Product</h3>
            <ul className="space-y-3">
              <li><Link href="/#features" className="text-sm text-white/50 hover:text-white hover:translate-x-1 inline-block transition-all">Features</Link></li>
              <li><Link href="/pricing" className="text-sm text-white/50 hover:text-white hover:translate-x-1 inline-block transition-all">Pricing</Link></li>
              <li><Link href="/#how-it-works" className="text-sm text-white/50 hover:text-white hover:translate-x-1 inline-block transition-all">How it works</Link></li>
              <li><Link href="#" className="text-sm text-white/50 hover:text-white hover:translate-x-1 inline-block transition-all">Changelog</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-sm text-white/50 hover:text-white hover:translate-x-1 inline-block transition-all">About Us</Link></li>
              <li><Link href="#" className="text-sm text-white/50 hover:text-white hover:translate-x-1 inline-block transition-all">Careers</Link></li>
              <li><Link href="#" className="text-sm text-white/50 hover:text-white hover:translate-x-1 inline-block transition-all">Blog</Link></li>
              <li><Link href="#" className="text-sm text-white/50 hover:text-white hover:translate-x-1 inline-block transition-all">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-sm text-white/50 hover:text-white hover:translate-x-1 inline-block transition-all">Privacy Policy</Link></li>
              <li><Link href="#" className="text-sm text-white/50 hover:text-white hover:translate-x-1 inline-block transition-all">Terms of Service</Link></li>
              <li><Link href="#" className="text-sm text-white/50 hover:text-white hover:translate-x-1 inline-block transition-all">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/40">
            © {new Date().getFullYear()} Social Copilot Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs text-white/50 font-medium tracking-wider">SYSTEMS OPERATIONAL</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
