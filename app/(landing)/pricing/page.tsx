import { Button } from "@/components/ui/button";
import { CheckCircle2, X } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing | Social Copilot",
  description: "Simple, transparent pricing for Social Copilot. Start for free and upgrade as you grow.",
};

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      {/* Header Section */}
      <section className="relative pt-32 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Background glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#6366f1] rounded-full blur-[150px] opacity-10 pointer-events-none" />
        
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
          Simple, transparent pricing
        </h1>
        <p className="text-lg md:text-xl text-white/60 max-w-2xl mb-12">
          Start for free, upgrade when you need to. No hidden fees.
        </p>
      </section>

      {/* Pricing Cards Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full mb-24 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Tier */}
          <div className="rounded-3xl border border-white/10 bg-[#0a0a0a]/40 backdrop-blur-xl p-8 flex flex-col hover:bg-white/[0.02] transition-colors relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <h3 className="text-xl font-semibold text-white mb-2">Hobby</h3>
            <p className="text-white/50 text-sm mb-6 h-10">Perfect for individuals just getting started with social media.</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">$0</span>
              <span className="text-white/50">/month</span>
            </div>
            <Link href="/sign-up" className="w-full z-10">
              <Button className="w-full h-12 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl mb-8 transition-colors">
                Get Started
              </Button>
            </Link>
            <div className="space-y-4 flex-1">
              {[
                "1 Social Account",
                "10 AI Generations / mo",
                "7 Days Analytics History",
                "1 Team Member"
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-indigo-400 shrink-0" />
                  <span className="text-white/70 text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Premium Tier */}
          <div className="rounded-3xl border border-[#6366f1]/50 bg-[#6366f1]/[0.05] backdrop-blur-xl p-8 flex flex-col relative transform md:-translate-y-4 shadow-[0_0_40px_rgba(99,102,241,0.15)] group">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-[#6366f1] rounded-full text-xs font-semibold text-white tracking-wide shadow-[0_0_20px_rgba(99,102,241,0.5)]">
              MOST POPULAR
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-[#6366f1]/10 to-transparent opacity-50 rounded-3xl pointer-events-none group-hover:opacity-70 transition-opacity duration-500" />
            <h3 className="text-xl font-semibold text-white mb-2 relative z-10">Pro</h3>
            <p className="text-white/60 text-sm mb-6 h-10 relative z-10">For serious creators and small teams scaling their audience.</p>
            <div className="mb-6 relative z-10">
              <span className="text-4xl font-bold text-white">$29</span>
              <span className="text-white/60">/month</span>
            </div>
            <Link href="/sign-up" className="w-full relative z-10">
              <Button className="w-full h-12 bg-[#6366f1] hover:bg-[#4f51c0] text-white border-none rounded-xl mb-8 shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all duration-300">
                Start 14-Day Free Trial
              </Button>
            </Link>
            <div className="space-y-4 flex-1 relative z-10">
              {[
                "5 Social Accounts",
                "Unlimited AI Generations",
                "1 Year Analytics History",
                "Unified Inbox",
                "Priority Support"
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#818cf8] shrink-0" />
                  <span className="text-white/90 text-sm font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Enterprise Tier */}
          <div className="rounded-3xl border border-white/10 bg-[#0a0a0a]/40 backdrop-blur-xl p-8 flex flex-col hover:bg-white/[0.02] transition-colors relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <h3 className="text-xl font-semibold text-white mb-2">Agency</h3>
            <p className="text-white/50 text-sm mb-6 h-10">For large teams and agencies managing multiple brands.</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">$99</span>
              <span className="text-white/50">/month</span>
            </div>
            <Link href="/sign-up" className="w-full z-10">
              <Button className="w-full h-12 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl mb-8 transition-colors">
                Contact Sales
              </Button>
            </Link>
            <div className="space-y-4 flex-1">
              {[
                "Unlimited Social Accounts",
                "Unlimited Analytics History",
                "Up to 5 Team Members",
                "White-label Reports",
                "Custom Integrations",
                "Dedicated Account Manager"
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-indigo-400 shrink-0" />
                  <span className="text-white/70 text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full mb-20 relative">
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-[#6366f1] rounded-full blur-[150px] opacity-5 pointer-events-none" />
        
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-10 text-center">Compare features</h2>
        
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="py-5 px-6 text-white/60 font-medium w-1/3">Features</th>
                <th className="py-5 px-6 text-white font-medium text-center w-[22%]">Hobby</th>
                <th className="py-5 px-6 text-[#818cf8] font-medium text-center w-[22%]">Pro</th>
                <th className="py-5 px-6 text-white font-medium text-center w-[22%]">Agency</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {[
                { name: "Social Accounts", free: "1", pro: "5", ent: "Unlimited" },
                { name: "AI Content Generation", free: "10 / mo", pro: "Unlimited", ent: "Unlimited" },
                { name: "Analytics History", free: "7 days", pro: "1 year", ent: "Unlimited" },
                { name: "Unified Inbox", free: false, pro: true, ent: true },
                { name: "Team Members", free: "1", pro: "1", ent: "Up to 5" },
                { name: "White-label Reports", free: false, pro: false, ent: true },
              ].map((row, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-6 text-white/80 font-medium">{row.name}</td>
                  <td className="py-4 px-6 text-center text-white/60">
                    {typeof row.free === 'boolean' ? (row.free ? <CheckCircle2 className="h-5 w-5 mx-auto text-indigo-400" /> : <X className="h-5 w-5 mx-auto text-white/20" />) : row.free}
                  </td>
                  <td className="py-4 px-6 text-center text-white/90 font-medium bg-[#6366f1]/[0.03]">
                    {typeof row.pro === 'boolean' ? (row.pro ? <CheckCircle2 className="h-5 w-5 mx-auto text-[#818cf8]" /> : <X className="h-5 w-5 mx-auto text-white/20" />) : row.pro}
                  </td>
                  <td className="py-4 px-6 text-center text-white/60">
                    {typeof row.ent === 'boolean' ? (row.ent ? <CheckCircle2 className="h-5 w-5 mx-auto text-indigo-400" /> : <X className="h-5 w-5 mx-auto text-white/20" />) : row.ent}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
