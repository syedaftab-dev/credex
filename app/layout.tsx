import type { Metadata } from "next";
import { GlobalStyles } from "@/components/ui/NeoBrutalism";
import "./globals.css";

export const metadata: Metadata = {
  title: "CredX — AI Spend Audit",
  description: "Stop wasting money on AI subscriptions. Audit your spend and find savings in minutes.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    title: "CredX — AI Spend Audit",
    description: "Audit your startup's AI spend on Cursor, Claude, ChatGPT, and more.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <GlobalStyles />
      </head>
      <body className="antialiased">
        <nav className="fixed top-6 left-0 w-full z-50 flex justify-center px-4">
          <div className="bg-white border-4 border-black rounded-full px-2 py-2 flex items-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2 px-6">
              <div className="w-6 h-6 bg-black rounded-md"></div>
              <span className="font-bold text-xl tracking-tighter uppercase">CredX.</span>
            </div>

            <div className="hidden md:flex gap-2">
              <a href="/" className="px-6 py-2 font-bold uppercase hover:bg-neutral-100 rounded-full transition-colors">
                Home
              </a>
              <a href="/audit" className="px-6 py-2 font-bold uppercase hover:bg-neutral-100 rounded-full transition-colors">
                New Audit
              </a>
            </div>

            <a href="/audit">
              <button className="bg-[#ccff00] border-4 border-black rounded-full px-6 py-2 font-bold uppercase text-sm ml-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all">
                Start Audit
              </button>
            </a>
          </div>
        </nav>
        <main className="pt-24 min-h-screen">
          {children}
        </main>
        <footer className="py-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center border-t-4 border-black mt-20">
          <h2 className="text-[3rem] md:text-[6rem] font-black uppercase leading-[0.85] mb-12">
            Ready to <br /> <span className="text-purple-500">Save Money?</span>
          </h2>
          <div className="mt-10 w-full flex flex-col md:flex-row justify-between items-center gap-4 font-bold uppercase text-sm">
            <span>© 2026 CredX AI Spend Audit.</span>
            <div className="flex gap-4">
              <a href="https://credex.com" className="hover:underline text-black">Credex Main Site</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
