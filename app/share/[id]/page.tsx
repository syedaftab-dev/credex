"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ResultsHero, ToolBreakdownTable } from "@/components/ResultsDisplay";
import { AuditResult } from "@/lib/audit-engine";
import { supabase, hasSupabaseKeys } from "@/lib/supabase";
import { Sparkles, ArrowRight } from "lucide-react";
import { NeoCard, NeoButton, NeoBadge } from "@/components/ui/NeoBrutalism";
import Link from "next/link";
import Head from "next/head";

// This is a client component, so we can't export metadata directly in Next.js 15 App Router easily if it's 'use client'
// But we can use a separate layout or just keep it simple.
// For now, I'll add the Head tags for the browser to pick up.

export default function SharePage() {
  const { id } = useParams();
  const [data, setData] = useState<{ results: AuditResult; summary: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResult() {
      if (!hasSupabaseKeys || id === "demo-audit") {
        // Mock data for demo if no keys or demo requested
        setData({
          results: {
            perTool: [
              { toolId: "cursor", toolName: "Cursor", currentPlanName: "Business", currentMonthlyCost: 400, recommendedPlanId: "pro", recommendedPlanName: "Pro", recommendedMonthlyCost: 200, monthlySavings: 200, reason: "Optimized per-seat costs.", isRedundant: false },
              { toolId: "claude", toolName: "Claude", currentPlanName: "Pro", currentMonthlyCost: 200, recommendedPlanId: "pro", recommendedPlanName: "Pro", recommendedMonthlyCost: 0, monthlySavings: 200, reason: "Redundancy found.", isRedundant: true },
            ],
            totalCurrentMonthly: 600,
            totalRecommendedMonthly: 200,
            totalMonthlySavings: 400,
            totalAnnualSavings: 4800,
            showCredex: false,
            isHealthy: false,
          },
          summary: "This team could save $4,800/year by consolidating redundant LLM subscriptions and right-sizing their AI dev environment."
        });
        setLoading(false);
        return;
      }

      try {
        const { data: audit, error } = await supabase
          .from("audits")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setData({ results: audit.results, summary: audit.ai_summary });
      } catch (e) {
        console.error("Fetch failed", e);
      } finally {
        setLoading(false);
      }
    }

    fetchResult();
  }, [id]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <div className="w-16 h-16 border-8 border-black border-t-[#ccff00] rounded-full animate-spin"></div>
    </div>
  );

  if (!data) return (
    <div className="max-w-2xl mx-auto py-32 text-center">
      <h2 className="text-6xl font-black uppercase mb-8">Not Found</h2>
      <Link href="/audit">
        <NeoButton>Start Your Own Audit</NeoButton>
      </Link>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      {data && (
        <>
          <title>CredX Audit — ${data.results.totalAnnualSavings.toLocaleString()} Savings</title>
          <meta property="og:title" content={`AI Spend Audit: Found $${data.results.totalAnnualSavings.toLocaleString()} in savings!`} />
          <meta property="og:image" content={`/api/og?savings=${data.results.totalAnnualSavings}`} />
          <meta property="og:description" content={data.summary} />
        </>
      )}
      <div className="mb-12 flex justify-between items-center">
        <NeoBadge color="bg-black text-[#ccff00]">Public Audit Report</NeoBadge>
        <Link href="/audit">
          <NeoButton variant="white" size="sm">Get Your Own Savings →</NeoButton>
        </Link>
      </div>

      <ResultsHero result={data.results} />

      <div className="mt-16">
        <NeoCard color="bg-white" className="border-purple-500 shadow-[8px_8px_0px_0px_#a855f7]">
          <div className="flex items-center gap-2 mb-6 text-purple-600">
            <Sparkles size={24} />
            <span className="font-black uppercase text-xl">Audit Insights</span>
          </div>
          <p className="text-2xl md:text-3xl font-medium leading-tight italic">
            "{data.summary}"
          </p>
        </NeoCard>
      </div>

      <ToolBreakdownTable result={data.results} />

      <div className="mt-24 text-center pb-20">
        <h2 className="text-4xl md:text-6xl font-black uppercase mb-8">What are you <br /> <span className="text-outline">Spending?</span></h2>
        <Link href="/audit">
          <NeoButton variant="lime" size="lg" className="mx-auto">
            Audit My Team Now <ArrowRight size={24} />
          </NeoButton>
        </Link>
      </div>
    </div>
  );
}
