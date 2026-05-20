import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, hasSupabaseAdminKey } from "@/lib/supabase";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  if (!hasSupabaseAdminKey || !supabaseAdmin) {
    return NextResponse.json({ error: "No database configured" }, { status: 503 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("audits")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (e: any) {
    console.error("GET /api/audit/[id] failed:", e?.message || e);
    return NextResponse.json({ error: "Failed to fetch audit" }, { status: 500 });
  }
}
