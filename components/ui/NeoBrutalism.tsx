"use client";

import React from "react";
import { Star } from "lucide-react";

/**
 * NEO-BRUTALIST DESIGN SYSTEM
 * Adapted for CredX AI Spend Audit
 */

export function GlobalStyles() {
  return (
    <style jsx global>{`
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;700&display=swap');

      :root {
        --c-bg: #f3f4f6;
        --c-black: #121212;
        --c-lime: #ccff00;
        --c-purple: #a855f7;
        --c-orange: #fb923c;
        --c-blue: #3b82f6;
      }

      body {
        background-color: var(--c-bg);
        color: var(--c-black);
        font-family: 'Space Grotesk', sans-serif;
        overflow-x: hidden;
      }

      .text-outline {
        -webkit-text-stroke: 2px black;
        color: transparent;
      }
      
      .text-outline-white {
         -webkit-text-stroke: 2px white;
         color: transparent;
      }

      ::selection {
        background-color: var(--c-black);
        color: var(--c-lime);
      }

      ::-webkit-scrollbar {
          width: 8px;
      }
      ::-webkit-scrollbar-track {
          background: var(--c-bg);
      }
      ::-webkit-scrollbar-thumb {
          background: var(--c-black);
          border: 2px solid var(--c-bg);
          border-radius: 10px;
      }
    `}</style>
  );
}

interface NeoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "lime" | "black" | "white" | "purple" | "orange" | "blue";
  size?: "sm" | "md" | "lg";
}

export function NeoButton({ 
  children, 
  variant = "lime", 
  size = "md",
  className = "", 
  ...props 
}: NeoButtonProps) {
  const variants = {
    lime: "bg-[#ccff00] text-black",
    black: "bg-black text-white",
    white: "bg-white text-black",
    purple: "bg-purple-500 text-white",
    orange: "bg-orange-400 text-black",
    blue: "bg-blue-500 text-white",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-8 py-3 text-base",
    lg: "px-12 py-5 text-xl",
  };

  return (
    <button 
      className={`
        relative font-bold uppercase tracking-wider border-4 border-black rounded-full 
        shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] 
        transition-all duration-200 ${variants[variant]} ${sizes[size]} ${className} flex items-center gap-2 justify-center
      `}
      {...props}
    >
      {children}
    </button>
  );
}

export function NeoCard({ 
  children, 
  className = "", 
  color = "bg-white",
  noHover = false 
}: { 
  children: React.ReactNode; 
  className?: string; 
  color?: string;
  noHover?: boolean;
}) {
  return (
    <div className={`
      border-4 border-black rounded-2xl p-8 
      shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] 
      ${!noHover ? "hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1" : ""}
      transition-all duration-300 ${color} ${className}
    `}>
      {children}
    </div>
  );
}

export function NeoBadge({ children, color = "bg-[#ccff00]", className = "" }: { children: React.ReactNode; color?: string; className?: string }) {
  return (
    <div className={`inline-block border-2 border-black px-4 py-1 rounded-full font-bold uppercase tracking-wider text-xs ${color} ${className}`}>
      {children}
    </div>
  );
}

export function FloatingElement({ children, className }: { children: React.ReactNode; className: string }) {
  return (
    <div className={`absolute ${className} pointer-events-none animate-float`}>
      <div className="border-4 border-black rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        {children}
      </div>
    </div>
  );
}

export function SectionHeading({ 
  title, 
  subtitle, 
  outlineText 
}: { 
  title: string; 
  subtitle?: string; 
  outlineText?: string;
}) {
  return (
    <div className="mb-16">
      {subtitle && <div className="text-purple-600 font-bold text-xl mb-4 uppercase tracking-[0.2em]">{subtitle}</div>}
      <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9]">
        {title} {outlineText && <br />}
        {outlineText && <span className="text-outline">{outlineText}</span>}
      </h2>
    </div>
  );
}
