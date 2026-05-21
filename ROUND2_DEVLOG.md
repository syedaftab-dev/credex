# ROUND2_DEVLOG.md

## 2026-05-20 10:00 Start
Received Round 2 assignment. Reviewed requirements carefully: short 36h timeline, focused on "Re-audit on Pricing Change", requires database persistence of snapshot, automated delta comparison, and single consolidated email alerts with opt-out mechanisms. Spent 30 minutes planning routes, schema changes, and logic flow.

## 2026-05-20 10:35 Decided on approach
Decided to build on our Round 1 Supabase and Nodemailer (Gmail App Passwords) stack. I will use standard migrations for the DB schema updates (adding `email` and `pricing_snapshot` to `audits`, and creating `pricing_overrides` and `unsubscribes` tables).

## 2026-05-20 11:15 Refactoring audit engine
Refactored `runAudit` inside `lib/audit-engine.ts` to accept an optional `customPricing` map. This allows us to run audits on the same inputs but compare output results using two different pricing sets: the original historical snapshot and the latest pricing table.

## 2026-05-20 12:00 Persistence updates in audit route
Updated `app/api/audit/route.ts` to include the full `PRICING_DATA` snapshot in the database record at the time the audit is first generated. This protects audits from being affected retrospectively unless explicitly compared.

## 2026-05-20 13:10 Linking emails to audit records
Modified `app/api/leads/route.ts` so that when a user provides their email in the lead generation step, we update the matching audit record with their email. This correctly ties user emails to audit instances so we know who to alert when pricing changes occur.

## 2026-05-20 14:05 Building database overrides fetcher
Implemented `getMergedPricing` inside `lib/pricing.ts`. It fetches all manual price overrides from the database and merges them with the hardcoded base `PRICING_DATA`. This is resilient, handles server restarts, and operates efficiently in serverless environments.

## 2026-05-20 15:10 Writing change detection API
Created `/api/detect-changes`. The endpoint handles manual pricing overrides via POST requests (e.g. `{ tool: 'cursor', new_price: 30 }`), upserts them to `pricing_overrides`, fetches all user audits, performs comparative runs, and identifies affected systems.

## 2026-05-20 16:15 Adding notifications & unsubscribe support
Integrated Nodemailer transporter inside the change detection flow. Grouped all affected audits by email and sent a single HTML-formatted consolidated alert. Added an unsubscribe API endpoint `/api/unsubscribe` and included one-click unsubscribe links in email footers.

## 2026-05-20 17:05 Creating side-by-side comparison page
Built the comparative re-audit interface at `/re-audit/[id]/page.tsx`. It displays the original savings vs the new savings as the headline, highlights exactly which tool pricing changes affected them, and mutes/collapses identical tool recommendations to keep focus on changes.

## 2026-05-20 17:40 Running build and cleanup
Checked all TypeScript declarations. Executed a full production build (`npm run build`) which succeeded with no errors. Cleaned up scratch scripts and drafted the documentation.
