import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, hasSupabaseAdminKey } from "@/lib/supabase";
import { getMergedPricing } from "@/lib/pricing";
import { runAudit } from "@/lib/audit-engine";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch (e) {
      // Body is optional
    }

    const { tool, plan, new_price } = body;
    
    // 1. If tool and price provided, save to pricing_overrides table
    if (tool && new_price !== undefined && hasSupabaseAdminKey && supabaseAdmin) {
      const planId = plan || "pro";
      console.log(`Upserting pricing override: ${tool} ${planId} -> $${new_price}`);
      
      const { error: upsertError } = await supabaseAdmin
        .from("pricing_overrides")
        .upsert(
          {
            tool_id: tool,
            plan_id: planId,
            price_monthly: Number(new_price),
            updated_at: new Date().toISOString()
          },
          { onConflict: "tool_id,plan_id" }
        );
      
      if (upsertError) {
        console.error("Failed to save pricing override to DB:", upsertError.message || upsertError);
      }
    }

    // 2. Fetch the latest pricing merged with overrides
    let latestPricing = await getMergedPricing();
    
    // Fallback/Simulate in memory if DB connection is offline/unreachable or tables aren't set up yet
    if (tool && new_price !== undefined) {
      const planId = plan || "pro";
      if (latestPricing[tool]) {
        const p = latestPricing[tool].plans.find(x => x.id === planId);
        if (p) {
          p.priceMonthly = Number(new_price);
        }
      }
    }

    // 3. Check for admin keys
    if (!hasSupabaseAdminKey || !supabaseAdmin) {
      return NextResponse.json({ 
        success: false, 
        error: "Supabase keys missing. Cannot run change detection." 
      }, { status: 400 });
    }

    // 4. Fetch unsubscribed emails
    const unsubscribedEmails = new Set<string>();
    try {
      const { data: unsubscribedData, error: unsubError } = await supabaseAdmin
        .from("unsubscribes")
        .select("email");
      
      if (!unsubError && unsubscribedData) {
        unsubscribedData.forEach((row: any) => unsubscribedEmails.add(row.email.toLowerCase().trim()));
      }
    } catch (e) {
      console.error("Unsubscribes table fetch failed (may not exist yet):", e);
    }

    // 5. Fetch audits
    const { data: audits, error: auditsError } = await supabaseAdmin
      .from("audits")
      .select("*")
      .not("email", "is", null);

    if (auditsError) {
      console.error("Failed to fetch audits:", auditsError);
      return NextResponse.json({ error: "Failed to fetch audits" }, { status: 500 });
    }

    console.log(`Found ${audits?.length || 0} audits with emails to check.`);

    // 6. Run change detection logic
    const affectedAuditsGrouped: Record<string, Array<{
      auditId: string;
      changes: string[];
      oldSavings: number;
      newSavings: number;
    }>> = {};

    audits.forEach((audit: any) => {
      const email = audit.email.trim().toLowerCase();
      
      // Skip if user unsubscribed
      if (unsubscribedEmails.has(email)) {
        console.log(`Skipping unsubscribed user: ${email}`);
        return;
      }

      // Calculate new audit using latest pricing
      const newResult = runAudit(audit.input, latestPricing);
      const oldResult = audit.results;

      // Check for changes in recommendations or costs for their specific stack tools
      const changes: string[] = [];
      newResult.perTool.forEach((newTool) => {
        const oldTool = oldResult.perTool.find((t: any) => t.toolId === newTool.toolId);
        if (oldTool) {
          const costChanged = newTool.recommendedMonthlyCost !== oldTool.recommendedMonthlyCost;
          const planChanged = newTool.recommendedPlanId !== oldTool.recommendedPlanId;
          
          if (costChanged || planChanged) {
            changes.push(
              `${newTool.toolName}: Original audit recommended ${oldTool.recommendedPlanName} ($${oldTool.recommendedMonthlyCost}/mo). New pricing recommends ${newTool.recommendedPlanName} ($${newTool.recommendedMonthlyCost}/mo).`
            );
          }
        }
      });

      if (changes.length > 0) {
        if (!affectedAuditsGrouped[email]) {
          affectedAuditsGrouped[email] = [];
        }
        affectedAuditsGrouped[email].push({
          auditId: audit.id,
          changes,
          oldSavings: oldResult.totalMonthlySavings,
          newSavings: newResult.totalMonthlySavings
        });
      }
    });

    // 7. Send consolidated emails
    let emailsSentCount = 0;
    const emailRecipients: string[] = [];

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      for (const [email, userAudits] of Object.entries(affectedAuditsGrouped)) {
        console.log(`Sending consolidated re-audit email to: ${email}`);
        
        let auditsHtml = "";
        userAudits.forEach((ua) => {
          auditsHtml += `
            <div style="border: 4px solid #121212; padding: 20px; margin-bottom: 20px; background-color: #ffffff; box-shadow: 4px 4px 0px 0px #000000; border-radius: 8px;">
              <h3 style="margin-top: 0; text-transform: uppercase; font-size: 18px; border-bottom: 2px solid #121212; padding-bottom: 8px;">Audit Ref: ${ua.auditId}</h3>
              <ul style="padding-left: 20px; font-weight: 500; line-height: 1.6;">
                ${ua.changes.map(change => `<li style="margin-bottom: 8px;">${change}</li>`).join("")}
              </ul>
              <p style="margin-top: 15px;"><strong>Your savings projection changed:</strong> Monthly savings moved from $${ua.oldSavings} to $${ua.newSavings}.</p>
              <p style="margin-top: 20px;"><a href="${process.env.NEXT_PUBLIC_APP_URL}/re-audit/${ua.auditId}" style="display: inline-block; background-color: #ccff00; color: #000000; padding: 12px 24px; font-weight: bold; text-decoration: none; border: 3px solid #121212; border-radius: 9999px; text-transform: uppercase; box-shadow: 3px 3px 0px 0px #121212;">Compare & Re-run Audit →</a></p>
            </div>
          `;
        });

        const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/unsubscribe?email=${encodeURIComponent(email)}`;

        const htmlContent = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6; padding: 40px 20px; color: #121212; max-width: 600px; margin: 0 auto; border: 4px solid #121212; box-shadow: 8px 8px 0px 0px #000000; border-radius: 12px;">
            <div style="background-color: #ccff00; border: 3px solid #121212; padding: 15px; text-align: center; margin-bottom: 30px; border-radius: 8px; transform: rotate(-0.5deg);">
              <h2 style="font-size: 22px; text-transform: uppercase; font-weight: 900; margin: 0; tracking: -0.05em;">AI Tool Pricing Updates Detected!</h2>
            </div>
            <p style="font-size: 16px; line-height: 1.5; margin-bottom: 25px;">Pricing changes in the AI tooling market affect your previous spend audits. We've automatically re-analyzed your stacks with the new pricing:</p>
            
            ${auditsHtml}
            
            <hr style="border: 2px dashed #121212; margin: 40px 0 20px 0;" />
            <p style="font-size: 11px; color: #6b7280; text-align: center; line-height: 1.4;">
              You received this because you requested a spend audit roadmap from CredX. <br/>
              <a href="${unsubscribeUrl}" style="color: #121212; font-weight: bold; text-decoration: underline;">Unsubscribe from all future re-audit notifications</a>.
            </p>
          </div>
        `;

        try {
          await transporter.sendMail({
            from: `"CredX Audit" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Alert: AI Pricing Changes Affect Your Spend Audit",
            html: htmlContent,
          });
          emailsSentCount++;
          emailRecipients.push(email);
        } catch (mailError) {
          console.error(`Failed to send email to ${email}:`, mailError);
        }
      }
    } else {
      console.warn("SMTP environment variables missing. Emails were not sent.");
    }

    return NextResponse.json({
      success: true,
      updatedPricing: {
        tool,
        plan: plan || 'pro',
        new_price: new_price !== undefined ? Number(new_price) : null
      },
      auditsChecked: audits.length,
      affectedAuditsCount: Object.values(affectedAuditsGrouped).reduce((sum, list) => sum + list.length, 0),
      emailsSentCount,
      recipients: emailRecipients
    });

  } catch (error: any) {
    console.error("Detect changes error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
