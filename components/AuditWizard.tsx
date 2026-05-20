"use client";

import React, { useState } from "react";
import { NeoButton, NeoCard, NeoBadge } from "./ui/NeoBrutalism";
import { PRICING_DATA } from "@/lib/pricing";
import { ToolEntry } from "@/lib/audit-engine";
import { Plus, Trash2, ArrowRight, ArrowLeft, Play, Sparkles } from "lucide-react";
import { useLocalStorage } from "@/lib/hooks/useLocalStorage";
import { useRouter } from "next/navigation";

export function AuditWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [entries, setEntries] = useLocalStorage<ToolEntry[]>("credex-audit-draft", [
    { toolId: "cursor", planId: "pro", seats: 1, monthlySpend: 20, useCase: "coding" }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addEntry = () => {
    setEntries([...entries, { toolId: "claude", planId: "pro", seats: 1, monthlySpend: 20, useCase: "general" }]);
  };

  const removeEntry = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const updateEntry = (index: number, field: keyof ToolEntry, value: any) => {
    const newEntries = [...entries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    
    // Auto-update price if tool/plan changes and it's a known plan
    if (field === "toolId" || field === "planId" || field === "seats") {
      const tool = PRICING_DATA[newEntries[index].toolId];
      const plan = tool?.plans.find(p => p.id === newEntries[index].planId);
      if (plan) {
        newEntries[index].monthlySpend = plan.priceMonthly * newEntries[index].seats;
      }
    }
    
    setEntries(newEntries);
  };

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // API call to /api/audit
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries }),
      });
      const data = await res.json();
      if (data.id) {
        // Cache the full results in sessionStorage so the results page
        // can display them immediately without a round-trip to Supabase.
        sessionStorage.setItem(`audit_${data.id}`, JSON.stringify({
          results: data.results,
          ai_summary: data.summary,
        }));
        router.push(`/results/${data.id}`);
      } else {
        console.error("Audit API did not return an ID:", data);
        setIsSubmitting(false);
        alert("Failed to run audit. Please try again.");
      }
    } catch (error) {
      console.error("Audit failed", error);
      setIsSubmitting(false);
      alert("Network error. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      {/* STEPS INDICATOR */}
      <div className="flex justify-between mb-12 relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-black -z-10 -translate-y-1/2"></div>
        {[1, 2, 3].map((s) => (
          <div 
            key={s} 
            className={`w-12 h-12 rounded-full border-4 border-black flex items-center justify-center font-black text-xl transition-colors ${step >= s ? "bg-[#ccff00]" : "bg-white"}`}
          >
            {s}
          </div>
        ))}
      </div>

      {/* STEP 1: TOOLS & PLANS */}
      {step === 1 && (
        <div className="space-y-8">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-black uppercase tracking-tighter italic">Step 1: Your Stack</h2>
            <p className="text-neutral-600 font-medium">Add the AI tools your team uses monthly.</p>
          </div>

          <div className="space-y-6">
            {entries.map((entry, i) => (
              <NeoCard key={i} className="relative overflow-hidden group border-[#ccff00]">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase opacity-60">Tool</label>
                    <select 
                      value={entry.toolId} 
                      onChange={(e) => updateEntry(i, "toolId", e.target.value)}
                      className="w-full bg-white border-4 border-black p-3 font-bold uppercase rounded-lg focus:outline-none focus:ring-4 ring-[#ccff00]/30"
                    >
                      {Object.values(PRICING_DATA).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase opacity-60">Plan</label>
                    <select 
                      value={entry.planId} 
                      onChange={(e) => updateEntry(i, "planId", e.target.value)}
                      className="w-full bg-white border-4 border-black p-3 font-bold uppercase rounded-lg focus:outline-none focus:ring-4 ring-[#ccff00]/30"
                    >
                      {PRICING_DATA[entry.toolId]?.plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase opacity-60">Seats</label>
                    <input 
                      type="number" 
                      min="1" 
                      value={entry.seats} 
                      onChange={(e) => updateEntry(i, "seats", parseInt(e.target.value) || 1)}
                      className="w-full bg-white border-4 border-black p-3 font-bold uppercase rounded-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase opacity-60">Spend ($/mo)</label>
                    <input 
                      type="number" 
                      value={entry.monthlySpend} 
                      onChange={(e) => updateEntry(i, "monthlySpend", parseInt(e.target.value) || 0)}
                      className="w-full bg-white border-4 border-black p-3 font-bold uppercase rounded-lg"
                    />
                  </div>
                </div>

                <button 
                  onClick={() => removeEntry(i)}
                  className="absolute top-4 right-4 text-neutral-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </NeoCard>
            ))}
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mt-12">
            <button onClick={addEntry} className="flex items-center gap-2 font-black uppercase text-lg border-b-4 border-black hover:bg-[#ccff00] px-4 py-2 transition-all">
              <Plus size={24} /> Add Another Tool
            </button>
            <NeoButton variant="lime" size="lg" onClick={handleNext}>
              Next Step <ArrowRight size={24} />
            </NeoButton>
          </div>
        </div>
      )}

      {/* STEP 2: USE CASES */}
      {step === 2 && (
        <div className="space-y-8">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-black uppercase tracking-tighter italic">Step 2: Use Cases</h2>
            <p className="text-neutral-600 font-medium">Why do you use these? We use this to find redundancy.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {entries.map((entry, i) => (
              <NeoCard key={i} color="bg-white">
                <div className="flex items-center gap-4 mb-4">
                  <NeoBadge color="bg-black text-[#ccff00]">{PRICING_DATA[entry.toolId]?.name}</NeoBadge>
                  <span className="font-bold text-sm uppercase opacity-40">{entry.planId}</span>
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-black uppercase opacity-60">Primary Use Case</label>
                  <div className="grid grid-cols-1 gap-2">
                    {['coding', 'writing', 'research', 'general'].map((uc) => (
                      <button
                        key={uc}
                        onClick={() => updateEntry(i, "useCase", uc)}
                        className={`p-3 border-2 border-black font-bold uppercase text-left rounded-lg transition-all ${entry.useCase === uc ? "bg-[#ccff00] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" : "bg-white"}`}
                      >
                        {uc}
                      </button>
                    ))}
                  </div>
                </div>
              </NeoCard>
            ))}
          </div>

          <div className="flex justify-between items-center mt-12">
            <NeoButton variant="white" onClick={handleBack}>
              <ArrowLeft size={24} /> Back
            </NeoButton>
            <NeoButton variant="lime" size="lg" onClick={handleNext}>
              Final Review <ArrowRight size={24} />
            </NeoButton>
          </div>
        </div>
      )}

      {/* STEP 3: REVIEW & SUBMIT */}
      {step === 3 && (
        <div className="space-y-8">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-black uppercase tracking-tighter italic">Step 3: Review</h2>
            <p className="text-neutral-600 font-medium">Almost there. Let's run the audit engine.</p>
          </div>

          <NeoCard color="bg-black" className="text-white">
            <h3 className="text-2xl font-black uppercase mb-6 text-[#ccff00]">Audit Summary</h3>
            <div className="space-y-4">
              {entries.map((entry, i) => (
                <div key={i} className="flex justify-between items-center border-b border-white/20 pb-4">
                  <div>
                    <div className="font-black uppercase text-xl">{PRICING_DATA[entry.toolId]?.name}</div>
                    <div className="text-sm opacity-60 uppercase font-bold">{entry.seats} seat(s) • {entry.useCase}</div>
                  </div>
                  <div className="text-2xl font-black italic text-[#ccff00]">${entry.monthlySpend}/mo</div>
                </div>
              ))}
              <div className="flex justify-between items-center pt-4">
                <div className="text-2xl font-black uppercase">Total Monthly Spend</div>
                <div className="text-4xl font-black italic text-[#ccff00]">
                  ${entries.reduce((sum, e) => sum + e.monthlySpend, 0)}
                </div>
              </div>
            </div>
          </NeoCard>

          <div className="flex justify-between items-center mt-12">
            <NeoButton variant="white" onClick={handleBack}>
              <ArrowLeft size={24} /> Back
            </NeoButton>
            <NeoButton 
              variant="purple" 
              size="lg" 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={isSubmitting ? "opacity-50" : ""}
            >
              {isSubmitting ? "Analyzing..." : "Run Audit Now"} <Sparkles size={24} />
            </NeoButton>
          </div>
        </div>
      )}
    </div>
  );
}
