"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailFromUrl);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch(`/api/unsubscribe?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        setStatus("done");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center px-6">
      <div className="max-w-lg w-full">

        {status === "done" ? (
          /* ── SUCCESS STATE ─────────────────────────────────── */
          <div className="border-4 border-black bg-white rounded-2xl p-10 shadow-[8px_8px_0px_0px_#000] text-center">
            <div className="text-6xl mb-6">✅</div>
            <h1 className="text-4xl font-black uppercase mb-4">Unsubscribed</h1>
            <p className="font-bold text-lg opacity-70 mb-8">
              <strong>{email}</strong> has been removed from all CredX pricing change notifications.
            </p>
            <p className="text-sm opacity-50 mb-8">
              You will no longer receive re-audit alerts from us. Your original audit results are still saved — you can always run a new audit anytime.
            </p>
            <Link
              href="/audit"
              className="inline-block bg-black text-[#ccff00] font-black uppercase px-8 py-4 rounded-full border-4 border-black shadow-[4px_4px_0px_0px_#333] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#333] transition-all"
            >
              Run a New Audit →
            </Link>
          </div>
        ) : (
          /* ── FORM STATE ────────────────────────────────────── */
          <div className="border-4 border-black bg-white rounded-2xl p-10 shadow-[8px_8px_0px_0px_#000]">
            <div className="mb-8">
              <p className="text-xs font-black uppercase tracking-widest mb-2 opacity-40">CredX Notifications</p>
              <h1 className="text-4xl font-black uppercase leading-tight">Unsubscribe from<br />Pricing Alerts</h1>
              <p className="mt-4 font-medium opacity-70 leading-relaxed">
                Enter your email below to stop receiving notifications when AI tool pricing changes affect your spend audit.
              </p>
            </div>

            <form onSubmit={handleUnsubscribe} className="flex flex-col gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="border-4 border-black p-5 font-bold rounded-xl focus:outline-none focus:border-[#ccff00] text-black bg-[#f3f4f6] transition-colors"
                required
              />
              {status === "error" && (
                <p className="text-red-600 font-bold text-sm border-2 border-red-400 bg-red-50 px-4 py-3 rounded-xl">
                  Something went wrong. Please try again.
                </p>
              )}
              <button
                type="submit"
                disabled={status === "loading"}
                className="bg-black text-white font-black uppercase text-lg px-8 py-4 rounded-full border-4 border-black shadow-[4px_4px_0px_0px_#555] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#555] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "loading" ? "Processing..." : "Unsubscribe Me"}
              </button>
            </form>

            <p className="mt-6 text-xs opacity-40 text-center leading-relaxed">
              You will still be able to access your previous audit results. This only stops email notifications.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center">
        <div className="w-12 h-12 border-8 border-black border-t-[#ccff00] rounded-full animate-spin" />
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  );
}
