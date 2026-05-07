import { NextRequest, NextResponse } from "next/server";
import { runAudit, ToolEntry } from "@/lib/audit-engine";
import { nanoid } from "nanoid";
import { supabaseAdmin, hasSupabaseKeys } from "@/lib/supabase";
import Anthropic from "@anthropic-ai/sdk";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

export async function POST(req: NextRequest) {
  try {
    const { entries } = await req.json() as { entries: ToolEntry[] };
    
    // 1. Run Audit Engine
    const results = runAudit(entries);
    const id = nanoid(12);

    // 2. Generate AI Summary
    let aiSummary = "";
    const prompt = `You are a financial advisor for startup CTOs. Given this AI tool spend data: ${JSON.stringify(entries)}.
            The audit found ${results.totalMonthlySavings} monthly savings.
            Write a single 100-word paragraph that:
            1. Acknowledges their current setup.
            2. Highlights the biggest savings opportunity found: ${results.perTool.map(t => t.reason).join(', ')}.
            3. Ends with a specific action they can take today to save money.
            Tone: direct, data-driven, not salesy. No bullet points.`;

    if (process.env.GOOGLE_AI_API_KEY) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        aiSummary = result.response.text();
      } catch (e) {
        console.error("Gemini failed", e);
      }
    } 
    
    if (!aiSummary && process.env.ANTHROPIC_API_KEY) {
      try {
        const response = await anthropic.messages.create({
          model: "claude-3-haiku-20240307",
          max_tokens: 300,
          messages: [{ role: "user", content: prompt }],
        });
        // @ts-ignore
        aiSummary = response.content[0].text;
      } catch (e) {
        console.error("Anthropic failed", e);
      }
    }

    if (!aiSummary) {
      aiSummary = `Your audit reveals a potential annual saving of $${results.totalAnnualSavings.toLocaleString()}. By consolidating redundant tools and optimizing seat counts, you can significantly reduce your overhead without losing capability. Start by reviewing the oversized plans identified in the report.`;
    }

    // 3. Save to Supabase
    if (hasSupabaseKeys) {
      const { error } = await supabaseAdmin
        .from('audits')
        .insert([{
          id,
          input: entries,
          results,
          ai_summary: aiSummary,
          created_at: new Date().toISOString()
        }]);
      
      if (error) throw error;
    } else {
      console.warn("Supabase keys missing. Audit not persisted.");
      // In a real dev environment, we might use a local DB or just mock it.
      // For now, we'll return the ID so the UI can proceed, but we'll need to handle
      // the fetch on the results page by falling back to local state if possible.
    }

    return NextResponse.json({ id, results, summary: aiSummary });
  } catch (error) {
    console.error("API Audit error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
