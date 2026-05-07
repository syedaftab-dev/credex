import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, hasSupabaseKeys } from "@/lib/supabase";
import { Resend } from "resend";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const resend = new Resend(process.env.RESEND_API_KEY || "");

const leadSchema = z.object({
  email: z.string().email(),
  company: z.string().optional(),
  auditId: z.string().required(),
  website: z.string().max(0).optional(), // Honeypot
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // 1. Honeypot check
    if (body.website) {
      return NextResponse.json({ success: true, message: "Bot detected" });
    }

    // 2. Validate
    const { email, company, auditId } = body;
    if (!email || !auditId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 3. Save to Supabase
    if (hasSupabaseKeys) {
      const { error } = await supabaseAdmin
        .from("leads")
        .insert([{
          email,
          company,
          audit_id: auditId,
          created_at: new Date().toISOString()
        }]);
      
      if (error) throw error;
    }

    // 4. Send Transactional Email via Resend
    if (process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: "Audit <audit@credex.com>",
          to: email,
          subject: "Your AI Spend Audit Report",
          html: `<p>Your audit is ready! View your savings here: ${process.env.NEXT_PUBLIC_APP_URL}/share/${auditId}</p>`,
        });
      } catch (e) {
        console.error("Email send failed", e);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Lead capture error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
