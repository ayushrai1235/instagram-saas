import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Link from "next/link";
import { CheckCircle2, Zap, BarChart3, Clock, Share2, MessageSquare, Hash, Image, Video, Users, Globe, Link as LinkIcon } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Social Copilot | AI-Powered Social Media Management",
  description: "Automate, analyze, and grow your social media presence with AI. Social Copilot helps you manage all your platforms from one unified dashboard.",
  openGraph: {
    title: "Social Copilot | AI-Powered Social Media Management",
    description: "Automate, analyze, and grow your social media presence with AI.",
    type: "website",
    url: "https://socialcopilot.com",
    siteName: "Social Copilot",
  },
};

export default function LandingPage() {
  return (
    <div className="flex flex-col overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#6366f1] rounded-full blur-[120px] opacity-20 pointer-events-none" />
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in-up">
          <span className="flex h-2 w-2 rounded-full bg-[#6366f1] animate-pulse" />
          <span className="text-sm font-medium text-white/80">Social Copilot 2.0 is live</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 animate-fade-in-up [animation-delay:100ms]">
          Manage your social <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#818cf8] via-[#6366f1] to-[#a5b4fc]">
            empire with AI.
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-white/60 max-w-2xl mb-12 animate-fade-in-up [animation-delay:200ms]">
          Stop wasting hours on social media. Automate your scheduling, let AI draft your content, and analyze your growth across all platforms in one beautiful dashboard.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-fade-in-up [animation-delay:300ms]">
          <Link href="/sign-up" className={buttonVariants({ size: "lg", className: "h-14 px-8 text-base bg-[#6366f1] hover:bg-[#4f51c0] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all duration-300 border-none rounded-xl" })}>
            Start for free
          </Link>
          <Link href="#how-it-works" className={buttonVariants({ size: "lg", variant: "outline", className: "h-14 px-8 text-base bg-transparent border-white/10 text-white hover:bg-white/5 transition-all duration-300 rounded-xl" })}>
            See how it works
          </Link>
        </div>

        {/* Hero Platform Icons */}
        <div className="mt-20 flex gap-4 md:gap-8 justify-center items-center opacity-50 grayscale hover:grayscale-0 transition-all duration-500 animate-fade-in-up [animation-delay:400ms]">
          {[Hash, Image, Video, Users, Globe, LinkIcon].map((Icon, i) => (
            <div key={i} className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 hover:border-[#6366f1]/50 hover:bg-[#6366f1]/10 hover:scale-110 transition-all duration-300 cursor-pointer">
              <Icon className="h-6 w-6" />
            </div>
          ))}
        </div>
      </section>

      {/* Marquee Section */}
      <section className="border-y border-white/5 bg-white/[0.02] py-10 overflow-hidden relative">
        <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10" />
        <div className="flex w-[200%] animate-[marquee_20s_linear_infinite]">
          {/* First set */}
          <div className="flex w-1/2 justify-around items-center opacity-40">
            {[Hash, Image, Video, Users, Globe, LinkIcon].map((Icon, i) => (
              <Icon key={`first-${i}`} className="h-8 w-8" />
            ))}
          </div>
          {/* Duplicate set for seamless loop */}
          <div className="flex w-1/2 justify-around items-center opacity-40">
            {[Hash, Image, Video, Users, Globe, LinkIcon].map((Icon, i) => (
              <Icon key={`second-${i}`} className="h-8 w-8" />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Everything you need.</h2>
          <p className="text-lg text-white/50 max-w-2xl mx-auto">Powerful features designed to save you time and skyrocket your engagement.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: "AI Content Generation", description: "Generate viral-worthy posts tailored to each platform's unique algorithm and audience.", icon: Zap },
            { title: "Unified Inbox", description: "Respond to comments, DMs, and mentions across all platforms from a single, fast interface.", icon: MessageSquare },
            { title: "Smart Scheduling", description: "Our AI analyzes your audience and automatically posts when they are most active.", icon: Clock },
            { title: "Deep Analytics", description: "Understand what works. Beautiful charts and actionable insights for your campaigns.", icon: BarChart3 },
            { title: "Cross-platform Sync", description: "Draft once, publish everywhere. We optimize image sizes and text lengths automatically.", icon: Share2 },
            { title: "Team Collaboration", description: "Approve workflows, assign tasks, and manage roles for your entire social media team.", icon: CheckCircle2 },
          ].map((feature, i) => (
            <Card key={i} className="group relative overflow-hidden bg-[#131313]/80 border-white/5 p-8 hover:border-[#6366f1]/30 transition-all duration-500 rounded-2xl hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-[#6366f1]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="h-12 w-12 rounded-lg bg-[#6366f1]/10 flex items-center justify-center mb-6 border border-[#6366f1]/20 group-hover:scale-110 transition-transform duration-500">
                  <feature.icon className="h-6 w-6 text-[#6366f1]" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-white/50 leading-relaxed">{feature.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 md:py-32 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">How it works</h2>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">From idea to viral post in three simple steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-[#6366f1]/30 to-transparent" />
            
            {[
              { step: "01", title: "Connect Accounts", desc: "Securely link your Twitter, LinkedIn, Instagram, and more in seconds." },
              { step: "02", title: "Generate & Schedule", desc: "Let our AI draft your content, then drop it into your calendar." },
              { step: "03", title: "Watch it Grow", desc: "Sit back while we publish automatically and collect the analytics." },
            ].map((item, i) => (
              <div key={i} className="relative flex flex-col items-center text-center group">
                <div className="h-24 w-24 rounded-full bg-[#131313] border border-white/10 flex items-center justify-center text-2xl font-bold text-[#6366f1] mb-8 relative z-10 group-hover:border-[#6366f1]/50 group-hover:shadow-[0_0_30px_rgba(99,102,241,0.2)] transition-all duration-500">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                <p className="text-white/50 leading-relaxed max-w-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Loved by creators.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { quote: "Social Copilot literally saved me 15 hours a week. The AI writing is actually good, unlike other tools I've tried.", name: "Sarah Jenkins", role: "Marketing Director" },
            { quote: "The unified inbox alone is worth the price. Being able to reply to TikTok and Instagram comments in one place is magic.", name: "David Chen", role: "Content Creator" },
            { quote: "I've doubled my Twitter following since using the smart scheduling. It posts exactly when my audience is awake.", name: "Emily Ross", role: "Startup Founder" },
          ].map((t, i) => (
            <Card key={i} className="bg-gradient-to-b from-[#131313] to-[#0a0a0a] border-white/5 p-8 relative overflow-hidden group hover:border-white/10 transition-colors">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#6366f1] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="mb-6 flex gap-1">
                {[1,2,3,4,5].map(star => <svg key={star} className="w-5 h-5 text-yellow-500 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
              </div>
              <p className="text-white/80 text-lg leading-relaxed mb-8">"{t.quote}"</p>
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-white/10" />
                <div>
                  <div className="font-semibold text-white">{t.name}</div>
                  <div className="text-sm text-[#6366f1]">{t.role}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Teaser / CTA */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#6366f1]/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#6366f1] rounded-full blur-[150px] opacity-10 pointer-events-none" />
        
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">Ready to scale your social?</h2>
          <p className="text-xl text-white/60 mb-10">Join thousands of creators saving time and growing faster.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/pricing" className={buttonVariants({ size: "lg", className: "h-14 px-10 text-base bg-[#6366f1] hover:bg-[#4f51c0] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all duration-300 border-none rounded-xl" })}>
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Frequently asked questions</h2>
        </div>

        <Accordion className="w-full space-y-4">
          {[
            { q: "What social networks do you support?", a: "We currently support Twitter, LinkedIn, Instagram, Facebook Pages, YouTube, and Pinterest. TikTok support is coming next month." },
            { q: "Can I connect multiple accounts?", a: "Yes, depending on your plan, you can connect anywhere from 3 to unlimited social media accounts." },
            { q: "How does the AI content generation work?", a: "Our AI is fine-tuned on highly engaging social media posts. You provide a prompt, link, or idea, and it generates platform-specific variations." },
            { q: "Is there a free trial?", a: "Yes, all paid plans come with a 14-day free trial. No credit card required to start." },
            { q: "Can I cancel anytime?", a: "Absolutely. There are no long-term contracts for our monthly plans, and you can cancel with one click." },
            { q: "Do you offer custom enterprise plans?", a: "Yes, for large teams and agencies we offer custom limits, dedicated support, and custom onboarding. Please contact sales." },
          ].map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="bg-[#131313] border border-white/5 rounded-xl px-6 data-[state=open]:border-[#6366f1]/30 transition-colors">
              <AccordionTrigger className="text-white hover:text-white hover:no-underline py-6 text-left font-medium">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-white/50 pb-6 leading-relaxed">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  );
}
