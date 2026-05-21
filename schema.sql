-- SQL Schema Migration for CredX Round 2
-- Run these queries in your Supabase SQL Editor

-- 1. Add email and pricing_snapshot columns to the audits table if not already present
ALTER TABLE audits 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS pricing_snapshot JSONB;

-- 2. Create pricing_overrides table to store custom pricing updates
CREATE TABLE IF NOT EXISTS pricing_overrides (
  tool_id TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  price_monthly NUMERIC NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (tool_id, plan_id)
);

-- 3. Create unsubscribes table to track users who opt out of re-audit emails
CREATE TABLE IF NOT EXISTS unsubscribes (
  email TEXT PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable Row Level Security (RLS) on new tables
ALTER TABLE pricing_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE unsubscribes ENABLE ROW LEVEL SECURITY;

-- 5. Create policies to allow service role / admin client to read/write freely
-- Note: Service role (admin) client automatically bypasses RLS, but these policies are good practice.
CREATE POLICY "Allow all actions for service role on pricing_overrides" 
ON pricing_overrides FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all actions for service role on unsubscribes" 
ON unsubscribes FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Allow public read on pricing overrides
CREATE POLICY "Allow public read-only access on pricing_overrides" 
ON pricing_overrides FOR SELECT 
TO anon, authenticated 
USING (true);

-- Allow public insert on unsubscribes (for one-click unsubscribe)
CREATE POLICY "Allow public inserts on unsubscribes" 
ON unsubscribes FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);
