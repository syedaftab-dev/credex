import { NextResponse } from "next/server";
import { getMergedPricing } from "@/lib/pricing";

export async function GET() {
  try {
    const latestPricing = await getMergedPricing();
    return NextResponse.json(latestPricing);
  } catch (error: any) {
    console.error("Failed to fetch merged pricing:", error);
    return NextResponse.json({ error: "Failed to fetch pricing" }, { status: 500 });
  }
}
