"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { NeoButton, SectionHeading, NeoCard, NeoBadge } from "@/components/ui/NeoBrutalism";
import { Star, ArrowUpRight, Zap, Box, TrendingDown, ShieldCheck, Mail } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  const heroRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.from(".hero-content", {
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="overflow-x-hidden">
      {/* HERO SECTION */}
      <section ref={heroRef} className="relative min-h-[90vh] flex flex-col justify-center items-center text-center px-6 pt-20">
        <div className="hero-content mb-6">
          <NeoBadge color="bg-purple-500 text-white" className="rotate-[-2deg] text-lg px-8 py-3">
            Free AI Spend Audit
          </NeoBadge>
        </div>

        <div className="hero-content">
          <h1 className="text-[4rem] md:text-[8rem] font-black uppercase tracking-tighter leading-[0.8] mb-4">
            Stop Burning <br />
            <span className="text-outline">AI Cash.</span>
          </h1>
        </div>

        <p className="hero-content max-w-2xl text-xl md:text-2xl font-medium mb-12 text-neutral-600">
          Your startup is likely overpaying for Cursor, Claude, and ChatGPT. 
          Get a professional audit in <span className="font-bold underline decoration-4 decoration-[#ccff00]">2 minutes</span> and find thousands in annual savings.
        </p>

        <div className="hero-content flex flex-col md:flex-row gap-6">
          <Link href="/audit">
            <NeoButton size="lg" className="group">
              Start Free Audit <ArrowUpRight className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </NeoButton>
          </Link>
          <Link href="/share/demo-audit">
            <NeoButton variant="white" size="lg">
              See Example Report
            </NeoButton>
          </Link>
        </div>

        {/* Floating Icons */}
        <div className="absolute top-[20%] left-[10%] rotate-[-15deg] hidden lg:block opacity-20">
          <Box size={120} />
        </div>
        <div className="absolute bottom-[20%] right-[10%] rotate-[15deg] hidden lg:block opacity-20">
          <Zap size={120} />
        </div>
      </section>

      {/* MARQUEE */}
      <div className="bg-[#ccff00] border-y-4 border-black py-6 rotate-[-1deg] scale-105 z-20 relative overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="text-4xl md:text-5xl font-black uppercase mx-8 flex items-center gap-4">
              Cursor <Star fill="black" /> Claude <Star fill="black" /> ChatGPT <Star fill="black" /> Copilot <Star fill="black" /> Windsurf <Star fill="black" /> Gemini <Star fill="black" />
            </span>
          ))}
        </div>
        <style jsx>{`
          .animate-marquee {
            animation: marquee 30s linear infinite;
          }
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </div>

      {/* HOW IT WORKS */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <SectionHeading 
          subtitle="The Process"
          title="Audit in"
          outlineText="3 Steps."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <NeoCard color="bg-white">
            <div className="mb-6 bg-black text-[#ccff00] w-16 h-16 flex items-center justify-center rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_#000]">
              <span className="text-3xl font-black italic">01</span>
            </div>
            <h3 className="text-2xl font-black uppercase mb-4">Input Tools</h3>
            <p className="font-medium text-neutral-600 italic">Enter what your team uses today. We support all major AI dev tools and LLMs.</p>
          </NeoCard>

          <NeoCard color="bg-[#ccff00]">
            <div className="mb-6 bg-black text-white w-16 h-16 flex items-center justify-center rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_#000]">
              <span className="text-3xl font-black italic">02</span>
            </div>
            <h3 className="text-2xl font-black uppercase mb-4">Analyze Logic</h3>
            <p className="font-black text-black">Our engine evaluates per-seat costs, redundancy, and hidden cheaper tiers.</p>
          </NeoCard>

          <NeoCard color="bg-orange-400">
            <div className="mb-6 bg-black text-white w-16 h-16 flex items-center justify-center rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_#000]">
              <span className="text-3xl font-black italic">03</span>
            </div>
            <h3 className="text-2xl font-black uppercase mb-4">Save Thousands</h3>
            <p className="font-medium text-black italic font-bold">Get a detailed breakdown and AI-generated summary of your savings opportunities.</p>
          </NeoCard>
        </div>
      </section>

      {/* FEATURES / VALUE PROP */}
      <section className="bg-black text-white py-32 px-6 border-y-4 border-black">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-black uppercase mb-16 leading-tight">
            Why Audit <span className="text-outline-white">Now?</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="flex gap-6">
              <div className="shrink-0 w-16 h-16 bg-[#ccff00] text-black flex items-center justify-center rounded-xl border-4 border-white shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
                <TrendingDown size={32} />
              </div>
              <div>
                <h3 className="text-3xl font-black uppercase mb-4">Kill Redundancy</h3>
                <p className="text-neutral-400 text-lg">Are you paying for Claude Pro and ChatGPT Plus for the same team? That's $240/year per user gone.</p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="shrink-0 w-16 h-16 bg-purple-500 text-white flex items-center justify-center rounded-xl border-4 border-white shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
                <ShieldCheck size={32} />
              </div>
              <div>
                <h3 className="text-3xl font-black uppercase mb-4">Defensible Math</h3>
                <p className="text-neutral-400 text-lg">Our calculations are based on verified May 2026 pricing. No guesswork, just pure ROI.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-40 px-6 bg-[#ccff00] border-b-4 border-black text-center relative overflow-hidden">
         <div className="relative z-10 max-w-5xl mx-auto">
            <h2 className="text-[4rem] md:text-[8rem] font-black uppercase leading-[0.8] tracking-tighter italic mb-16">
              READY TO <br /> <span className="text-outline">CUT WASTE?</span>
            </h2>
            <Link href="/audit">
              <NeoButton variant="black" size="lg" className="mx-auto group">
                Claim Your Savings <ArrowUpRight className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </NeoButton>
            </Link>
         </div>
      </section>
    </div>
  );
}
