# ROUND2_PR.md

## What this PR does
This PR adds the "Re-audit on Pricing Change" feature to the CredX AI Spend Audit tool. It introduces:
1. Persistent audits and leads data linking: We store the pricing snapshot at audit runtime and associate the user's email with their audit ID during lead generation.
2. A pricing-change detection job: A POST endpoint at `/api/detect-changes` which updates custom pricing overrides, matches affected users, calculates recommendation deltas, and dispatches a single consolidated HTML email per user via Nodemailer.
3. A visual comparison dashboard: A split-view comparative interface at `/re-audit/[id]` showing historical recommendations side-by-side with updated pricing options, highlighting exact savings discrepancies.
4. One-click unsubscribe mechanics to allow users to opt-out of recurring alerts from the email footer.

## Why
AI tooling plans are highly volatile. Static audits quickly become obsolete, costing users potential savings and diminishing the tool's utility. By providing automated email updates with a side-by-side comparison, we offer a continuous touchpoint that reactivates users. The target audience of startup founders and engineering managers receives actionable intelligence showing how market changes directly affect their bottom-line, establishing Credex as a long-term partner in AI spend optimization.

## How it works
The flowchart below illustrates the re-audit flow:

```
[User Audit Form]
       │
       ▼
[POST /api/audit] ──> Saves stack input, results, and pricing snapshot to Supabase (id, snapshot, inputs)
       │
[User inputs email in results page]
       │
       ▼
[POST /api/leads] ──> Updates Supabase audits table with email for that specific audit ID
       │
[Market Price Updates / Admin Action]
       │
       ▼
[POST /api/detect-changes] 
       ├─> Writes overrides (pricing_overrides table)
       ├─> Pulls all audits linked to emails (excluding unsubscribes)
       ├─> Computes runAudit(inputs, latestPricing)
       ├─> If (savings/rec changes) ──> Groups changes by email
       └─> Sends consolidated Nodemailer alert with /re-audit/[id] comparison links
```

## What I cut
- **Vercel Cron Trigger**: Vercel Cron requires paid plans or specific hosting setups that were complex to guarantee in a local sandbox setup. I chose to expose the manual trigger endpoint `/api/detect-changes` which is highly testable and compatible with external cron callers (e.g. GitHub Actions schedule, cron-job.org).
- **Interactive Re-recommender Drafts**: I initially wanted users to edit their stack dynamically within the diff view. I decided to keep the comparison page read-only for simplicity and speed, guiding users to "Run A Fresh Audit" to edit their inputs.
- **Detailed Email Logging History**: Rather than tracking each sent email inside a dedicated database table, I relied on server logs and simple count returns to keep database schema changes minimal.

## How to test it manually
1. Start your local development server (`npm run dev`).
2. Run a new audit on `localhost:3000/audit` with:
   - Tool: **Cursor** (Business plan, 10 seats, spend $400)
   - Tool: **Claude** (Pro plan, 10 seats, spend $200, Use Case: general)
3. Note the generated Audit ID from the redirected results page (e.g., `results/your-id`), and enter your email address in the lead capture form to submit the PDF report.
4. Verify in the database (or server output) that the audit record is updated with your email address and pricing snapshot.
5. Simulate a Cursor pricing update by triggering `POST /api/detect-changes` using Postman, Curl, or PowerShell:
   ```bash
   Invoke-RestMethod -Uri "http://localhost:3000/api/detect-changes" -Method Post -ContentType "application/json" -Body '{"tool": "cursor", "plan": "pro", "new_price": 30}'
   ```
6. Check your email inbox. You should receive a single consolidated alert email detailing that Cursor has experienced pricing changes, showing how it impacts your audit, and providing a link.
7. Click the re-audit link in your email (or navigate directly to `http://localhost:3000/re-audit/your-id`). You will see a side-by-side comparative dashboard displaying your original recommendations versus the new recommendations under the $30 Cursor Pro pricing.

## What's tested
- **TypeScript & Next.js Compilations**: The project was fully compiled with zero build warnings.
- **`runAudit` calculations with custom pricing**: Verified that refactored engine correctly applies dynamic overrides.
- **Consolidation logic**: Tested that if a user has multiple affected audits, they only receive one combined email rather than separate spam emails.

## Open questions / risks
- **Email Delivery Reputation**: Sending high-frequency updates via Gmail SMTP with App Passwords can lead to rate limits or spam classification. For real-world production, this must be switched to a dedicated transactional mail system like Resend or Postmark with SPF/DKIM verification.
- **Database Schema Sync**: Changes to the `audits` table (adding `email` and `pricing_snapshot`) and the new `pricing_overrides` table must be applied manually to the production Supabase database instance. A migrations management utility would be critical as the team grows.
