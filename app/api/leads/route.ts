import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, hasSupabaseAdminKey } from "@/lib/supabase";
import nodemailer from "nodemailer";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";



const leadSchema = z.object({
  email: z.string().email(),
  company: z.string().optional(),
  auditId: z.string().min(1),
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
    // 3. Save to Supabase
    if (hasSupabaseAdminKey && supabaseAdmin) {
      try {
        const { error } = await supabaseAdmin
          .from("leads")
          .insert([{
            email,
            company,
            audit_id: auditId,
            created_at: new Date().toISOString()
          }]);
        
        if (error) console.error("Leads insert error:", error);

        // Update the audit table to link the email to the audit record
        const { error: updateError } = await supabaseAdmin
          .from("audits")
          .update({ email })
          .eq("id", auditId);
        
        if (updateError) {
          console.error("Failed to update audit with email:", updateError);
        }
      } catch (dbError) {
        console.error("Database connection failed for leads insert, but continuing to email:", dbError);
      }
    }

    // 4. Send Transactional Email via Nodemailer
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      console.log("Attempting to send email via Nodemailer to:", email);
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        let attachments: any[] = [];

        // Generate PDF if data exists
        if (hasSupabaseAdminKey && supabaseAdmin) {
          const { data: auditData } = await supabaseAdmin
            .from('audits')
            .select('*')
            .eq('id', auditId)
            .single();

          if (auditData) {
            const jsPDF = (await import('jspdf')).jsPDF;
            const doc = new jsPDF();
            
            doc.setFontSize(22);
            doc.text("CredX AI Spend Audit Report", 20, 20);
            
            doc.setFontSize(12);
            doc.text(`Audit ID: ${auditId}`, 20, 35);
            doc.text(`Annual Savings: $${auditData.results.totalAnnualSavings.toLocaleString()}`, 20, 45);
            
            doc.setFontSize(14);
            doc.text("AI Summary:", 20, 60);
            doc.setFontSize(10);
            const splitSummary = doc.splitTextToSize(auditData.ai_summary || "No summary provided.", 170);
            doc.text(splitSummary, 20, 70);
            
            doc.setFontSize(14);
            doc.text("Recommended Changes:", 20, 110);
            let y = 120;
            auditData.results.perTool.forEach((tool: any) => {
              doc.setFontSize(10);
              doc.text(`• ${tool.toolId}: ${tool.reason}`, 20, y);
              y += 10;
            });

            const pdfBuffer = doc.output('arraybuffer');
            attachments.push({
              filename: `CredX_Audit_${auditId}.pdf`,
              content: Buffer.from(pdfBuffer),
            });
          }
        }

        await transporter.sendMail({
          from: `"CredX Audit" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: "Your AI Spend Audit Report & Savings Roadmap",
          html: `<p>Your audit is ready! Attached is your PDF breakdown.</p><p>View your live interactive roadmap here: ${process.env.NEXT_PUBLIC_APP_URL}/share/${auditId}</p>`,
          attachments: attachments,
        });

        console.log("Nodemailer Success: Email sent to", email);
      } catch (e) {
        console.error("Nodemailer Error:", e);
      }
    } else {
      console.warn("EMAIL_USER or EMAIL_PASS missing. Nodemailer skipped.");
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Lead capture error:", error.message || error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
