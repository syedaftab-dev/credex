"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { NeoCard, NeoBadge, NeoButton } from "@/components/ui/NeoBrutalism";
import { AuditResult, ToolAuditResult, runAudit } from "@/lib/audit-engine";
import { RefreshCw, ArrowRight, CheckCircle2, AlertTriangle, Sparkles, Sliders, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

export default function ReAuditPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [originalAudit, setOriginalAudit] = useState<{
    input: any[];
    results: AuditResult;
    pricing_snapshot: any;
    ai_summary: string;
    email: string | null;
  } | null>(null);
  
  const [latestPricing, setLatestPricing] = useState<any>(null);
  const [newAuditResults, setNewAuditResults] = useState<AuditResult | null>(null);
  const [showUnchanged, setShowUnchanged] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        let auditData: any = null;

        // 1. Fetch Audit Data — sessionStorage first, then API, then demo fallback
        if (id === "demo-audit") {
          // Demo mode: intentional mock
          setError("Showing demo re-audit comparison.");
          const mockSnapshot = {
            cursor: { id: 'cursor', name: 'Cursor', plans: [{ id: 'pro', name: 'Pro', priceMonthly: 20, type: 'individual' }, { id: 'teams', name: 'Business', priceMonthly: 40, type: 'team' }] },
            claude: { id: 'claude', name: 'Claude', plans: [{ id: 'pro', name: 'Pro', priceMonthly: 20, type: 'individual' }] }
          };
          auditData = {
            input: [
              { toolId: "cursor", planId: "teams", seats: 10, monthlySpend: 400, useCase: "coding" },
              { toolId: "claude", planId: "pro", seats: 10, monthlySpend: 200, useCase: "general" }
            ],
            results: {
              perTool: [
                { toolId: "cursor", toolName: "Cursor", currentPlanName: "Business", currentMonthlyCost: 400, recommendedPlanId: "pro", recommendedPlanName: "Pro", recommendedMonthlyCost: 200, monthlySavings: 200, reason: "10 users on Business plan but no org-wide features used. Switch to Pro seats.", isRedundant: false },
                { toolId: "claude", toolName: "Claude", currentPlanName: "Pro", currentMonthlyCost: 200, recommendedPlanId: "pro", recommendedPlanName: "Pro", recommendedMonthlyCost: 0, monthlySavings: 200, reason: "Redundant with Cursor for same use cases.", isRedundant: true }
              ],
              totalCurrentMonthly: 600, totalRecommendedMonthly: 200,
              totalMonthlySavings: 400, totalAnnualSavings: 4800,
              showCredex: false, isHealthy: false
            },
            pricing_snapshot: mockSnapshot,
            ai_summary: "Initial audit suggests consolidating Claude and migrating Cursor seats to Pro, yielding $4,800/yr savings.",
            email: "founder@startup.io"
          };
        } else {
          // Try sessionStorage first (populated immediately after wizard submit)
          const cached = sessionStorage.getItem(`audit_${id}`);
          if (cached) {
            const parsed = JSON.parse(cached);
            // sessionStorage stores { results, ai_summary } — we need input too
            // The wizard also caches input separately
            const cachedInput = sessionStorage.getItem(`audit_input_${id}`);
            if (parsed.results && cachedInput) {
              auditData = {
                input: JSON.parse(cachedInput),
                results: parsed.results,
                pricing_snapshot: null, // will use live pricing for comparison
                ai_summary: parsed.ai_summary,
                email: null
              };
            }
          }

          // Fall back to server-side API if sessionStorage didn't have it
          if (!auditData) {
            const res = await fetch(`/api/audit/${id}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            auditData = await res.json();
          }
        }

        // 2. Fetch latest pricing from API
        let currentPricingMap: any = null;
        try {
          const res = await fetch("/api/pricing");
          currentPricingMap = await res.json();
        } catch (pricingErr) {
          console.error("Failed to fetch latest pricing api, using dynamic fallback:", pricingErr);
        }

        // If fetch failed or we are in demo mode, mock a pricing update where Cursor Pro is now $30
        if (!currentPricingMap || id === "demo-audit") {
          // Clone mock snapshot but update Cursor Pro price to $30
          currentPricingMap = JSON.parse(JSON.stringify(auditData.pricing_snapshot || {}));
          if (currentPricingMap.cursor) {
            const proPlan = currentPricingMap.cursor.plans.find((p: any) => p.id === "pro");
            if (proPlan) proPlan.priceMonthly = 30; // Changed!
          }
        }

        // 3. Compute new audit results using latest pricing
        const recalculated = runAudit(auditData.input, currentPricingMap);

        setOriginalAudit(auditData);
        setLatestPricing(currentPricingMap);
        setNewAuditResults(recalculated);

      } catch (err: any) {
        console.error("Re-audit load error:", err);
        setError(`Failed to load audit comparison: ${err.message || err}`);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <div className="w-16 h-16 border-8 border-black border-t-[#a855f7] rounded-full animate-spin"></div>
      <h2 className="text-4xl font-black uppercase italic">Comparing Pricing Data...</h2>
    </div>
  );

  if (error && !originalAudit) return (
    <div className="max-w-2xl mx-auto py-32 text-center">
      <h2 className="text-6xl font-black uppercase mb-8">Comparison Error</h2>
      <p className="text-xl mb-8">{error}</p>
      <Link href="/audit">
        <NeoButton>Start New Audit</NeoButton>
      </Link>
    </div>
  );

  const orig = originalAudit!;
  const recalculated = newAuditResults!;

  // Calculations for headline
  const oldAnnualSavings = orig.results.totalAnnualSavings;
  const newAnnualSavings = recalculated.totalAnnualSavings;
  const savingsDelta = newAnnualSavings - oldAnnualSavings;

  const oldMonthlySpend = orig.results.totalRecommendedMonthly;
  const newMonthlySpend = recalculated.totalRecommendedMonthly;
  const spendDelta = newMonthlySpend - oldMonthlySpend;

  // Split tools into changed and unchanged
  const toolComparisons = orig.input.map((inputTool) => {
    const toolId = inputTool.toolId;
    const toolName = latestPricing?.[toolId]?.name || toolId;
    
    const oldRec = orig.results.perTool.find(t => t.toolId === toolId);
    const newRec = recalculated.perTool.find(t => t.toolId === toolId);
    
    // Find original price and new price for recommendation
    let oldPlanPrice = 0;
    let newPlanPrice = 0;
    
    if (oldRec) {
      const oldSnapshot = orig.pricing_snapshot?.[toolId];
      const plan = oldSnapshot?.plans?.find((p: any) => p.id === oldRec.recommendedPlanId);
      oldPlanPrice = plan ? plan.priceMonthly : (oldRec.recommendedMonthlyCost / inputTool.seats);
    }
    
    if (newRec && latestPricing) {
      const plan = latestPricing[toolId]?.plans?.find((p: any) => p.id === newRec.recommendedPlanId);
      newPlanPrice = plan ? plan.priceMonthly : (newRec.recommendedMonthlyCost / inputTool.seats);
    }

    const changed = 
      oldRec?.recommendedPlanId !== newRec?.recommendedPlanId || 
      oldRec?.recommendedMonthlyCost !== newRec?.recommendedMonthlyCost ||
      oldPlanPrice !== newPlanPrice;

    return {
      toolId,
      toolName,
      seats: inputTool.seats,
      currentSpend: inputTool.monthlySpend,
      oldRec,
      newRec,
      oldPlanPrice,
      newPlanPrice,
      changed
    };
  });

  const changedTools = toolComparisons.filter(t => t.changed);
  const unchangedTools = toolComparisons.filter(t => !t.changed);

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      {/* HEADER BANNER */}
      <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <NeoBadge color="bg-black text-[#ccff00]">Pricing Re-audit comparison</NeoBadge>
          <h1 className="text-4xl md:text-6xl font-black uppercase mt-2 leading-[0.9]">
            Audit <span className="text-outline">Re-run</span>
          </h1>
          <p className="text-neutral-500 font-bold uppercase text-xs mt-2">Audit ID: {id} • User: {orig.email || "Anonymous Lead"}</p>
        </div>
        <Link href={`/results/${id}`}>
          <NeoButton variant="white" size="sm">Back to Original Audit</NeoButton>
        </Link>
      </div>

      {error && (
        <div className="mb-8 bg-orange-100 border-4 border-black p-4 rounded-xl flex items-center gap-4 font-bold">
          <AlertTriangle className="text-orange-600 shrink-0" />
          {error}
        </div>
      )}

      {/* HEADLINE: TOTAL SAVINGS DELTA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <NeoCard color="bg-[#ccff00]" className="md:col-span-2 flex flex-col justify-center py-10 relative overflow-hidden">
          <div className="absolute right-4 top-4 text-black opacity-10 pointer-events-none">
            <RefreshCw size={120} className="animate-spin-slow" />
          </div>
          <div className="font-black uppercase text-sm opacity-60 mb-2">Total Savings Delta (Annual)</div>
          <div className="text-5xl md:text-7xl font-black italic leading-none tracking-tighter flex items-center gap-4">
            {savingsDelta >= 0 ? "+" : ""}${savingsDelta.toLocaleString()}
            <span className="text-2xl font-bold uppercase not-italic opacity-60">/ yr</span>
          </div>
          <div className="mt-6 text-sm font-bold uppercase leading-tight max-w-xl">
            {savingsDelta > 0 
              ? `🔥 Good news! AI pricing updates have revealed an extra $${savingsDelta.toLocaleString()} of yearly savings opportunities on your stack.`
              : savingsDelta < 0
              ? `⚠️ Heads up: AI pricing changes have reduced your total potential savings by $${Math.abs(savingsDelta).toLocaleString()}/yr.`
              : `🤝 AI tool pricing changes do not impact your total annual savings recommendation.`}
          </div>
        </NeoCard>

        <NeoCard color="bg-white" className="flex flex-col justify-between py-10">
          <div>
            <div className="font-black uppercase text-sm opacity-60 mb-2">New Recommended Spend</div>
            <div className="text-4xl md:text-5xl font-black italic">
              ${recalculated.totalRecommendedMonthly}/mo
            </div>
            <div className="text-xs font-bold uppercase opacity-40 mt-1">
              Was: ${orig.results.totalRecommendedMonthly}/mo
            </div>
          </div>
          <div className="mt-6">
            <div className="text-xs font-black uppercase opacity-60">Recommended budget impact</div>
            <div className={`text-xl font-bold uppercase ${spendDelta > 0 ? "text-red-500" : spendDelta < 0 ? "text-green-600" : "text-neutral-500"}`}>
              {spendDelta > 0 ? `+ $${spendDelta}/mo` : spendDelta < 0 ? `- $${Math.abs(spendDelta)}/mo` : "No Change"}
            </div>
          </div>
        </NeoCard>
      </div>

      {/* COMPARED STACK ITEMS */}
      <div className="space-y-8">
        <h2 className="text-4xl font-black uppercase tracking-tighter italic">Re-Audit breakdown</h2>
        
        {changedTools.length > 0 && (
          <div className="space-y-6">
            <div className="font-black text-lg text-orange-600 uppercase tracking-wider flex items-center gap-2">
              <Sliders size={20} /> Affected Items ({changedTools.length})
            </div>

            {changedTools.map((comp) => (
              <NeoCard key={comp.toolId} className="border-orange-500 shadow-[8px_8px_0px_0px_#fb923c] p-0 overflow-hidden bg-white">
                <div className="bg-black text-white p-6 flex flex-col md:flex-row justify-between items-start md:items-center border-b-4 border-black">
                  <div>
                    <span className="text-[#ccff00] font-black uppercase text-xs">AFFECTED TOOL</span>
                    <h3 className="text-3xl font-black uppercase leading-none mt-1">{comp.toolName}</h3>
                  </div>
                  <div className="mt-4 md:mt-0 flex gap-4 text-sm font-bold uppercase">
                    <div>Seats: <span className="text-[#ccff00]">{comp.seats}</span></div>
                    <div>Current cost: <span className="text-[#ccff00]">${comp.currentSpend}/mo</span></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 divide-y-4 md:divide-y-0 md:divide-x-4 divide-black">
                  {/* OLD RECOMMENDATION */}
                  <div className="p-8 bg-neutral-50 flex flex-col justify-between">
                    <div>
                      <div className="text-neutral-400 font-black uppercase text-xs mb-2">Previous Recommendation</div>
                      <div className="font-black text-2xl uppercase mb-3 text-neutral-600">
                        {comp.oldRec?.recommendedPlanName} plan
                      </div>
                      <p className="text-neutral-500 text-sm font-medium leading-relaxed italic">
                        "{comp.oldRec?.reason}"
                      </p>
                    </div>
                    <div className="mt-8 flex justify-between items-end border-t border-neutral-200 pt-4">
                      <div>
                        <div className="text-neutral-400 font-bold uppercase text-[10px]">Plan Price</div>
                        <div className="text-xl font-black text-neutral-500">${comp.oldPlanPrice}/mo</div>
                      </div>
                      <div className="text-right">
                        <div className="text-neutral-400 font-bold uppercase text-[10px]">Total Cost</div>
                        <div className="text-3xl font-black text-neutral-500">${comp.oldRec?.recommendedMonthlyCost}/mo</div>
                      </div>
                    </div>
                  </div>

                  {/* NEW RECOMMENDATION */}
                  <div className="p-8 bg-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-2 right-2">
                      <NeoBadge color="bg-[#fb923c] text-white">PRICE CHANGE</NeoBadge>
                    </div>
                    <div>
                      <div className="text-orange-600 font-black uppercase text-xs mb-2">New Recommendation</div>
                      <div className="font-black text-2xl uppercase mb-3 text-black">
                        {comp.newRec?.recommendedPlanName} plan
                      </div>
                      <p className="text-neutral-800 text-sm font-bold leading-relaxed italic">
                        "{comp.newRec?.reason}"
                      </p>
                    </div>
                    <div className="mt-8 flex justify-between items-end border-t-2 border-black pt-4">
                      <div>
                        <div className="text-neutral-500 font-bold uppercase text-[10px]">New Plan Price</div>
                        <div className="text-xl font-black text-orange-600">${comp.newPlanPrice}/mo</div>
                      </div>
                      <div className="text-right">
                        <div className="text-neutral-500 font-bold uppercase text-[10px]">New Total Cost</div>
                        <div className="text-3xl font-black text-black">${comp.newRec?.recommendedMonthlyCost}/mo</div>
                      </div>
                    </div>
                  </div>
                </div>
              </NeoCard>
            ))}
          </div>
        )}

        {/* UNCHANGED RECOMMENDATIONS SECTION */}
        {unchangedTools.length > 0 && (
          <div className="space-y-4">
            <button 
              onClick={() => setShowUnchanged(!showUnchanged)}
              className="flex items-center gap-2 font-black uppercase text-neutral-600 border-b-2 border-neutral-300 hover:text-black hover:border-black transition-all text-sm py-2"
            >
              {showUnchanged ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              {showUnchanged ? "Hide" : "Show"} Unchanged Items ({unchangedTools.length})
            </button>

            {showUnchanged && (
              <div className="space-y-4">
                {unchangedTools.map((comp) => (
                  <div key={comp.toolId} className="border-4 border-black p-6 rounded-xl bg-neutral-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h4 className="text-2xl font-black uppercase">{comp.toolName}</h4>
                      <p className="text-xs font-bold text-neutral-400 uppercase mt-1">
                        Recommendation unchanged: {comp.newRec?.recommendedPlanName} plan (${comp.newPlanPrice}/mo)
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <div className="text-[10px] font-bold text-neutral-400 uppercase">Monthly cost</div>
                        <div className="text-2xl font-black italic">${comp.newRec?.recommendedMonthlyCost}</div>
                      </div>
                      <CheckCircle2 className="text-blue-500" size={28} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* FINAL CALL TO ACTION */}
      <div className="mt-24 pb-20 text-center">
        <NeoCard color="bg-black" className="text-white py-12">
          <h3 className="text-3xl md:text-5xl font-black uppercase mb-4 text-[#ccff00]">Keep Your Costs Low</h3>
          <p className="max-w-xl mx-auto opacity-70 mb-8 font-medium">Pricing in the AI sector moves rapidly. Check back anytime, or let us monitor your stack and email you automatically when changes occur.</p>
          <Link href="/audit">
            <NeoButton variant="lime" className="mx-auto" size="lg">Run A Fresh Audit</NeoButton>
          </Link>
        </NeoCard>
      </div>
    </div>
  );
}
