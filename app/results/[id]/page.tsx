"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { NeoCard, NeoButton } from "@/components/ui/NeoBrutalism";
import { ResultsHero, ToolBreakdownTable } from "@/components/ResultsDisplay";
import { AuditResult } from "@/lib/audit-engine";
import { supabase, hasSupabaseKeys } from "@/lib/supabase";
import { Mail, Share2, Sparkles, AlertTriangle } from "lucide-react";

export default function ResultsPage() {
  const { id } = useParams();
  const [data, setData] = useState<{ results: AuditResult; summary: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResult() {
      if (!hasSupabaseKeys) {
        // Mock data for demo if no keys
        setError("Database keys missing. Showing demo data.");
        setData({
          results: {
            perTool: [
              { toolId: "cursor", toolName: "Cursor", currentPlanName: "Business", currentMonthlyCost: 400, recommendedPlanId: "pro", recommendedPlanName: "Pro", recommendedMonthlyCost: 200, monthlySavings: 200, reason: "10 users on Business plan but no org-wide features used. Switch to Pro seats.", isRedundant: false },
              { toolId: "claude", toolName: "Claude", currentPlanName: "Pro", currentMonthlyCost: 200, recommendedPlanId: "pro", recommendedPlanName: "Pro", recommendedMonthlyCost: 0, monthlySavings: 200, reason: "Redundant with ChatGPT Plus for the same team.", isRedundant: true },
            ],
            totalCurrentMonthly: 600,
            totalRecommendedMonthly: 200,
            totalMonthlySavings: 400,
            totalAnnualSavings: 4800,
            showCredex: false,
            isHealthy: false,
          },
          summary: "Your team is currently splitting focus between Claude and ChatGPT, resulting in $2,400 of annual waste. By consolidating on one platform and optimizing your Cursor seats, you can save $4,800 this year. We recommend migrating to a unified platform by the end of the month."
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
        setError("Audit not found.");
      } finally {
        setLoading(false);
      }
    }

    fetchResult();
  }, [id]);

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingLead(true);
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, auditId: id, website: "" }),
      });
      setSubmitted(true);
    } catch (e) {
      console.error("Lead submission failed", e);
    } finally {
      setIsSubmittingLead(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <div className="w-16 h-16 border-8 border-black border-t-[#ccff00] rounded-full animate-spin"></div>
      <h2 className="text-4xl font-black uppercase italic">Analyzing Data...</h2>
    </div>
  );

  if (!data) return (
    <div className="max-w-2xl mx-auto py-32 text-center">
      <h2 className="text-6xl font-black uppercase mb-8">404: Not Found</h2>
      <NeoButton onClick={() => window.location.href = '/audit'}>Start New Audit</NeoButton>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      {error && (
        <div className="mb-12 bg-orange-100 border-4 border-black p-4 rounded-xl flex items-center gap-4 font-bold">
          <AlertTriangle className="text-orange-600" />
          {error}
        </div>
      )}

      <ResultsHero result={data.results} />

      <div className="mt-8 flex justify-end no-print">
        <NeoButton variant="white" size="sm" onClick={() => window.print()}>
          Download PDF Report
        </NeoButton>
      </div>

      {/* AI SUMMARY */}
      <div className="mt-16">
        <NeoCard color="bg-white" className="border-purple-500 shadow-[8px_8px_0px_0px_#a855f7]">
          <div className="flex items-center gap-2 mb-6 text-purple-600">
            <Sparkles size={24} />
            <span className="font-black uppercase text-xl">AI Insights</span>
          </div>
          <p className="text-2xl md:text-3xl font-medium leading-tight italic">
            "{data.summary}"
          </p>
        </NeoCard>
      </div>

      <ToolBreakdownTable result={data.results} />

      {/* LEAD CAPTURE SECTION */}
      <div className="mt-24 text-center lead-capture-section no-print">
        <NeoCard color="bg-black" className="text-white py-16">
          {submitted ? (
            <div className="space-y-6">
              <div className="text-6xl font-black text-[#ccff00]">DONE!</div>
              <p className="text-xl font-bold uppercase italic">Report sent to {email}. Check your inbox.</p>
            </div>
          ) : (
            <>
              <h2 className="text-5xl md:text-7xl font-black uppercase mb-6">Get the full report.</h2>
              <p className="text-xl opacity-60 mb-12 max-w-xl mx-auto">We'll send a detailed PDF breakdown and a custom savings roadmap to your inbox.</p>
              
              <form onSubmit={handleLeadSubmit} className="max-w-md mx-auto flex flex-col gap-4">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email" 
                  className="bg-white border-4 border-[#ccff00] p-5 text-black font-bold rounded-xl focus:outline-none"
                  required
                />
                <NeoButton 
                  variant="lime" 
                  size="lg" 
                  type="submit"
                  disabled={isSubmittingLead}
                >
                  {isSubmittingLead ? "Sending..." : "Send PDF Report"} <Mail size={24} />
                </NeoButton>
              </form>
              <p className="mt-6 text-xs font-bold uppercase opacity-40 italic">No spam. Just savings. 10k audits delivered.</p>
            </>
          )}
        </NeoCard>
      </div>
    </div>
  );
}
