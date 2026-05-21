import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, hasSupabaseAdminKey } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return new NextResponse("Missing email parameter", { status: 400 });
    }

    if (hasSupabaseAdminKey && supabaseAdmin) {
      const { error } = await supabaseAdmin
        .from("unsubscribes")
        .upsert({ email: email.toLowerCase().trim() }, { onConflict: "email" });

      if (error) {
        console.error("Failed to unsubscribe:", error);
        throw error;
      }
    }

    // Return HTML confirmation page in Neo-Brutalist styling
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Unsubscribed — CredX</title>
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&display=swap" rel="stylesheet">
        <style>
          body {
            background-color: #f3f4f6;
            color: #121212;
            font-family: 'Space Grotesk', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
          }
          .card {
            border: 4px solid #121212;
            background: #ffffff;
            padding: 40px;
            max-width: 500px;
            text-align: center;
            box-shadow: 8px 8px 0px 0px rgba(0,0,0,1);
            border-radius: 16px;
          }
          h1 {
            font-size: 3rem;
            text-transform: uppercase;
            margin-top: 0;
            margin-bottom: 20px;
            background-color: #ccff00;
            display: inline-block;
            padding: 5px 15px;
            border: 4px solid #121212;
            transform: rotate(-1deg);
          }
          p {
            font-size: 1.25rem;
            line-height: 1.5;
            margin-bottom: 30px;
          }
          .btn {
            display: inline-block;
            background-color: #121212;
            color: #ffffff;
            font-weight: bold;
            text-decoration: none;
            padding: 12px 30px;
            border: 4px solid #121212;
            border-radius: 9999px;
            text-transform: uppercase;
            box-shadow: 4px 4px 0px 0px #ccff00;
            transition: all 0.2s;
          }
          .btn:hover {
            box-shadow: none;
            transform: translate(2px, 2px);
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Done!</h1>
          <p>You have been successfully unsubscribed from CredX re-audit emails for <strong>${email}</strong>.</p>
          <a href="https://credex-mocha.vercel.app" class="btn">Go to CredX</a>
        </div>
      </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (error: any) {
    console.error("Unsubscribe error:", error);
    return new NextResponse("An error occurred while unsubscribing.", { status: 500 });
  }
}
