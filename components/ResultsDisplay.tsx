"use client";

import React from "react";
import { NeoCard, NeoBadge, NeoButton } from "./ui/NeoBrutalism";
import { TrendingDown, Calendar, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { AuditResult } from "@/lib/audit-engine";

export function ResultsHero({ result }: { result: AuditResult }) {
  const annualSavings = result.totalMonthlySavings * 12;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* TOTAL SAVINGS CARD */}
        <NeoCard color="bg-[#ccff00]" className="md:col-span-2 flex flex-col justify-center py-12">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown size={32} />
            <span className="font-black uppercase text-xl">Total Annual Savings</span>
          </div>
          <div className="text-[5rem] md:text-[8rem] font-black italic leading-none tracking-tighter">
            ${annualSavings.toLocaleString()}
          </div>
          <div className="mt-6 flex items-center gap-4">
            <NeoBadge color="bg-black text-white">Estimated ROI</NeoBadge>
            <span className="font-bold text-xl uppercase italic">
              +${result.totalMonthlySavings.toLocaleString()} / month
            </span>
          </div>
        </NeoCard>

        {/* HEALTH CHECK CARD */}
        <NeoCard color={result.isHealthy ? "bg-blue-400" : "bg-orange-400"} className="flex flex-col justify-between">
          <div>
            <div className="font-black uppercase text-xl mb-4">Efficiency Score</div>
            <div className="text-6xl font-black italic mb-4">
              {result.isHealthy ? "92%" : "45%"}
            </div>
          </div>
          <div className="font-bold uppercase text-sm italic leading-tight">
            {result.isHealthy 
              ? "Your team is running a tight ship. Minimal waste detected." 
              : "Significant waste detected. You are likely overpaying by 50% or more."}
          </div>
        </NeoCard>
      </div>

      {result.showCredex && (
        <NeoCard color="bg-purple-500" className="text-white border-white">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="space-y-4">
              <h3 className="text-4xl font-black uppercase tracking-tighter">Massive Savings Opportunity</h3>
              <p className="text-xl font-medium italic">You're losing over $500/mo. Credex can help you secure bulk credits and enterprise discounts at 30-50% off.</p>
            </div>
            <a href="https://credex.com" target="_blank" rel="noopener noreferrer">
              <NeoButton variant="lime" size="lg">
                Talk to Credex <ArrowRight size={24} />
              </NeoButton>
            </a>
          </div>
        </NeoCard>
      )}
    </div>
  );
}

export function ToolBreakdownTable({ result }: { result: AuditResult }) {
  return (
    <div className="space-y-8 mt-16">
      <h2 className="text-5xl font-black uppercase tracking-tighter italic">Per-Tool Breakdown</h2>
      
      <div className="space-y-6">
        {result.perTool.map((tool, i) => (
          <NeoCard key={i} color="bg-white" className="p-0 overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="bg-black text-white p-8 md:w-1/3 flex flex-col justify-between">
                <div>
                  <div className="text-[#ccff00] font-black uppercase text-sm mb-2">Tool</div>
                  <h3 className="text-3xl font-black uppercase leading-none">{tool.toolName}</h3>
                  <div className="mt-2 text-sm font-bold opacity-60 uppercase">{tool.currentPlanName} Plan</div>
                </div>
                <div className="mt-8">
                  <div className="text-4xl font-black italic text-[#ccff00]">${tool.currentMonthlyCost}</div>
                  <div className="text-xs font-bold uppercase opacity-60 mt-1">Current Monthly</div>
                </div>
              </div>

              <div className="p-8 flex-1 flex flex-col justify-between bg-white text-black">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    {tool.monthlySavings > 0 ? (
                      <AlertCircle className="text-orange-500 shrink-0 mt-1" />
                    ) : (
                      <CheckCircle2 className="text-blue-500 shrink-0 mt-1" />
                    )}
                    <div className="font-black uppercase text-xl leading-tight">
                      {tool.reason}
                    </div>
                  </div>
                  
                  {tool.monthlySavings > 0 && (
                    <div className="bg-orange-100 border-2 border-orange-400 p-4 rounded-lg">
                      <div className="text-xs font-black uppercase text-orange-600 mb-1">Recommendation</div>
                      <div className="font-bold">
                        Switch to <span className="underline">{tool.recommendedPlanName}</span> to save <span className="text-orange-600">${tool.monthlySavings}/mo</span>.
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-8 flex justify-between items-end">
                  <div className="flex gap-2">
                    <NeoBadge color="bg-neutral-100 text-neutral-600">ID: {tool.toolId}</NeoBadge>
                    {tool.isRedundant && <NeoBadge color="bg-red-100 text-red-600">Redundant</NeoBadge>}
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-black italic">${tool.recommendedMonthlyCost}</div>
                    <div className="text-xs font-bold uppercase opacity-60 mt-1">New Monthly</div>
                  </div>
                </div>
              </div>
            </div>
          </NeoCard>
        ))}
      </div>
    </div>
  );
}
